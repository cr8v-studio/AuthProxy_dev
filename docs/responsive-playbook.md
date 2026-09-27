# Responsive Playbook (Labs-inspired)

This document defines adaptive rules for the current site and all future sections.

## Breakpoints
- Desktop: `>=1200px`
- Tablet: `810px–1199px`
- Phone: `320px–809px`

## Global Principles
1. Keep existing viewport logic intact. Do not replace global `dvh/svh` behavior.
2. Use fluid scaling before hard breakpoint jumps.
3. Prefer token overrides in media queries instead of one-off local values.
4. Fix overflow at container level (`overflow-x: clip`) instead of per-element hacks.

## Labs-inspired Rules Applied
1. Fluid root typography:
- `320–1439`: `html` scales from `15px` to `16px`.
- `1440+`: `html` continues fluid scaling from `16px`.

2. Compact desktop normalization (`1200–1439`):
- tighter header paddings/gaps
- nav typography steps down to body-sm
- reduced blur intensity for cleaner readability on laptop viewports

3. Overflow guardrails:
- horizontal clipping enabled for section-level wrappers in narrow desktop/tablet ranges

## Future Section Checklist
When adding a new section:
1. Build desktop first with tokenized spacing.
2. Add fluid size rules (`clamp`, `%`, `minmax`) before tablet stacking.
3. Tablet: preserve composition if readable; otherwise switch to stack.
4. Phone: always prioritize readability and no horizontal overflow.
5. Avoid fixed heights unless explicitly required by design.
6. If sticky header is present, ensure section top visibility without double offsets.

## Safe Implementation Pattern
- Use `:root` token overrides in breakpoint scopes.
- Keep section-specific media blocks local to the section.
- Do not change global breakpoints unless design system changes in Figma.

## Verified corrections (2026-09-27)

- Navigation collapses below 1200px; the open menu scrolls within the available viewport height. Compact desktop navigation uses reduced spacing at 1200–1439px.
- Hero height follows content below 1200px. Both hero and final phone CTAs share one row, with Start Building on the left, Explore Docs on the right, fluid 12–16px labels and 44px minimum touch targets.
- Hero metrics use one continuous marquee at every breakpoint, showing two card widths below 1200px and four on desktop. Hover, focus and touch pause it; reduced motion falls back to a native horizontal scroller. Hidden/offscreen marquees pause, and resizing recalculates card widths.
- Hero metrics hide their two decorative corner marks below 810px; the metric dividers remain.
- The final CTA summary hides its four outer corners below 810px, preserving the button corners.
- Pricing and its free-benefits grid are removed at every breakpoint, along with all header and footer links.
- Solution problem cards hide their decorative corners below 810px so the marks never overlap body copy or provider names.
- The stacked Solution illustration has a 512px inner canvas plus 24px outer padding, containing its 497px expanded artwork below 1200px.
- Security slides hide the lower-left decorative corner below 810px; the upper-right corner and navigation stay visible.
- At 320–809px, the How pipeline is in normal document flow with downward arrows; timings sit below the illustration.
- Operations artwork scales with its container; the docs CTA remains outside the decorative hidden subtree.
- Capability fragments resolve to real navigation elements. Reloading a shared capability URL preserves the selected capability.
- Security has five single-card positions below 1200px and four two-card positions on desktop. Pagination controls have 44px targets and hidden slides are inert.
- The final product previews form a native horizontally scrollable gallery on phones.
- Footer navigation uses four desktop columns and two phone columns, with 44px link targets.
- Browser layout checks: 320, 375, 390, 768, 810, 1024, 1199, 1200 and 1440px. Check menu/logo overlap separately from document overflow.
