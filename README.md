# DroidMaster Website

Static commercial website for DroidMaster.

## Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open the site:

   ```text
   http://localhost:5173
   ```

4. Build production assets:

   ```bash
   npm run build
   ```

5. Preview the production build:

   ```bash
   npm run preview
   ```

## Pages

1. `index.html` is the canonical public website.
2. `archive.html` keeps the removed lower commercial sections for reference.

## Debug Controls

The title, punchline, and palette controls are hidden by default. Add `?debug=1` to reveal them:

```text
http://localhost:5173/?debug=1
```

## Public Links

1. GitHub: https://github.com/WiseDragonAI/DroidMaster
2. Discord: https://discord.gg/QzGH2XwySv

## Source Layout

1. `src/styles.css` contains the shared commercial styling.
2. `src/page-behaviors.js` contains page controls, FAQ animation, palette animation, and hero text behavior.
3. `src/workspace-demo.js` contains the synchronized workspace, keyboard, and voice mock animation.
4. `public/assets/droids` contains local droid icon assets.
5. `public/assets/photos` contains local photo assets used inside the mock workspace.
6. `docs/animation-sequence.md` documents the workspace animation sequence and rationale.
7. `docs/kb/commercial-site.md` stores durable implementation knowledge for future website work.

## Build Artifacts

`dist/`, `node_modules/`, local Vite cache, logs, and `.env` files are ignored. Do not commit generated build output.
