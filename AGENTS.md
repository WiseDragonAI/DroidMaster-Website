# Agent Runbook

## Intent

This repository owns the public DroidMaster commercial website. Keep the canonical page focused on the current product story and keep archived/experimental commercial sections out of the primary page.

## Concepts

1. **Canonical website**: `index.html` is the page users should see.
2. **Archive page**: `archive.html` keeps removed commercial sections for later reuse without affecting the canonical website.
3. **Unified surface demo**: the workspace mock shows keyboard navigation, voice prompting, generated cards, browser updates, and image generation as one synchronized product surface.
4. **Debug controls**: title, punchline, and palette controls exist only for tuning and must stay gated behind `?debug=1`.
5. **Palette invariant**: the animated hue range is primary `204deg` to `222deg` and secondary `30deg` to `40deg`.

## Development Rules

1. Keep source files in `src/` and static assets in `public/assets/`.
2. Do not commit `dist/`, `node_modules/`, Vite cache, logs, or `.env` files.
3. Do not add secrets to the repository. The static website requires no runtime secret.
4. Keep external links aligned with:
   1. GitHub: `https://github.com/WiseDragonAI/DroidMaster-Website`
   2. Discord: `https://discord.gg/QzGH2XwySv`
5. Preserve the `?debug=1` gate when changing title, punchline, or palette controls.
6. Preserve the workspace mock invariants documented in `docs/animation-sequence.md`.

## Commands

1. Install:

   ```bash
   npm install
   ```

2. Run locally:

   ```bash
   npm run dev
   ```

3. Build:

   ```bash
   npm run build
   ```

4. Preview:

   ```bash
   npm run preview
   ```

## Review Checklist

1. `npm run build` passes.
2. `dist/` remains untracked.
3. `node_modules/` remains untracked.
4. No `.env` file is tracked.
5. Debug controls remain hidden without `?debug=1`.
6. The canonical page still ends at the FAQ.
