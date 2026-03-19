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
