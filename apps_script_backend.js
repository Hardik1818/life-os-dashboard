/**
 * =========================================================================
 * LIFE OS — GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * =========================================================================
 * 
 * HOW TO DEPLOY:
 * 1. Go to https://script.google.com and click "New project".
 * 2. Rename project to "Life OS Backend".
 * 3. Replace all code in Code.gs with this entire file.
 * 4. Click "Deploy" > "New deployment".
 * 5. Select type: "Web app".
 *    - Description: "Life OS API with Live RSS Feeds"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"
 * 6. Click "Deploy", authorize access with your Google account.
 * 7. Copy the "Web app URL" (ends in /exec) and paste it into the Life OS
 *    Settings page under "Google Sheets & Apps Script Sync".
 * =========================================================================
 */

const SPREADSHEET_NAME = "Life OS Database";

const RSS_FEEDS = [
  { category: "Tech", source: "Hacker News", url: "https://news.ycombinator.com/rss" },
  { category: "Tech", source: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
  { category: "Science", source: "Nature News", url: "https://www.nature.com/nature.rss" },
  { category: "Health", source: "Harvard Health", url: "https://www.health.harvard.edu/blog/feed" },
  { category: "Design", source: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/" },
  { category: "Culture", source: "The Atlantic", url: "https://www.theatlantic.com/feed/all/" },
];

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  const ss = SpreadsheetApp.create(SPREADSHEET_NAME);
  initSheets(ss);
  return ss;
}

function initSheets(ss) {
  const schema = [
    { name: "Tasks", headers: ["id", "title", "area", "priority", "due_date", "done", "created_at"] },
    { name: "Habits", headers: ["id", "title", "cue", "sort_order"] },
    { name: "HabitLogs", headers: ["id", "habit_id", "log_date"] },
    { name: "Journal", headers: ["id", "entry_date", "mood", "body", "created_at"] },
    { name: "CalendarEvents", headers: ["id", "title", "kind", "event_date", "time", "duration", "meta"] },
    { name: "HealthLogs", headers: ["id", "log_date", "sleep_minutes", "steps", "workouts", "mood_rating", "stress_level", "notes"] },
  ];

  schema.forEach(s => {
    let sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
      sheet.appendRow(s.headers);
      sheet.getRange(1, 1, 1, s.headers.length).setFontWeight("bold").setBackground("#EEF2FF");
      sheet.setFrozenRows(1);
    }
  });

  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const ss = getOrCreateSpreadsheet();
    let result = { success: true };

    switch (action) {
      case "syncAll":
        result.data = getAllData(ss);
        break;

      case "getNews":
        result.articles = fetchLiveRSSNews();
        break;

      case "saveTasks":
        replaceSheetData(ss, "Tasks", data.tasks);
        break;

      case "saveHabits":
        replaceSheetData(ss, "Habits", data.habits);
        break;

      case "saveHabitLogs":
        replaceSheetData(ss, "HabitLogs", data.logs);
        break;

      case "saveJournal":
        replaceSheetData(ss, "Journal", data.entries);
        break;

      case "saveCalendarEvents":
        replaceSheetData(ss, "CalendarEvents", data.events);
        break;

      case "saveHealthLogs":
        replaceSheetData(ss, "HealthLogs", data.logs);
        break;

      case "getGoogleCalendarEvents":
        result.events = getGoogleCalendarEvents(data.daysAhead || 14);
        break;

      default:
        result = { success: false, error: "Unknown action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "syncAll";
    let result = { success: true };

    if (action === "getNews") {
      result.articles = fetchLiveRSSNews();
    } else {
      const ss = getOrCreateSpreadsheet();
      result.data = getAllData(ss);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllData(ss) {
  return {
    tasks: getSheetObjects(ss, "Tasks"),
    habits: getSheetObjects(ss, "Habits"),
    habit_logs: getSheetObjects(ss, "HabitLogs"),
    journal: getSheetObjects(ss, "Journal"),
    calendar_events: getSheetObjects(ss, "CalendarEvents"),
    health_logs: getSheetObjects(ss, "HealthLogs"),
    google_calendar: getGoogleCalendarEvents(14),
    news: fetchLiveRSSNews(),
  };
}

function getSheetObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      obj[h] = val;
    });
    return obj;
  });
}

