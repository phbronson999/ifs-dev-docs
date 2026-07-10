# TODO

Tracking known issues and follow-ups across the docs content and the GitHub Pages site itself.

## Content

- [ ] `Marble Language Reference/Glossary.md` has a broken wikilink: `[[Emphasis]]` should be `[[Emphasis and Colors]]` (found 2026-07-10; there may be other similarly-broken wikilinks elsewhere that haven't been swept for yet)
- [ ] General accuracy pass — this is a work in progress; opinions/explanations that turn out to be wrong should be corrected as they're found
- [ ] Consider covering plugins and Java at some point (currently explicitly out of scope)

## Site / design

- [ ] The four section `README.md` files (`Marble Language Reference`, `Base Server Reference`, `Analytics Reference`, `Other Model Types Reference`) contain ` ```dataview ` code blocks that rendered as live queries in Obsidian but render as inert/plain code on the published site, since Dataview is an Obsidian-only plugin. Either rewrite these sections as static content/links, or find a Quartz-side equivalent.
- [ ] TOC entries jump to `#heading` anchors, but headings don't currently have `scroll-margin-top` set to account for the fixed breadcrumb bar's height — clicking a TOC link may land the heading partially or fully hidden behind the breadcrumb bar. Fix: add `scroll-margin-top` (matching `$crumbBarHeight`, currently `4rem`) to heading elements in the article body.
- [ ] `MarbleSidebar.tsx`'s section/link structure is hand-written and hardcoded to match `Common Patterns.html`'s current set of pages. If content notes get renamed, moved, or added, both files need to be manually kept in sync — there's no single source of truth driving both.
- [ ] Mobile layout (sidebar toggle, fixed breadcrumb bar behavior) has been sanity-checked but not thoroughly tested across real devices/viewport sizes.
