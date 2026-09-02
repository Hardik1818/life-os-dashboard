// scripts/generate-index.mjs
// Runs after `vite build` to generate a proper index.html for static hosting.
// The Nitro cloudflare-module preset doesn't emit index.html, so we create it
// from the actual hashed asset filenames in .output/public/assets/.

import { readdir, writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, ".output/public/assets");
const outputDir = join(root, ".output/public");

const files = await readdir(assetsDir);

const indexJs = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const stylesCss = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

if (!indexJs) throw new Error("Could not find index-*.js in .output/public/assets");
if (!stylesCss) throw new Error("Could not find styles-*.css in .output/public/assets");

const html = `<!DOCTYPE html>
<html lang="en" suppressHydrationWarning>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Life OS — Your day, in one place</title>
  <meta name="description" content="A private daily dashboard for your calendar, tasks, habits, health and news." />
  <meta name="application-name" content="Life OS" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Life OS" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="theme-color" content="#4f46e5" />
  <meta property="og:title" content="Life OS — Your day, in one place" />
  <meta property="og:description" content="A private daily dashboard for your calendar, tasks, habits, health and news." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
  <link rel="stylesheet" href="/assets/${stylesCss}" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <script>
    (function() {
      try {
        var s = localStorage.getItem('life-os-theme');
        var dark = s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (dark) document.documentElement.classList.add('dark');
      } catch(e) {}
    })();
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/${indexJs}"></script>
</body>
</html>`;

await writeFile(join(outputDir, "index.html"), html, "utf8");
console.log(`✓ Generated index.html (${indexJs}, ${stylesCss})`);
