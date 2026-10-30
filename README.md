# Zoe — prototype (Vite + React + TypeScript)

## Run
```
node -v        # needs 18.18+ (20 recommended)
npm install
npm run dev    # http://localhost:5173
npm run build  # type-check + production build
```
No API keys needed. `.env.example` is reserved for future Supabase use.

## Build status
**Implemented:** routing + page titles + transitions, design tokens, shared state (log, cart, tracker, diet, profile), Home, 3D Wellness Kit (procedural, drag/zoom, open/exploded view, selectable parts, WebGL fallback), Scanner (upload validation, checklist, staged animation, deterministic demo samples A/B/C), My Care (log with filter, notes, sachet tracker + chart, diet education), Store (configurable pricing in `src/lib/pricing.ts`, flavors), Cart + simulated checkout, Privacy, Medical Disclaimer.

**Not built yet (route shows a notice):** How It Works, Reports and Medicine Label Magnifier, Doctor Connect, Family Care, Profile editing/switching. Also pending: verified statistics section, reminders, report-linked insights.

**Simulated / needs backend:** scan results (no validated analysis), OCR and AI explanations, payments, accounts, storage. Flavor names are placeholders.

## Troubleshooting
- `ERESOLVE` on install: `npm install --legacy-peer-deps`.
- Blank 3D panel: check the browser supports WebGL; the fallback message shows if not.
- `tsc` errors after dependency updates: delete `node_modules` and `package-lock.json`, reinstall.
- Port busy: `npm run dev -- --port 3000`.
- Fonts missing offline: system serif/sans fallbacks are used.
