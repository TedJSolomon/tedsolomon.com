# tedsolomon.com — Project Memory

## Site Structure
```
tedsolomon.com/
  index.html       — Homepage (hero, bio, projects, connect section)
  about.html       — Full bio + career timeline
  contact.html     — Social links (LinkedIn, Twitter, Instagram, Email)
  css/
    styles.css     — All shared + page-specific styles (no inline CSS)
  blog/
    index.html     — Static blog listing with placeholder post cards
```

## Design System
- **Dark theme**: `--bg: #0c0f14`, `--bg-card: #13161d`
- **Accent**: `--accent: #e8a838` (amber)
- **Fonts**: DM Serif Display (headings/display), JetBrains Mono (labels/meta), Outfit (body)
- **Nav**: Fixed, frosted glass (`backdrop-filter: blur(20px)`), hamburger on mobile
- **Cards**: `var(--bg-card)`, border on hover transitions to `var(--border-accent)`, amber top gradient line on hover
- **Grain overlay**: `body::after` with inline SVG noise, `z-index: 9999`, `pointer-events: none`

## Nav Links (consistent across all pages)
- Logo → `/`
- About → `/about.html`
- Projects → `/#projects`
- Blog → `/blog/`
- Contact → `/contact.html`
- Active state: add `class="active"` to current page's `<a>`

## Mobile Nav
- Hamburger button (`.nav-toggle`) toggles `.open` class on both itself and `.nav-links`
- Mobile menu: `position: absolute; top: 100%` (relative to fixed nav)
- Breakpoint: 768px
- JS snippet included inline at bottom of each page (identical across all pages)

## Content Notes
- Ted is a PM at Beck Technology, ex-construction (estimator/PE), ex-implementation
- Projects: Vision Quest (newsletter, Beehiiv) and Catalyft (iOS app, in progress)
- Bio stats: 8+ years, 2 products shipped outside work
- Contact hrefs are placeholder `#` except email (`mailto:hello@tedsolomon.com`) — user needs to fill in real URLs
- Blog cards are placeholder "Coming Soon" — user adds posts manually by copying `.blog-card` blocks

## Adding Blog Posts
Copy a `.blog-card` block in `blog/index.html`, update date/category/title/excerpt, set `href` to post file path.
