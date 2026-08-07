# remibousk.com — Framer → Self-Hosted Rebuild Plan

Goal: an exact visual + behavioral replica of https://old.remibousk.com/, self-hosted, with better performance, cleaner code, and no Framer dependency.

---

## 1. Site audit (what exists today)

**Platform:** Framer publish (generator tag "Framer"), React + framer-motion runtime, all assets served from `framerusercontent.com`, Cloudflare in front.

**Pages (6, from sitemap.xml):**

| Route | Content |
|---|---|
| `/` | One-page portfolio: hero, logo marquee, tabbed device showcase, case-study cards, SiteMinder & IBM sections, experience timeline, contact, camera roll |
| `/onboardingtoctc` | Case study: CTC onboarding (50% conversion lift) |
| `/summ-design-system` | Case study: SUMM design system |
| `/mobileweb` | Case study: mobile experience |
| `/ctc` | Case study: Crypto Tax Calculator |
| `/siteminder` | Case study: SiteMinder |

**Homepage section map (from DOM, ~8,700px tall):**
1. Fixed left sidebar nav ("remi." logo, Work / Experience links with active-dot indicator, Linkedin / Email / Resume links)
2. Hero — "Hi, i'm Remi…" eyebrow, 72px/86.4px GT Walsheim Pro Bold headline, "In love with:" + 4 colored 3D badge chips (Product / Design / Discovery / Strategy) with emoji icons, gradient/blurred dark background
3. Intro blurb + company logo row (SVG logos: SUMM, IBM, etc.)
4. Tabbed device showcase — tabs "Summ / CTC / MM" swapping tablet mockup images
5. Case-study cards ("Onboarding card" ×3) — each links to a case study; at least one autoplays an mp4; titles: Onboarding, Design System, Mobile experience
6. SiteMinder tile — stacked/rotating product screenshots (BookingPerformance, Occupancy report, RateParity, CompRates…), repeated 3× in DOM → infinite carousel/marquee
7. IBM section
8. Experience timeline — 7 entries (CTC 2022–Present … UTS 2010–2013), note the 👁️🐝Ⓜ️ IBM easter egg
9. Closing blurb + "Get in touch" — Linkedin + **copy-email button with "Copied!" state**
10. "Camera roll" — photo gallery strip

**Case-study template:** Go back link → title + tag chips (e.g. "Web design, Visual design, Copywriting, UX, Mobile") → meta block (Role / When / What / Outcome) → numbered content sections (01 - Problem … 06 - The result) → pull-quotes, inline images and autoplay videos → "Get in touch" CTA → Back to top.

**Design tokens (extracted from published CSS):**

```css
/* Backgrounds (dark, subtle steps) */
--bg-0: #18161e;   /* body background */
--bg-1: #1c1924;
--bg-2: #1e1b27;
--bg-3: #201d2a;
--bg-4: #231f2d;
--surface: #2a2537;
--border: #413857;
/* Text */
--text-primary: #f4f4f6;   /* headings ~ #e5e5e6 rendered */
--text-secondary: #adaab5;
--text-muted: #767282;
/* Accents */
--accent-blue: #0659c3;
--accent-navy: #020843;
```

**Typography:**
- **GT Walsheim Pro** (Regular 400, Medium 500, Bold 700 + oblique variants) — headings & UI. ⚠️ Commercial font by Grilli Type — see licensing below.
- **Figtree** (500, 700 + italics) — Google Font, OFL.
- **Inter** (400, 700, 900 + italics) — Google Font, OFL.
- Hero H1: GT Walsheim Pro Bold, 72px / 86.4px line-height (1.2), color #e5e5e6.
- Framer currently ships ~50 woff2 files; the rebuild should ship only the ~6–8 actually used.

**Breakpoints (from published media queries):**
- Phone: ≤ 809px
- Tablet: 810–1199px
- Desktop: ≥ 1200px (with a component-level query up to 1422.98px)

**Media inventory:**
- ~80 images (`framerusercontent.com/images/...` — PNGs up to 3318×2288, SVG logos)
- 8 mp4 videos (1 home, 1 ctc, 2 onboardingtoctc, 3 mobileweb, 1 summ-design-system)
- Images are served with `?width=&height=&scale-down-to=` params → responsive srcsets to replicate

