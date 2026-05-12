# Stand Like Men Podcast Website — Implementation Plan

## Context

Brand new Astro project for the *Stand Like Men Podcast*, hosted by Daniel Chalenburg and Logan Ingram. The site needs episode pages, a blog, host bios, and social links. Decap CMS provides a Git-based editorial interface so non-developer editors can manage content. Deployed via GitHub Actions to GitHub Pages.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro (static output) + TypeScript |
| Styling | Tailwind CSS v4 |
| CMS | Decap CMS 3.x (GitHub backend) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

---

## Project Structure

```
stand-like-men/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Build & deploy to GitHub Pages
├── public/
│   ├── admin/
│   │   ├── index.html            # Decap CMS SPA entry point
│   │   └── config.yml            # Decap CMS collection/field config
│   └── images/                   # Static assets (podcast cover art, etc.)
├── src/
│   ├── content/
│   │   ├── config.ts             # Zod schemas for all collections
│   │   ├── episodes/             # One .md/.mdx per episode
│   │   ├── blog/                 # One .md/.mdx per article
│   │   └── hosts/                # daniel.md, logan.md
│   ├── layouts/
│   │   └── BaseLayout.astro      # <html>, <head>, Nav, Footer wrapper
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── SocialLinks.astro     # Apple Podcasts, Spotify, YouTube, Facebook
│   │   ├── EpisodeCard.astro
│   │   └── BlogCard.astro
│   ├── pages/
│   │   ├── index.astro           # Home — hero, latest episode, social links
│   │   ├── episodes/
│   │   │   ├── index.astro       # Episode listing (all episodes, sorted desc)
│   │   │   └── [slug].astro      # Episode detail with show notes
│   │   ├── blog/
│   │   │   ├── index.astro       # Blog listing
│   │   │   └── [slug].astro      # Article detail
│   │   ├── hosts/
│   │   │   └── [slug].astro      # Bio pages — daniel, logan
│   │   └── rss.xml.ts            # RSS feed for podcast clients
│   └── styles/
│       └── global.css            # @import "tailwindcss"
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

---

## Implementation Steps

### 1. Scaffold the project

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-git
npx astro add tailwind
```

### 2. Configure Astro for GitHub Pages

In `astro.config.mjs`:
- `output: 'static'` (default)
- `site: 'https://<github-username>.github.io'`
- `base: '/stand-like-men'` (if deploying to a sub-path repo; omit if using a custom domain or `<user>.github.io`)
- Add `@astrojs/sitemap` integration

### 3. Content Collections (`src/content/config.ts`)

Three typed collections with Zod:

**episodes**
```ts
title, episodeNumber, publishDate, duration, audioUrl,
spotifyUrl?, appleUrl?, youtubeUrl?, description, body (MDX)
```

**blog**
```ts
title, publishDate, author (enum: daniel | logan), excerpt, body (MDX)
```

**hosts**
```ts
name, slug (daniel | logan), bio, headshot, twitterUrl?, instagramUrl?
```

### 4. Decap CMS setup (`public/admin/`)

**`index.html`** — standard Decap CMS SPA loader pointing to the CDN bundle.

**`config.yml`** — configure:
- `backend: github` with `repo: <github-username>/stand-like-men`
- `media_folder: public/images` / `public_folder: /images`
- Three collections matching the content schemas above

**OAuth note:** The `github` backend requires an OAuth proxy. Recommended free approach:
1. Create a GitHub OAuth App (Settings → Developer Settings → OAuth Apps)
2. Deploy `netlify-cms-oauth-provider` to a free Render or Railway instance
3. Set `base_url` in `config.yml` to point to the proxy

### 5. Pages

| Route | File | Notes |
|---|---|---|
| `/` | `index.astro` | Hero, latest episode card, SocialLinks component |
| `/episodes` | `episodes/index.astro` | List of EpisodeCards, sorted by date desc |
| `/episodes/[slug]` | `episodes/[slug].astro` | Show notes, audio embed, back link |
| `/blog` | `blog/index.astro` | List of BlogCards |
| `/blog/[slug]` | `blog/[slug].astro` | Full article |
| `/hosts/daniel` | `hosts/[slug].astro` | Daniel Chalenburg bio |
| `/hosts/logan` | `hosts/[slug].astro` | Logan Ingram bio |
| `/rss.xml` | `rss.xml.ts` | `@astrojs/rss` feed of episodes |

### 6. SocialLinks component

Five links with icons (inline SVGs):
- Apple Podcasts
- Spotify
- YouTube
- Facebook

Accept an optional `vertical` prop for sidebar/footer vs. horizontal hero display.

### 7. RSS feed

Use `@astrojs/rss` in `src/pages/rss.xml.ts`. Pull from the `episodes` content collection. Include `title`, `pubDate`, `description`, `enclosure` (audioUrl) for podcast clients.

### 8. GitHub Actions deploy (`.github/workflows/deploy.yml`)

Standard Astro + GitHub Pages workflow:
- Trigger on push to `main`
- `actions/checkout`, `actions/setup-node`, `npm ci`, `npm run build`
- `actions/upload-pages-artifact` → `actions/deploy-pages`

---

## Seed Content

Create placeholder content files so routes render on first build:
- `src/content/hosts/daniel.md` — Daniel Chalenburg
- `src/content/hosts/logan.md` — Logan Ingram
- `src/content/episodes/ep001-pilot.md` — placeholder first episode
- `src/content/blog/welcome.md` — placeholder first post

---

## Verification

1. `npm run dev` — all routes resolve at localhost:4321
2. `/episodes`, `/blog`, `/hosts/daniel`, `/hosts/logan` render without errors
3. `/rss.xml` returns valid XML with an enclosure element
4. `npm run build && npm run preview` — static build serves correctly
5. Visit `/admin/` → Decap CMS login UI appears (OAuth wired up separately)
6. Deploy workflow fires on push to `main` and GitHub Pages URL loads
