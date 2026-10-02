---
name: new-component
description: Build a new Components Live Preview page for a Saffire widget from a filled spec (docs/specs/*.md, based on docs/component-spec.template.md) — schema, preview markup, styles (preview + SCSS/CSS), live codegen and tests under src/widgets/<category>/<component>/. Use when the user adds a new component, a new variant to an existing family, or hands over widget HTML/script/data/CSS to preview.
argument-hint: "<path to spec, e.g. docs/specs/cards--cards-carousel.md>"
---

# New component

Read `CLAUDE.md` first. It covers how styles work, the field types, the A/B/C section rules, the brand and the conventions this skill depends on.

## 0. Get the spec
- If the user gave a spec path, read it.
- If not, copy `docs/component-spec.template.md` to `docs/specs/<category>--<component>.md`. Fill in what you can from what the user provided (HTML, CSS, script, data, a URL to the current widget). Ask only for the gaps that change the output: the category, which options exist, and the rendering rules. Don't guess those.
- Each config option needs a section (A/B/C) and a field type:
  - On/Off → `switch`
  - Show + text → `switchText`
  - Colors → `color`
  - px values → `slider`
  - Counts → `stepper`
  - 2–4 choices → `segmented`
  - Longer lists → `select`
  - **Every text element (not buttons) → `typography`**
  - Show/hide toggles always go in **Widget configuration → "Show / hide"**, never in Content. Content holds only the client-editable texts, labels, URLs and items.
- Don't add container options. Every widget gets them automatically.
- Buttons are always generic **Button 1 / Button 2** with an editable label, rendered only when they have a URL (add the URL `tip`). Give each one the class `button button-N` and a `buttonStyle` field (custom style) in Styles → "Buttons", applied with `customButtonStyles()` from `tooling/buttons.ts`.
- The widget's own block gets `widthFields()` (Max width / 100%) from `tooling/layout.ts`.
- If the real widget's CSS is available (live site or POC), take its values as the defaults: colors, font sizes, paddings, radius.

## 1. Category
- Existing category: read its folder. Look for `shared/` helpers and sibling components to mirror.
- New category: run the `/new-category` steps first.

## 2. Scaffold `src/widgets/<category>/<component>/`
Copy the files from `templates/` (next to this skill), drop the `.tmpl` suffix, and replace the `__Placeholders__` (see `templates/README.md`). Use these as reference implementations:
- `src/widgets/text-blocks/seo-block/`: toggles, Button 1/2 groups with the URL rule, select, alignment, typography with clamp, width mode, empty state, external links.
- `src/widgets/cards/cards-grid/`: list + count, per-item rules, flex grid with "fit space", content position, hover reveal.

| File | Responsibility |
|---|---|
| `schema.ts` | `XConfig` **type alias** (not interface), `defaults` (spec §5 data + real widget's style values), `schema` grouped `content` / `widget` / `styles`. Use `visibleWhen` to hide controls that don't apply. |
| `Preview.tsx` | Real markup only (spec §3), with **the same class names**. No styling. Links use `onClick={previewLinkClick(url)}` (toast instead of navigating) plus `linkAttributes(url, label)`. Use a `div` where the real markup nests `<a>` in `<a>`. |
| `styles.ts` | `styles(config) → Sheet`. Put every color and size in `vars` and reference them with `$$name`. Text comes from `typeStyles(prefix, config.xFont)`. Responsive rules go in `{ media: 'tablet' \| 'mobile' }` blocks. This single sheet drives the preview, SCSS and CSS. |
| `codegen.ts` | Pure functions: `toHtml`, `toScript`, `toData`, optional `isEmpty`, and `codegen(config) → { html, script, data }`. The output is **live**: conditional lines through `lines()`, the widget ID substituted, data from config. Keep `${Placeholders}` in the HTML. Put rendering rules (spec §7) in helpers that Preview and codegen both call. |
| `codegen.test.ts` | One test per rendering rule, the empty state, widget-ID substitution, and the key style options (via `toCss` / `toScss`). |
| `index.ts` | `defineWidget({ name, status, order, summary, description, previewHint?, defaults, schema, Preview, styles, codegen, isEmpty? })`. |

Shared helpers:
- `src/tooling/codegen.ts`: `lines`, `linkAttributes(url, label)` (external = other domain than the current page), `isExternalUrl`, `json`.
- `src/tooling/typography.ts`: `typography`, `typeStyles`, `scaledSize`.

Reuse them, and extend them only when the helper is generic.

## 3. Rules
- Don't edit `src/tooling/*` or `src/app/*` for a single widget. If a new field type is truly needed, add it generically in `tooling/types.ts` and `tooling/fields/FieldRenderer.tsx`, then document it in the `CLAUDE.md` table.
- No checkboxes and no native color inputs. Use only the field types.
- Don't write static `.css` files. All styles go in `styles.ts`, so the outputs match the preview.
- When the spec has an empty/removed rule, implement `isEmpty`.

## 4. Verify (all required)
1. `npm run typecheck` and `npm test` pass.
2. Start the dev server (`.claude/launch.json` → `simulator`). Open `/<category>/<component>` and check:
   - It appears in the sidebar tree, the category tabs and the homepage catalog.
   - Every control changes the preview **and** the code tabs (HTML, SCSS, CSS, Data).
   - Desktop/Tablet/Mobile show the spec §8 behavior.
   - "Uses container" wraps the widget and the background options work.
   - The empty state shows "Component empty/removed" (when applicable).
   - Copy shows the `Code copied` toast.
3. `npm run build` passes.
4. Report back: which files were created, any spec gaps you filled with assumptions, and the verification results.
