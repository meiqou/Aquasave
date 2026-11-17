# AquaSave

AquaSave is a static front-end website for an ocean cleanup initiative, featuring a landing page, marine life showcase, responder dashboard, and simple auth UI pages.

## Pages

- `index.html` — Landing page (mission, hotspots/map, marine life, calls to action)
- `dashboard.html` — Responder dashboard with profile, logs, crews, and region filters (client-side, stored in `localStorage`)
- `login.html` — Log in UI
- `register.html` — Create account / join a crew UI

## Project structure

```text
Aquasave/
├─ index.html
├─ dashboard.html
├─ login.html
├─ register.html
├─ css/
│  └─ style.css
├─ js/
│  └─ main.js
└─ images/
   ├─ graphics/
   └─ vectors/
```

## Features

- Responsive navigation with links to Mission, Hotspots, Marine life, and Dashboard
- Animated hero/preloader and interactive marine life cards (GSAP/scroll effects in `js/main.js`)
- Philippine hotspots map section and marine life video modals
- Dashboard interactions: editable profile, add/delete/clear field logs, join/leave crews, region-based filtering
- Dashboard state persisted in browser `localStorage` (no backend)

## Running locally

This is a static site (no build step required).

1. Place or keep the project folder in your web server root (e.g. XAMPP `htdocs`) **or** open it directly.
2. Open `index.html` in a browser.
   - For best results, serve via a local server (e.g. XAMPP/Apache, or VS Code Live Server) so all asset paths load consistently.

## Notes

- Login/register pages are UI-only (form submission is handled on the client without a backend).
- Dashboard data is stored locally in your browser (`aquasave_profile`, `aquasave_logs`, `aquasave_joined_crews`).
- Fonts are loaded from Google Fonts; an internet connection is required for them to display.
