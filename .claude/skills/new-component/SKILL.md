---
name: new-component
description: Build a new Components Live Preview page for a Saffire widget from a filled spec (docs/specs/*.md, based on docs/component-spec.template.md) — schema, preview markup, styles (preview + SCSS/CSS), live codegen and tests under src/widgets/<category>/<component>/. Use when the user adds a new component, a new variant to an existing category, turns a "coming soon" item into a real component, or hands over widget HTML/script/data/CSS to preview.
argument-hint: "<path to spec, e.g. docs/specs/cards--hot-buttons.md>"
---

# New component

Read `CLAUDE.md` (golden rules) and the field and style sections of `docs/reference.md`. Use one existing widget as the model rather than reading all of them:
- `src/widgets/text-blocks/seo-block/`: text + buttons, alignment, typography, empty state.
- `src/widgets/cards/cards-grid/`: repeatable items (list + count), grid, hover, per-item rules.

## 0. Spec
- If the user gave a spec path, read it.
- If not, copy `docs/component-spec.template.md` to `docs/specs/<category>--<component>.md` and fill it from what the user provided (HTML, CSS, script, data, a live URL). Ask only about gaps that change the output: category, options, rendering rules.
- To turn a "coming soon" item into a real component, use the **same slug** as the `upcoming` entry, then delete that entry from `category.ts`.

## 1. Category
Use the existing category, or run the `/new-category` steps first.

## 2. Scaffold `src/widgets/<category>/<slug>/`
Copy `templates/*.tmpl` (next to this skill), drop `.tmpl`, and replace the placeholders listed in `templates/README.md`.

| File | Must do |
|---|---|
| `schema.ts` | Config **type alias** + `defaults` (spec data and live-widget styles) + `schema`. **A Content** has only texts, labels, URLs and items (`visibleWhen` their toggle). **B** has a "Show / hide" group with every toggle, plus behavior. **C** has `widthFields()`, alignment/position, typography per text, colors, and a "Buttons" group of `buttonStyle` fields. Anything that should differ per viewport is `responsive: true`, with tablet/mobile defaults in `withOverrides`. |
| `Preview.tsx` | The real markup and class names. No styling. Buttons: `className={\`button button-${n}\`}`, `onClick={previewLinkClick(url)}`, `{...linkAttributes(url, label)}`. |
| `styles.ts` | `styles(c) → Sheet`. Every color and size is a var (`$$name`). Use `responsiveType`, `widthVars/Decls` and `customButtonStyles`. Per-viewport values: `responsive(c, key)` + an `at(vp)` rule that mirrors the base selectors exactly (see the template). For text in sized boxes, use fluid type `{ unit: 'cqi' }` + `container-type: inline-size`. Never hard-code tablet/mobile values. |
| `codegen.ts` | `codegen(c) → { html, script, data }`, live from config via `lines()`. Rendering rules (e.g. "button only with URL") go in helpers shared with Preview. Add `isEmpty` if the widget can be removed. |
| `codegen.test.ts` | One test per spec rule (§7), plus the empty state, widget ID and key style options (`toCss`/`toScss`). |
| `index.ts` | `defineWidget({ name, status, order, summary, description, previewHint?, defaults, schema, Preview, styles, codegen, isEmpty? })`. |

Don't edit `src/tooling/*` or `src/app/*` for one widget. A new field type, if truly needed, is added generically and documented in `docs/reference.md`.

## 3. Verify
1. `npm test` and `npm run typecheck`. `npm run check:output` (SCSS ≡ CSS ≡ preview, Stylelint, Prettier, specificity) covers new widgets automatically.
2. In the browser (`.claude/launch.json` → `simulator`), on `/<category>/<slug>`:
   - Nav entry appears.
   - Every control updates the preview and the code.
   - All 3 viewports work.
   - Container, empty state and button clicks (centered message) work.
3. Report the files created, any assumptions you made to fill spec gaps, and the verification results.