**Motion/interaction inventory (to replicate):**
- Scroll-triggered appear/fade-up animations on sections
- Logo marquee (continuous horizontal loop)
- Screenshot carousel loop (SiteMinder tile)
- Tab switcher (device showcase)
- Hover states on cards/nav; nav active-section indicator dots
- Copy-email → "Copied!" feedback
- Smooth-scroll anchors (Work / Experience), Back-to-top

---

## 2. Strategy decision: how to get an *exact* copy

Three options, in order of fidelity-vs-maintainability:

**A. Static mirror (scrape the published output).** `wget`/HTTrack the published HTML+assets. Pixel-perfect by definition, quick. But: it's minified Framer React output — unmaintainable, un-editable, still div-soup, and you'd freeze the site as-is. **Use only as a frozen reference copy, not as the rebuild.**

**B. Clean rebuild measured against the original (recommended).** Rebuild the DOM/CSS by hand in a modern static stack, using the live site as the measurement source of truth (computed styles, spacing, screenshots), and verify with automated visual diffing. Slightly more work; result is fast, semantic, maintainable, and truly yours.

**C. Framer "export" tools / community scrapers.** Convert Framer output to React. Middle ground, but output quality is poor and you inherit the div soup. Skip.

**Recommendation: B, with A kept as an offline reference archive.** Key insight: Framer sites are React + framer-motion under the hood, so a React stack using the **Motion** library (framer-motion's successor) can reproduce every animation with the same easing engine — this is the single biggest lever for an exact-feel replica.

Since it's your own Framer project, also keep the Framer editor open during the rebuild: you can read exact paddings, gaps, font sizes, easing curves and durations straight from the inspector instead of reverse-engineering everything.

---

## 3. Recommended stack

- **Framework:** Next.js (App Router, `output: 'export'`) → pure static files, host anywhere (VPS + nginx/Caddy, Cloudflare Pages, Netlify…). Astro + React islands is a fine alternative; Next chosen because the whole site is animation-heavy React anyway.
- **Animation:** Motion (`motion` package, successor to framer-motion) — same spring physics/easing as Framer itself.
- **Styling:** Plain CSS Modules (or Tailwind v4 if preferred) + CSS custom properties for the token palette above. No runtime CSS-in-JS.
- **Images:** Self-hosted, converted to AVIF/WebP with fallbacks, `<picture>`/`srcset` matching original rendered sizes; `loading="lazy"` below the fold.
- **Video:** Self-hosted mp4 (re-encode with h264 + `muted autoplay loop playsinline`, poster frames).
- **Fonts:** Self-hosted woff2, subsetted, `font-display: swap`, preload the 2–3 critical files.
- **Analytics (replaces Framer analytics):** Plausible/Umami/Cloudflare Analytics — pick one.

---

## 4. Phased plan

### Phase 0 — Capture & archive (do this first; the old site is the spec)
1. Full mirror for reference: `wget --mirror --page-requisites --convert-links https://old.remibousk.com/` into `reference/mirror/`.
2. Full-page screenshots of all 6 pages × 3 breakpoints (390, 810, 1440) → `reference/screenshots/`. (Playwright script.)
3. Screen-record every animation/interaction: hero load-in, marquees, tab switcher, card hovers, copy-email, scroll appears (desktop + mobile).
4. Download all ~80 images **without** resize params (original resolution) and all 8 videos → `assets/raw/`.
5. Export text content of every page to markdown → `content/`.
6. From the Framer editor: note exact spacing/animation values for anything ambiguous; export any source images at 2x.

### Phase 1 — Foundation
1. Scaffold Next.js static-export project, CI, deploy target (pick host).
2. Global styles: token CSS variables, dark background, resets, breakpoint mixins (809/1199).
3. Font pipeline: subset GT Walsheim Pro (used weights only), Figtree, Inter; preload; verify metrics match (line-height rendering identical).
4. Layout shell: fixed sidebar nav component (logo, nav links + active dots, social links) with mobile variant.

### Phase 2 — Homepage, section by section (each section = build → side-by-side diff → polish)
Hero → logo row → device-showcase tabs → case-study cards → SiteMinder carousel → IBM → experience timeline → contact (copy-email) → camera roll. Add scroll-appear animations per section with Motion's `whileInView`, matching recorded timing/easing.

### Phase 3 — Case-study pages
1. Build the shared case-study layout template (meta block, numbered sections, quote, media blocks, CTA footer).
2. Port all 5 case studies as content (MDX or typed TSX content files).
3. Keep identical URLs: `/ctc`, `/siteminder`, `/onboardingtoctc`, `/mobileweb`, `/summ-design-system`.

### Phase 4 — Fidelity verification (the "exact copy" gate)
1. Playwright visual regression: screenshot new vs. reference at all breakpoints, overlay/diff (e.g. pixelmatch); iterate until diffs are only anti-aliasing noise.
2. Manual pass: hover states, tab keyboard access, animation feel, mobile nav, video autoplay on iOS (playsinline), reduced-motion media query.
3. Cross-browser: Chrome, Safari (incl. iOS), Firefox.

### Phase 5 — Parity & launch
1. Head parity: `<title>`, meta description, OG/Twitter images, favicon set — copy from old site's rendered head.
2. `sitemap.xml`, `robots.txt`, 404 page.
3. Resume PDF + any downloadables rehosted.
4. Analytics + Cloudflare email-obfuscation replacement (just render the email normally or keep a copy-button only).
5. Lighthouse pass (target ≥95 perf — very achievable once ~50 fonts → ~7 and images are AVIF).
6. DNS cutover on the production domain; keep `old.remibousk.com` up during transition; 301s not needed if paths are identical.

---

## 5. Best practices to bake in (improvements over Framer output)

- **Semantic HTML** instead of Framer's div soup: `<nav> <main> <section> <h1–h3> <figure>` — better SEO + a11y with zero visual change.
- **Ship only used font weights**, subsetted — Framer currently ships ~50 woff2 files.
- **Static HTML with selective hydration** — only interactive islands (tabs, carousel, copy button) need JS; Framer hydrates the entire page.
- **Responsive images** with real srcsets and explicit width/height (no CLS).
- **`prefers-reduced-motion`** support (Framer partially handles this; do it properly).
- **Accessibility:** focus states, aria labels on icon links, alt text on all case-study imagery, contrast check on muted text (#767282 on #18161e is borderline — keep visual parity but verify AA for body text).
- **No third-party runtime deps** at page load beyond your analytics script.

---

## 6. Risks / open items

1. **GT Walsheim Pro licensing** — commercial typeface (Grilli Type). Self-hosting requires your own web license (Framer's hosting may have been covered by your upload rights, but the license terms are yours to verify). Options: buy/confirm GT Walsheim web license, or (if ever needed) a metric-compatible fallback — but for an exact copy, the real font is required.
2. **framerusercontent.com longevity** — once you unpublish/stop paying Framer, those asset URLs may die. Phase 0 downloads everything first — do this before touching the Framer project.
3. **Animation nuance** — exact spring curves are the hardest 5%. Mitigate by reading values from the Framer editor + recordings; Motion library reproduces them 1:1 once values are known.
4. **Camera-roll & carousel details** — confirm exact behavior (drag? autoplay speed?) from the live site during Phase 0 recordings.
5. **Domain plan** — old lives at `old.remibousk.com`; confirm the rebuild targets `remibousk.com` (sitemap already canonicalizes there).

---

## 7. Suggested repo layout

```
remibousk.com/
├── reference/          # Phase 0 output (mirror, screenshots, recordings) — gitignored or LFS
├── public/
│   ├── fonts/          # subsetted woff2
│   ├── images/         # optimized AVIF/WebP + originals
│   └── videos/
├── content/            # case-study content (MDX)
├── src/
│   ├── app/            # routes: /, /ctc, /siteminder, /onboardingtoctc, /mobileweb, /summ-design-system
│   ├── components/     # SidebarNav, Hero, BadgeChip, LogoMarquee, DeviceTabs,
│   │                   # CaseCard, ScreenshotCarousel, Timeline, CopyEmail, CameraRoll, CaseStudyLayout
│   └── styles/         # tokens.css, globals.css
└── e2e/                # Playwright visual-regression suite
```
