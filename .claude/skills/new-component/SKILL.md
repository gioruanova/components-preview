---
name: new-component
description: Build a new simulator page for a Saffire widget from a filled spec (docs/specs/*.md, based on docs/component-spec.template.md) — schema, preview, CSS, live codegen and tests under src/widgets/<category>/<component>/. Use when the user adds a new component, a new variant to an existing family, or hands over widget HTML/script/data to simulate.
argument-hint: "<path to spec, e.g. docs/specs/cards--cards-carousel.md>"
---

# New component

Read `CLAUDE.md` first. It defines the field types, the A/B/C section rules, the brand tokens and the conventions this skill depends on.

## 0. Get the spec
- If the user gave a spec path, read it.
- If not, copy `docs/component-spec.template.md` to `docs/specs/<category>--<component>.md`. Fill in what you can from what the user provided (HTML, script, data, a URL to the current docs page). Ask only for the gaps that change the output: the category, which options exist, and the rendering rules. Don't guess those.
- Each config option needs a section (A Content / B Widget configuration / C Styles) and a field type from the catalog. Map them like this:
  - On/Off → `switch`
  - Show + text → `switchText`
  - Colors → `color`
  - px values → `slider`
  - Counts → `stepper`
  - 2–4 choices → `segmented`
  - Longer lists → `select`

## 1. Category
- Existing category: read its folder. Look for `shared/` helpers and sibling components to mirror.
- New category: run the `/new-category` steps first.

## 2. Scaffold `src/widgets/<category>/<component>/`
Copy the files from `templates/` (next to this skill) and replace the `__Placeholders__`. Use these as reference implementations:
- `src/widgets/seo-block/seo-block-default/`: toggles, groups, select, empty state, external links.
- `src/widgets/cards/cards-grid/`: list + count, per-item rules, responsive grid, hover reveal.

| File | Responsibility |
|---|---|
| `schema.ts` | `XConfig` **type alias** (not interface), `defaults` (from spec §5 data), `schema` grouped `content` / `widget` / `styles`. Use `visibleWhen` to hide controls that don't apply. |
| `Preview.tsx` | React version of spec §3 markup. **Same class names** as the real widget. Style values go in as CSS custom properties on the root. `preventDefault` on links. Use a `div` where the real markup nests `<a>` in `<a>`. |
| `styles.css` | Preview CSS, imported `?inline`, scoped by the widget's classes, driven by the CSS vars. Responsive: `@media (max-width: 768px)` tablet, `(max-width: 480px)` mobile. |
| `codegen.ts` | Pure functions: `toHtml`, `toScript`, `toData`, optional `isEmpty`, `codegen(config) → CodeFile[]` (HTML, Script, Data). The output is **live**: conditional lines through `lines()`, the widget ID substituted, data from config. Keep `${Placeholders}` in the HTML like the real templates. Put rendering rules (spec §7) in helpers that both Preview and codegen call. |
| `codegen.test.ts` | One test per rendering rule in spec §7, plus the empty state and widget-ID substitution. |
| `index.ts` | `defineWidget({ name, status, order, summary, description, previewHint?, defaults, schema, Preview, styles, codegen, isEmpty? })`. |

Shared helpers are in `src/tooling/codegen.ts`: `lines`, `linkAttributes`, `isExternalUrl`, `json`. Reuse them, and extend them only when the helper is generic.

## 3. Rules
- Don't edit `src/tooling/*` or `src/app/*` for a single widget. If a new field type is truly needed, add it generically in `tooling/types.ts` and `tooling/fields/FieldRenderer.tsx`, then document it in the `CLAUDE.md` table.
- No checkboxes and no native color inputs. Use only the field types.
- Generated code does not need colors or styling.
- When the spec has an empty/removed rule, implement `isEmpty`.

## 4. Verify (all required)
1. `npm run typecheck` and `npm test` pass.
2. Start the dev server (`.claude/launch.json` → `simulator`). Open `/<category>/<component>` and check:
   - It appears under the right category in the sidebar tree and the category tabs.
   - Every control changes the preview **and** the code tabs.
   - Desktop/Tablet/Mobile show the spec §8 behavior.
   - The empty state shows "Component empty/removed" (when applicable).
   - Copy shows the `Code copied` toast.
3. `npm run build` passes.
4. Report back: which files were created, any spec gaps you filled with assumptions, and the verification results.
