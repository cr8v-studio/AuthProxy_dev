# AuthProxy Design Inventory

## Purpose
Small inventory of synced Figma assets and the reusable implementation layer in the local HTML/CSS/JS system.

## Token Layers
- Figma source tokens: raw values preserved in `:root` with `--figma-*` naming.
- Semantic project tokens: reusable aliases for typography, colors, spacing, sizes and motion.
- Component tokens: scoped variables aligned to Figma component intent like `--header-link-*` and `--header-button-v1-*`.

## Foundation Tokens
- Motion: `--motion-duration-fast`, `--motion-ease-standard`
- Borders: `--border-width-none`, `--border-width-thin`
- Spacing: `--space-inline-xs`, `--space-inline-sm`, `--space-inline-md`, `--space-inline-lg`, `--space-stack-sm`, `--space-stack-lg`, `--space-stack-xl`
- Sizes: `--size-control-md`, `--size-control-lg`, `--size-icon-sm`, `--size-corner-width`, `--size-corner-height`
- Offsets: `--offset-subpixel`
- Control typography: `--type-control-body-*`, `--type-control-caps-*`
- Control colors: `--color-control-dark-bg`, `--color-control-dark-fg`, `--color-control-dark-fg-strong`

## Typography
Figma source:
- `Text Styles`
- `BR0 0 - 500`
- `BR1 501 - 9999`

Code layer:
- Tokens in `/Users/alexander/Desktop/Codex/AuthProxy_dev/styles/tokens.css`
- Semantic classes in `/Users/alexander/Desktop/Codex/AuthProxy_dev/styles/typography.css`

Semantic classes:
- `.heading-hero`
- `.heading-hero-tight`
- `.heading-xl`
- `.heading-lg`
- `.heading-lg-alt`
- `.heading-md`
- `.heading-md-numeric`
- `.heading-sm`
- `.heading-xs`
- `.heading-xs-caps`
- `.eyebrow`
- `.overline`
- `.text-body-lg`
- `.text-body-lg-highlight`
- `.text-body-sm`
- `.text-body-sm-highlight`

## Header
### `header.site-header_logo`
- CSS: `.site-header-logo`
- JS: `createHeaderLogo()`
- Assets: `assets/logo-authproxy-dark.svg`
- Tokens: `--header-logo-*`

### `header.site-header_link`
- CSS: `.site-header-link`
- JS: `createHeaderLink()`
- Visual pattern: two-corner control
- Tokens: `--header-link-*`

### `header.site-header_link_m2`
- CSS: `.site-header-link-m2`
- JS: `createHeaderLinkM2()`
- Visual pattern: four-corner control, uppercase
- Tokens: `--header-link-m2-*`

### `header.site-header_link/dropdown`
- CSS: `.site-header-dropdown`, `.site-header-dropdown__icon`
- JS: `createHeaderDropdown()`
- Visual pattern: two-corner dropdown trigger with rotating arrow
- Tokens: `--header-dropdown-*`

### `header.site-header_buttom_v1`
- CSS: `.site-header-button-v1`
- JS: `createHeaderButtonV1()`
- Visual pattern: dark four-corner button, uppercase
- Tokens: `--header-button-v1-*`

### `header.site-header_buttom_v2`
- CSS: `.site-header-button-v2`, `.site-header-button-v2__icon`, `.site-header-button-v2__icon-wrap`
- JS: `createHeaderButtonV2()`
- Visual pattern: dark arrow button with icon shift on hover
- Tokens: `--header-button-v2-*`

### `header.site-header_social`
- CSS: `.site-header-social`, `.site-header-social__icon`
- JS: `createHeaderSocial()`
- Visual pattern: two-corner social link
- Tokens: `--header-social-*`

## Buttons
### `Buttton_page_numbering`
- CSS: `.button-page-numbering`
- JS: `createPageNumberingButton()`
- Icons: `arrow-right`, `arrow-right-inverse`
- Tokens: `--button-page-numbering-*`

## Icons
Figma source:
- `icons`

Code layer:
- Registry: `/Users/alexander/Desktop/Codex/AuthProxy_dev/scripts/icons.js`
- Styles: `/Users/alexander/Desktop/Codex/AuthProxy_dev/styles/icons.css`
- Assets: `/Users/alexander/Desktop/Codex/AuthProxy_dev/assets/icons/`

Primary icon names:
- `arrow-down`
- `arrow-right`
- `arrow-right-inverse`
- `arrow-right-offwhite`
- `arrow-up`
- `figure-2`
- `tg`
- `tg-header`
- `vector-1` to `vector-6`

## Paint And Pattern
### `Paint Styles / Gradient_1`
- CSS: `.paint-gradient-1`, `.surface-soft-radial`
- Tokens: `--figma-paint-gradient-1`, `--paint-surface-soft-radial`

### `Pattern`
- CSS: `.pattern-frame-corners`, `.pattern-frame-corners--cover`
- Asset: `assets/pattern-default.svg`
- Tokens: `--pattern-default-*`, `--pattern-frame-corners`

## Reuse Rules
- Use foundation tokens first, component tokens second.
- If Figma updates a shared value, update the token rather than patching individual classes.
- If a new header variant appears, extend the existing two-corner or four-corner pattern before creating a new styling approach.
- Keep icon names aligned to Figma intent where the asset meaning is known; preserve neutral `vector-*` naming where semantics are still unclear.
