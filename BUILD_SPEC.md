# BUILD_SPEC — remibousk.com rebuild (read this fully before writing any code)

Authoritative spec for all agents. The goal is an **exact visual/behavioral replica** of https://old.remibousk.com/ as a self-hosted static site. When in doubt, measure the original; do not invent design.

## Paths
- App root: `/Users/remibouskila/Framer Rebuild/site` (note the space — always quote)
- Reference screenshots (ground truth): `../reference/screenshots/<page>-<mobile|tablet|desktop>.png`
- Frozen HTML of original (for exact CSS values): `../reference/mirror/*.html` + mirrored CSS/JS under `../reference/mirror/framerusercontent.com/`
- Verbatim page text: `../content/*.md` (typos are intentional — copy text EXACTLY)
- Section order per page: `../content/structure-notes.md`
- Raw media: `../assets/raw/{images,videos,fonts}` + `manifest.csv` (filename → source URL → pages used)
- Live site is still up for computed-style checks: `https://old.remibousk.com/`

## Stack (fixed — do not substitute)
- Next.js 15, App Router, TypeScript, `output: 'export'` in next.config.ts, `images: { unoptimized: true }`
- Styling: **CSS Modules** + global `src/styles/tokens.css` + `src/styles/globals.css`. No Tailwind, no CSS-in-JS.
- Animation: `motion` package (`import { motion } from 'motion/react'`) for scroll-appear, marquees, tabs, hovers.
- Static media served from `public/images`, `public/videos`, `public/fonts` (files copied from assets/raw, same filenames).
- No other runtime deps without a note in your report.

## Routes
`/`, `/ctc`, `/onboardingtoctc`, `/mobileweb`, `/summ-design-system`, plus a 404 page.
**`/siteminder` is intentionally DROPPED** (stub on the old site). Remove/avoid any link pointing to it — the homepage SiteMinder tile stays visually but must not link there.

## Design tokens (already measured from the original — use these variable names)
```css
:root {
  --bg-0: #18161e; --bg-1: #1c1924; --bg-2: #1e1b27; --bg-3: #201d2a; --bg-4: #231f2d;
  --surface: #2a2537; --border: #413857;
  --text-primary: #f4f4f6; --text-secondary: #adaab5; --text-muted: #767282;
  --accent-blue: #0659c3; --accent-navy: #020843;
}
```
Body background `--bg-0`. Rendered heading color is ~#e5e5e6 on the original — match what you measure, not what looks nice.

## Breakpoints (match the original exactly)
- Phone: `max-width: 809px`
- Tablet: `810px – 1199px`
- Desktop: `min-width: 1200px`
Write desktop-first or mobile-first as you prefer, but the switch points are 809/810 and 1199/1200.

## Typography
- Families: `GT Walsheim Pro` (headings/UI), `Figtree`, `Inter`. @font-face declarations are generated in Phase-1 from the original's CSS — use the CSS variables/utility classes defined in `src/styles/fonts.css`; do not add your own @font-face.
- Hero H1 reference: GT Walsheim Pro Bold 72px / 86.4px (1.2), color #e5e5e6 (desktop).
- For every text style you build, measure the original (mirror HTML computed styles or live site) — size, weight, line-height, letter-spacing, color.

## Fidelity workflow (every component)
1. Find your section in the reference screenshot(s) at all 3 breakpoints. Crop with `sips` or Python/PIL into the scratchpad for a closer look (screenshots are very tall).
2. Pull exact values (spacing, radii, shadows, colors, font sizes) from the mirror HTML: the original inline CSS uses Framer class names — grep `../reference/mirror/home.html` etc. You can also query the live site with curl. Do not eyeball values that can be measured.
3. Text content comes from `../content/*.md` verbatim.
4. Images/videos: reference `/images/<file>` `/videos/<file>` (already in public/). Use explicit width/height or aspect-ratio to avoid layout shift. `<video autoPlay muted loop playsInline>` for mp4s.
5. Scroll-appear: sections on the original fade/slide in on scroll. Use `motion` `whileInView` with `viewport={{ once: true }}`, subtle y-offset (~20-40px) + opacity, duration ~0.5-0.8s ease-out, unless you measure otherwise from the original's behavior.
6. Respect `prefers-reduced-motion` (motion's `useReducedMotion` or CSS).

## Conventions
- Components live in `src/components/<Name>/<Name>.tsx` + `<Name>.module.css`. One folder per component, self-contained.
- Server components by default; add `'use client'` only where interactivity/motion needs it.
- Semantic HTML: `nav/main/section/h1-h3/figure/blockquote`. Icon-only links get `aria-label`. All images get real `alt` text derived from context.
- Own ONLY the files assigned to you in your task prompt. Do not edit other components, globals, tokens, or pages you don't own. If you need something global changed, note it in your report instead.
- After building, verify your part compiles: `npm run build` must pass (or at minimum `npx tsc --noEmit` if another agent's WIP breaks the full build — say so in your report).

## Deliberate fixes (approved deviations from the original — do these, list them in reports)
1. `/siteminder` route dropped (see Routes).
2. `/ctc` horizontal overflow bug at ≤1199px: the original hard-locks content to ~795px width. Fix: fluid width, no horizontal scroll at any viewport ≥320px. Keep desktop appearance identical.
3. `/ctc` "View live" button has no href on the original: point it at `https://cryptotaxcalculator.io` (target=_blank rel=noopener) — flagged for user review.
4. Contact email: `remi.bouskila@gmail.com` — render it directly (no Cloudflare obfuscation); keep the copy-to-clipboard + "Copied!" behavior.
5. Framer badge/branding: omit entirely.

## Definition of done (integration phase enforces)
- `npm run build` (static export) passes; `out/` contains all routes.
- New pages vs reference screenshots at 390/834/1440: layout matches (allowing anti-aliasing/rendering noise); no horizontal overflow anywhere.
- All internal links work; no reference to framerusercontent.com or framer.com anywhere in the built output.
- Text is byte-identical to `content/*.md` (typos preserved).
