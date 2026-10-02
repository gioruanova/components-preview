# Saffire Component Simulator

Interactive docs/simulator for Saffire widgets. Every page shows a widget's functional description, a config panel (A Content / B Widget configuration / C Styles), a live responsive preview, and the generated HTML / Script / Data.

## Stack
Vite · React 19 · TypeScript · Tailwind v4 · shadcn/ui (`src/components/ui`, Radix via `radix-ui`) · react-router · react-frame-component (iframe preview) · react-colorful · sonner (toasts) · prism-react-renderer · Vitest.

Commands: `npm run dev` · `npm test` · `npm run typecheck` · `npm run build`.

## Structure
```
src/
  app/                 shell: Layout (header, category tabs), Sidebar tree, pages (routes)
  tooling/             generic, widget-agnostic machinery — change rarely
    types.ts           WidgetDefinition, CategoryDefinition, field types, defineWidget()
    registry.ts        folder-driven registry (import.meta.glob) — never edit to add widgets
    ComponentPage.tsx  page layout: description → [config | sticky preview] → code
    ConfigPanel.tsx    renders schema sections A/B/C
    fields/            FieldRenderer + controls (ColorPicker, SliderControl, Stepper)
    PreviewFrame.tsx   iframe + Desktop 1280 / Tablet 768 / Mobile 375, scale-to-fit, empty state
    CodeOutput.tsx     tabs + Copy button + "Code copied" toast
    codegen.ts         shared helpers: lines(), linkAttributes(), isExternalUrl(), json()
  widgets/
    <category>/                 a component family → sidebar group + category tab
      category.ts               defineCategory({ name, description, order })
      shared/                   optional helpers shared by the family (ignored by the registry)
      <component>/              one simulator page → /<category>/<component>
        index.ts                defineWidget({...}) — metadata + wiring
        schema.ts               Config type, defaults, schema (A/B/C)
        Preview.tsx             React render of the widget markup
        styles.css              preview CSS, imported with ?inline, driven by CSS vars
        codegen.ts              codegen(config) → CodeFile[] (+ isEmpty, toData, …)
        codegen.test.ts         Vitest for codegen + visibility rules
docs/
  component-spec.template.md    fill one per new component (the "context")
  specs/<category>--<component>.md   filled specs (source of truth for each widget)
```
Folder names are URL slugs. Adding a category or component = adding a folder; the sidebar tree, category tabs and routes update automatically.

## Field types (schema)
| type | use for | notes |
|---|---|---|
| `text` / `textarea` | free text, URLs, IDs | |
| `switch` | any On/Off option | **never** checkboxes |
| `switchText` | "show X" + its text in one row | `key` = text, `toggleKey` = boolean |
| `select` | long option lists (heading level) | |
| `segmented` | 2–4 mutually exclusive options (shape) | |
| `color` | any color | popover picker + brand swatches + hex |
| `slider` | bounded numbers with units (px) | `min/max/step/unit` |
| `stepper` | small integer counts (cards, per row) | `min/max` |
| `group` | visually group related fields ("Button 1") | not a value |
| `list` | repeatable items (cards) | `countKey` links to a stepper |

Every field can take `visibleWhen(config)` to hide irrelevant controls (e.g. border color when width is 0).

## Rules (from the product brief — apply to every component)
1. Modern controls only: switches for On/Off, color pickers for colors, sliders/steppers for numbers. Consistent across components.
2. Config is split into **A Content** (titles, descriptions, button labels/URLs, items), **B Widget configuration** (widget ID, counts, show/hide, behavior), **C Styles** (colors, shapes, radius, borders, sizes).
3. Layout: functional description → config (left) + **sticky** live preview (right) → output code. Don't add per-widget layout code.
4. Output code shows HTML / Script / Data, all **live from config** (conditional markup, widget ID, data JSON). Copy button + `Code copied` toast is provided by `CodeOutput`.
5. Preview viewport presets are Desktop / Tablet / Mobile (iframe → real media queries). Widget CSS uses `@media (max-width: 768px)` (tablet) and `(max-width: 480px)` (mobile).
6. Generated output does not need colors or highly specific styling; style options only need to demonstrate capability in the preview.
7. If a widget can be "removed" (all content off), implement `isEmpty(config)`; the frame shows "Component empty/removed".
8. Keep preview markup class names identical to the real widget's markup so the CSS and the generated HTML stay aligned.
9. Pass style values to the preview as CSS custom properties on the root element (`--card-color`, `--seo-radius`…), not inline styles on every node.

## Brand (from saffire.com)
Blue `#007bc7` (primary), dark blue `#005b94`, navy `#003c61`, orange `#f26922` (accent), green `#66bb6a` (CTA/success), sky `#daf1ff` (soft surface), text `#222`. Tooling font: Outfit (stand-in for Strawford). Preview font: Poppins. Tokens live in `src/index.css`; use the Tailwind names `brand-blue`, `brand-navy`, `brand-orange`, `brand-green`, `brand-sky`. Light theme only.

## Skills
- `/new-category` — create a new component family.
- `/new-component` — build a component from a filled spec in `docs/specs/`.
- `/update-component` — apply a change request to an existing component.
