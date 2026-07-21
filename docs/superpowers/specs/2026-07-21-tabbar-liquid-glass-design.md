# TabBar Liquid Glass (CSS-only)

**Date:** 2026-07-21  
**Status:** Approved for planning  
**Scope:** `src/components/TabBar.css` visual polish only

## Goal

Make the floating main tab bar visually closer to iOS Liquid Glass while keeping the existing layout, navigation behavior, and AI button unchanged.

## Decisions

| Topic | Choice |
| --- | --- |
| Glass intensity | Balanced (semi-transparent + stronger blur + highlight edge) |
| Apply to | Tab pill only |
| AI button | Keep current image/button as-is |
| Active indicator | Frosted translucent capsule (not solid white) |
| Implementation | CSS-only polish on existing classes |

## Out of scope

- AI button glass treatment
- SVG / displacementMap refraction
- Tab switch motion redesign
- Structural changes to `TabBar.tsx`
- Changes to Insights dim behavior (`tabbar-wrap--dimmed`)

## Visual spec

### `.tabbar-pill`

- Keep: height `66px`, padding `3px`, `border-radius: 999px`, 4-column grid, relative positioning
- Background: vertical (or near-vertical) white gradient, roughly `rgba(255,255,255,0.55)` → `rgba(255,255,255,0.22)`
- Border: light translucent white edge (~`rgba(255,255,255,0.65)`)
- Shadow: soft outer drop + inset top highlight (and optional subtle inset bottom)
- Backdrop: `blur(28px) saturate(1.4)` with `-webkit-backdrop-filter` prefix
- Fallback: when backdrop-filter is unavailable, the translucent gradient alone must still read as a bar

### `.tabbar-indicator`

- Replace opaque `#fff` with frosted fill ~`rgba(255,255,255,0.72)`
- Soft shadow + light inset highlight so it matches the pill tone
- Keep full-cell inset coverage and `border-radius: 999px`
- Do not change active/inactive icon assets or label colors

### Unchanged

- `.tabbar-wrap` layout, safe-area inset, dim opacity
- Icon sizing, mask icons, active image assets
- `.tabbar-ai` size and image

## Architecture

- Single file change preferred: `src/components/TabBar.css`
- No new components, stores, or assets
- No JS/TS API changes

## Acceptance criteria

1. Tab pill reads as frosted glass over scrolling content (blur + translucency visible on colorful screens).
2. Active tab indicator is frosted, not solid opaque white, and still clearly marks selection.
3. AI button appearance is unchanged.
4. Dimmed Insights state still works.
5. Layout metrics (pill size, gap to AI, safe area) unchanged.

## Risks / notes

- True iOS Liquid Glass refraction cannot be matched in CSS; this is an intentional approximation.
- Heavy `backdrop-filter` can cost GPU on low-end devices; Balanced values are chosen to stay moderate.