function replaceSheetData(ss, sheetName, items) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || !items) return;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  sheet.clearContents();
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#EEF2FF");
  sheet.setFrozenRows(1);

  if (items.length > 0) {
    const rows = items.map(item => headers.map(h => item[h] !== undefined ? item[h] : ""));
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function getGoogleCalendarEvents(daysAhead) {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + (daysAhead || 14));
    
    const events = CalendarApp.getDefaultCalendar().getEvents(now, future);
    return events.map(e => ({
      id: "gcal_" + e.getId(),
      title: e.getTitle(),
      kind: e.isAllDayEvent() ? "event" : "block",
      event_date: Utilities.formatDate(e.getStartTime(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
      time: e.isAllDayEvent() ? "All day" : Utilities.formatDate(e.getStartTime(), Session.getScriptTimeZone(), "HH:mm"),
      duration: e.isAllDayEvent() ? "-" : Math.round((e.getEndTime() - e.getStartTime()) / (1000 * 60)) + " min",
      meta: e.getLocation() || "Google Calendar",
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Live RSS Feed Parser
 * Fetches and parses RSS/Atom feeds from top sources without CORS limitations.
 */
function fetchLiveRSSNews() {
  const allArticles = [];

  RSS_FEEDS.forEach(feed => {
    try {
      const response = UrlFetchApp.fetch(feed.url, {
        muteHttpExceptions: true,
        headers: { "User-Agent": "Mozilla/5.0 (Life OS RSS Reader)" },
      });
      if (response.getResponseCode() !== 200) return;

      const xmlText = response.getContentText();
      const document = XmlService.parse(xmlText);
      const root = document.getRootElement();

      // Check for standard RSS <channel><item> structure
      const channel = root.getChild("channel");
      let items = [];

      if (channel) {
        items = channel.getChildren("item").slice(0, 4);
      } else {
        // Atom feed fallback
        const atomNs = XmlService.getNamespace("http://www.w3.org/2005/Atom");
        items = root.getChildren("entry", atomNs).slice(0, 4);
      }

      items.forEach((item, idx) => {
        let title = "";
        let link = "";
        let pubDate = "";
        let description = "";

        if (channel) {
          title = item.getChildText("title") || "";
          link = item.getChildText("link") || "";
          pubDate = item.getChildText("pubDate") || "";
          description = item.getChildText("description") || "";
        } else {
          const atomNs = XmlService.getNamespace("http://www.w3.org/2005/Atom");
          title = item.getChildText("title", atomNs) || "";
          const linkEl = item.getChild("link", atomNs);
          link = linkEl ? linkEl.getAttribute("href").getValue() : "";
          pubDate = item.getChildText("updated", atomNs) || item.getChildText("published", atomNs) || "";
          description = item.getChildText("summary", atomNs) || "";
        }

        // Clean HTML tags from summary description
        const cleanSummary = description
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (title && (link || feed.url)) {
          allArticles.push({
            id: "rss_" + feed.source.toLowerCase().replace(/\s+/g, "_") + "_" + idx,
            category: feed.category,
            source: feed.source,
            headline: title.trim(),
            summary: cleanSummary ? cleanSummary.slice(0, 200) + (cleanSummary.length > 200 ? "…" : "") : "Click to view full story on " + feed.source + ".",
            readTime: Math.max(3, Math.min(8, Math.round(cleanSummary.length / 300) + 3)) + " min",
            when: formatRelativeTime(pubDate),
            url: link || feed.url,
            trending: idx === 0,
          });
        }
      });
    } catch (err) {
      console.warn("Failed fetching RSS feed for " + feed.source + ": " + err);
    }
  });

  return allArticles;
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return "Today";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((now - d) / (1000 * 60 * 60));
    if (diffHours <= 1) return "Just now";
    if (diffHours < 24) return diffHours + " h ago";
    const diffDays = Math.round(diffHours / 24);
    return diffDays + " d ago";
  } catch (e) {
    return "Recently";
  }
}
