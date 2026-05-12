# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at localhost:4321
npm run dev:all    # dev server + Decap CMS local proxy (use this when editing content via /admin)
npm run build      # production build to ./dist/
npm run preview    # preview the production build locally
npx astro check    # TypeScript/template type checking
```

There are no tests. The IDE TypeScript language server reports false-positive JSX errors (`JSX element implicitly has type 'any'`) in `.astro` files — these do not affect the build and can be ignored.

## Architecture

**Stack:** Astro v6 (static output) · Tailwind CSS v4 · TypeScript · Decap CMS · GitHub Pages

**Deployment:** Push to `main` triggers `.github/workflows/deploy.yml`, which builds and deploys to GitHub Pages. `astro.config.mjs` has a placeholder `site` URL and a commented-out `base` for sub-path deployments.

### Theming system

All colours are CSS custom properties defined in `src/styles/global.css`. Tailwind consumes them via `@theme inline` mappings, making semantic utility classes like `bg-bg`, `text-fg`, `text-accent`, `bg-surface`, `border-border`, `bg-accent-dim` available everywhere. Never use hardcoded Tailwind colour classes (e.g. `stone-*`, `green-*`) — always use the semantic tokens.

Theme switching works via `data-theme` on `<html>`:
- No attribute → system preference (handled by `@media (prefers-color-scheme: dark)`)
- `data-theme="dark"` / `data-theme="light"` → explicit override

An anti-flash inline script in `BaseLayout.astro`'s `<head>` reads `localStorage` key `slm-theme` and applies the attribute before paint. `ThemeToggle.astro` cycles system → dark → light and writes to the same key.

**Prose typography** overrides `--tw-prose-*` variables directly in the `.prose` block in `global.css`. Do not use `dark:prose-invert` — it only responds to `prefers-color-scheme`, not the `data-theme` attribute toggle.

### Content collections

Defined in `src/content.config.ts` using Astro v6's `glob()` loader (not the legacy `src/content/config.ts` location). Three collections: `episodes`, `blog`, `hosts`. Use `entry.id` (not `entry.slug`) for URL params in `getStaticPaths`.

### Decap CMS

Config at `public/admin/config.yml`. Requires updating `YOUR_GITHUB_USERNAME/stand-like-men` repo reference and setting up an OAuth proxy before it's functional.
