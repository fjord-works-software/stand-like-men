# Stand Like Men — Styling & Theme System

## Context

The logo establishes the brand palette: near-black background (#0c0c0c), white type, and a vibrant green accent (#22c55e brush stroke + dark green #166534 hexagon pattern). The site currently uses amber/gold as its accent colour and hardcodes dark-mode Tailwind classes everywhere. This plan replaces amber with green, introduces a CSS-variable token system, and adds a three-way theme toggle (System / Dark / Light) that defaults to the visitor's OS preference and persists their choice to localStorage.

---

## Colour Palette

| Token | Light value | Dark value | Notes |
|---|---|---|---|
| `--bg` | `#fafaf9` (stone-50) | `#0c0c0c` | Page background |
| `--surface` | `#ffffff` | `#1a1a1a` | Cards, nav panel |
| `--border` | `#e7e5e4` (stone-200) | `#2a2a2a` | Borders, dividers |
| `--fg` | `#1c1917` (stone-900) | `#f5f5f4` (stone-100) | Primary text |
| `--muted` | `#78716c` (stone-500) | `#78716c` | Secondary/meta text |
| `--accent` | `#16a34a` (green-600) | `#22c55e` (green-500) | Brand green |
| `--accent-hover` | `#15803d` (green-700) | `#4ade80` (green-400) | Hover accent |
| `--accent-dim` | `#dcfce7` (green-100) | `#14532d` (green-900) | Pill/badge bg |

---

## Implementation

### 1. `src/styles/global.css` — token definitions

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Register semantic tokens as inline (runtime) CSS variables */
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-dim: var(--accent-dim);
}

/* ── Light (default) ─────────────────────────────── */
:root {
  --bg: #fafaf9;
  --surface: #ffffff;
  --border: #e7e5e4;
  --fg: #1c1917;
  --muted: #78716c;
  --accent: #16a34a;
  --accent-hover: #15803d;
  --accent-dim: #dcfce7;
}

/* ── Dark (explicit) ─────────────────────────────── */
:root[data-theme="dark"] {
  --bg: #0c0c0c;
  --surface: #1a1a1a;
  --border: #2a2a2a;
  --fg: #f5f5f4;
  --muted: #78716c;
  --accent: #22c55e;
  --accent-hover: #4ade80;
  --accent-dim: #14532d;
}

/* ── System dark (no explicit override) ─────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0c0c0c;
    --surface: #1a1a1a;
    --border: #2a2a2a;
    --fg: #f5f5f4;
    --muted: #78716c;
    --accent: #22c55e;
    --accent-hover: #4ade80;
    --accent-dim: #14532d;
  }
}
```

Utility classes gained: `bg-bg`, `bg-surface`, `border-border`, `text-fg`, `text-muted`, `text-accent`, `bg-accent`, `border-accent`, `bg-accent-dim`, `text-accent-hover`.

---

### 2. New: `src/components/ThemeToggle.astro`

A compact three-button toggle rendered in the nav. Buttons: **System**, **Dark**, **Light**. Active state highlighted in accent green.

Client `<script>`:
- On mount: read `localStorage.getItem('slm-theme')` to highlight active button
- On click: update `document.documentElement.dataset.theme` (remove attribute for "system"), write to localStorage

---

### 3. `src/layouts/BaseLayout.astro` — anti-flash + token body class

Add **before** any other `<head>` content:
```html
<script is:inline>
  (function () {
    var t = localStorage.getItem('slm-theme');
    if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
  })();
</script>
```

Change `<body>` class from hardcoded dark values to semantic tokens:
```
bg-bg text-fg min-h-screen flex flex-col transition-colors duration-200
```

---

### 4. Replace hardcoded colours in all components & pages

**Colour substitution table:**

| Old class | New class |
|---|---|
| `bg-stone-950` | `bg-bg` |
| `bg-stone-950/95` | `bg-bg/95` |
| `bg-stone-900/50` | `bg-surface/50` |
| `bg-stone-900` | `bg-surface` |
| `bg-stone-700` | `bg-border` |
| `text-white` | `text-fg` |
| `text-stone-100` | `text-fg` |
| `text-stone-300` | `text-fg/70` |
| `text-stone-400` | `text-muted` |
| `text-stone-500` | `text-muted` |
| `text-stone-600` | `text-muted/70` |
| `border-stone-800` | `border-border` |
| `border-stone-700` | `border-border` |
| `text-amber-400` | `text-accent` |
| `text-amber-300` | `text-accent-hover` |
| `bg-amber-400` | `bg-accent` |
| `hover:text-amber-400` | `hover:text-accent` |
| `hover:text-amber-300` | `hover:text-accent-hover` |
| `hover:border-amber-400` | `hover:border-accent` |
| `bg-amber-400/10` | `bg-accent-dim` |

**Files to update:**
- `src/components/Nav.astro` — also add `<ThemeToggle />` in the nav row
- `src/components/Footer.astro`
- `src/components/EpisodeCard.astro`
- `src/components/BlogCard.astro`
- `src/components/SocialLinks.astro`
- `src/pages/index.astro`
- `src/pages/episodes/index.astro`
- `src/pages/episodes/[slug].astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[slug].astro`
- `src/pages/hosts/[slug].astro`

---

### 5. Logo in hero

Replace the text `<h1>` on `src/pages/index.astro` with the logo image:
```html
<img src="/images/StandLikeMenLogo.webp" alt="Stand Like Men Podcast"
     class="w-64 sm:w-80 mx-auto mb-8 rounded-2xl" />
```

Wrap in a dark panel so it reads correctly in light mode too:
```html
<div class="inline-block bg-[#0c0c0c] rounded-2xl p-4 mb-8">
  <img src="/images/StandLikeMenLogo.webp" alt="Stand Like Men Podcast" class="w-64 sm:w-80" />
</div>
```

---

## Verification

1. `npm run dev` — site loads in system theme
2. Toggle to **Light** — all pages switch, no hardcoded dark values remain
3. Toggle to **System** — follows OS preference
4. Refresh — chosen preference persists without flash
5. `npm run build` — clean build, no type errors
