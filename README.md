# Life OS

A private, single-user life dashboard PWA that unifies your day: schedule, tasks, habits, journal, health, news and insights — in one calm interface.

Built with TanStack Start (React 19 + Vite 7) and Tailwind CSS v4.

---

## Contents

- [Features](#features)
- [Pages](#pages)
- [Design system](#design-system)
- [Project structure](#project-structure)
- [Data & persistence](#data--persistence)
- [PWA](#pwa)
- [Responsiveness](#responsiveness)
- [Development](#development)
- [Roadmap](#roadmap)

---

## Features

- **Today dashboard** — what needs attention, top 3 priorities, schedule, tasks, habits and upcoming deadlines at a glance.
- **Interactive state** — check off tasks and habits, add tasks, write journal entries, log mood.
- **Light & dark themes** — toggle in Settings, persisted to `localStorage`, defaults to your system preference.
- **Installable PWA** — manifest, maskable/apple-touch icons, standalone display and safe-area handling on iOS.
- **Mobile-first navigation** — desktop sidebar, mobile bottom bar with a "More" sheet for secondary pages.

## Pages

| Route | Page | What it does |
| --- | --- | --- |
| `/` | Today | Attention items, top 3 priorities, day schedule, tasks, habits, deadlines, daily progress ring |
| `/calendar` | Calendar | Month grid with event / deadline / time-block indicators plus an Upcoming list |
| `/tasks` | Tasks | Full task list with priorities, area filters, add and complete |
| `/insights` | Insights | Completion stats, focus-time bar chart and rule-based insight cards |
| `/journal` | Journal | Daily entry with mood tag and a history of past entries |
| `/habits` | Habits | Weekly grid tracker with streaks |
| `/health` | Health & Mood | Sleep, steps, workouts and a mood check-in |
| `/news` | News | Top stories, category filters and a read-later list |
| `/settings` | Settings | Profile, appearance (dark mode), notifications and privacy toggles |

## Design system

All colours, radii and shadows are semantic tokens defined in `src/styles.css` using OKLCH, with a `.dark` override block. Components never hardcode colour utilities.

- Accent: indigo
- Light surface: near-white `#F7F8FA` background with white cards
- Type: Inter, tight tracking on headings
- Shape: 12–16px rounded cards, hairline borders, minimal shadow

Shared primitives live in `src/components/life-os/ui.tsx`:

- `Card` — padded, bordered surface
- `SectionHeader` — title + optional right-hand aside
- `PageHeader` — page title + subtitle
- `ProgressRing` — SVG completion ring (`ProgressRing.tsx`)

`AppShell.tsx` wraps every page and owns navigation.

## Project structure

```text
src/
  routes/                 file-based routes (one file per page)
    __root.tsx            html shell, fonts, PWA meta
    index.tsx             Today
    ...
  components/life-os/
    AppShell.tsx          sidebar + mobile nav + "More" sheet
    ui.tsx                Card / SectionHeader / PageHeader
    ProgressRing.tsx
    today-data.ts         demo data for the Today page
  hooks/
    use-theme.ts          light/dark with localStorage persistence
    use-mobile.tsx
  styles.css              Tailwind v4 theme + design tokens
public/
  manifest.webmanifest    PWA manifest
  pwa-icon*.png, apple-touch-icon.png, favicon.png
```

Routing is file-based; `src/routeTree.gen.ts` is generated — never edit it.

## Data & persistence

The app is currently **local-first with demo data**. Seed content lives in `today-data.ts` and inline in each route; interactions are held in React state for the session, and only the theme is persisted (`life-os-theme` in `localStorage`).

There is no backend yet. Enabling Lovable Cloud would add a database, auth and server functions so tasks, habits, journal entries and health logs persist across devices.

## PWA

- `public/manifest.webmanifest` — name, standalone display, theme/background colour, 192/512 and maskable icons
- `__root.tsx` — manifest link, `theme-color`, apple-mobile-web-app meta, `viewport-fit=cover`
- Layout uses `env(safe-area-inset-bottom)` so the bottom nav clears the iOS home indicator

Install from the browser's "Add to Home Screen" on mobile, or the install icon in desktop Chrome.

## Responsiveness

Mobile is the primary target. Layouts were audited at 360px, 393px and 768px with no horizontal overflow: grids and their children use `min-w-0`, chips and colour bars use `shrink-0`, long secondary labels hide below `sm`, and rows keep a ≥44px touch target with `active:` feedback.

## Development

```sh
npm i
npm run dev      # http://localhost:8080
npm run build    # production build
npm run lint
npm run format
```

Adding a page: create `src/routes/<name>.tsx` exporting `createFileRoute` with a `head()` (unique title + description) and a component wrapped in `<AppShell>`, then add it to the nav arrays in `AppShell.tsx`.

## Roadmap

- Persist tasks, habits, journal and health logs to a real backend
- Auth so the dashboard follows you across devices
- Real calendar sync and a live news source
- Notifications and reminders for deadlines and habit streaks
```
