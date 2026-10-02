# Components Live Preview (Saffire)

Interactive tool to explore, configure and preview Saffire website widgets. A homepage explains the tool. Each component page shows the functional description, a config panel (A Content / B Widget configuration / C Styles), a live responsive preview, and the generated **HTML / SCSS / CSS / Script / Data**.

## Stack
Vite · React 19 · TypeScript · Tailwind v4 · shadcn/ui (`src/components/ui`, Radix via `radix-ui`) · react-router · react-frame-component (iframe preview) · react-colorful · sonner (toasts) · prism-react-renderer · @fontsource fonts · Vitest.

Commands: `npm run dev` · `npm test` · `npm run typecheck` · `npm run build`.

## Structure
```
src/
  app/                 shell: Layout (logo header, category tabs, collapsible sidebar), Sidebar tree / icon rail, HomePage, pages
  assets/              tool-logo.png (header, white) · flame-icon.png ("Check Layouts" sidebar link)
  combiner/            Combiner tool (Testing POC): model.ts (pure layout ops + localStorage), sections.ts (section schema + CSS),
                       Scheme.tsx (dnd-kit drag & drop), Inspector.tsx, CombinedPreview.tsx, CombinerPage.tsx
  tooling/             generic, widget-agnostic machinery — change rarely
    types.ts           WidgetDefinition, CategoryDefinition, field types, defineWidget()
    registry.ts        folder-driven registry (import.meta.glob) — never edit to add widgets
    output.ts          withContainer() + outputFiles() (all tabs) + previewCss()
    stylesheet.ts      style model → toCss() / toScss()  (variables via `$$name`)
    typography.ts      Typography type, typography() defaults, typeStyles(), FONTS
    container.tsx      global "Uses container" options (Widget configuration), sheet, HTML wrapper
    buttons.ts         ButtonStyle + buttonStyle() defaults + customButtonStyles() — per-button "custom style"
    layout.ts          widthFields() / widthDecls() — standard "Max width / 100%" option for a widget's own block
    assets.ts          sample backgrounds + uploads (localStorage), previewUrl()/outputPath()
    ComponentPage.tsx  page layout: description → [config | sticky preview] → code
    ConfigPanel.tsx    renders sections A/B/C (with info tooltips)
    fields/            FieldRenderer + controls (ColorPicker, SliderControl, Stepper, TypographyControl, ImagePicker)
    PreviewFrame.tsx   iframe + Desktop 1280 / Tablet 768 / Mobile 375, scale-to-fit, fonts, empty state, resizable popup
    CodeOutput.tsx     tabs + Copy button + "Code copied" toast
    previewLinks.tsx   previewLinkClick(url): preview links never navigate; centered notice + confetti (CenterNotice.tsx):`n                       "Navigating to section" (same domain) or "Opening external URL in a new tab"
    codegen.ts         helpers: lines(), linkAttributes(), isExternalUrl(), json()
  widgets/
    <category>/                 a component family → sidebar group + category tab
      category.ts               defineCategory({ name, description, icon, order, upcoming })  — icon (lucide) for the collapsed sidebar;
                                `upcoming: [{ name, summary }]` = planned components with a "coming soon" page (a real folder with the same slug replaces it)
      shared/                   optional helpers shared by the family (ignored by the registry)
      <component>/              one page → /<category>/<component>
        index.ts                defineWidget({...}) — metadata + wiring
        schema.ts               Config type, defaults, schema (A/B/C)
        Preview.tsx             React render of the real widget markup (classes only, no inline styling)
        styles.ts               styles(config) → Sheet  (preview CSS + SCSS + CSS output)
        codegen.ts              codegen(config) → { html, script, data } (+ isEmpty, rule helpers)
        codegen.test.ts         Vitest for rendering rules + styles
docs/
  component-spec.template.md        fill one per new component (the "context")
  specs/<category>--<component>.md  filled specs (source of truth for each widget)
```
Folder names are URL slugs. **Order:** families are sorted by `order` in each `category.ts`, components inside a family by `order` in their `index.ts`, and `upcoming` items keep their array order (after the built ones). Lower comes first, ties sort alphabetically, and a missing order counts as 100. The sort is `byOrder` in `tooling/registry.ts`. To add a category or a component, add a folder. The sidebar tree, category tabs, homepage catalog and routes update automatically.

## How styles work
`styles(config)` returns a `Sheet` with these parts:
- `scope`: the widget root selector the CSS custom properties are declared on.
- `vars`: variables, grouped as Colors / Typography / Layout.
- `rules`: nested rules, plus `{ media: 'tablet' | 'mobile', rules }` blocks.

Inside a value, reference a variable as `$$name`. SCSS renders it as `$name` and CSS as `var(--name)`. The **same sheet** is injected into the preview and exported, so the preview and the output can never drift apart. Text styles always come from `typeStyles(prefix, config.xFont)`. It creates the `<prefix>-font-family / -font-size / -font-weight / -color` variables and returns `decls` plus a separate `clamp` (line clamp when enabled). Spread both on the text element, or put `clamp` on an inner element (e.g. one title line). Use `scaledSize(prefix, 0.8)` for smaller breakpoints.

The container is global: `withContainer()` adds `useContainer` and a "Container" group to every widget's **Widget configuration** (B). The group holds width (Boxed with a max width, or Full width edge to edge), inner content max width, padding, background color, and background image + position (always cover). The tooling wraps the preview and the HTML in `.widget-container > .widget-container-inner`, and prepends the container sheet. Opt out with `container: false`.

## Field types (schema)
| type | use for | notes |
|---|---|---|
| `text` / `textarea` | free text, URLs, IDs | |
| `switch` | any On/Off option | **never** checkboxes |
| `switchText` | "show X" + its text in one row | `key` = text, `toggleKey` = boolean |
| `select` | long option lists (heading level) | |
| `segmented` | 2–4 mutually exclusive options (shape, alignment, position) | |
| `color` | backgrounds, shapes, borders | popover picker + brand swatches + hex; **transparency on by default** (alpha slider, Transparent swatch, `#rrggbbaa`). `solid: true` for colors that must be opaque. Text colors (typography) are always solid |
| `slider` | bounded numbers with units (px, %, em) | `min/max/step/unit`; always paired with a typed number input (clamped, ↑/↓ to step) |
| `stepper` | small integer counts (cards, per row) | `min/max` |
| `typography` | **every text element** (not buttons) | value from `typography({...})`; includes clamp on/off + lines |
| `buttonStyle` | per-button custom style (Button 1 / Button 2) | switch + panel: background, hover bg/text, font, radius, border, shadow, padding |
| `image` | background images | none / 5 samples / uploads (stored in this browser) |
| `group` | visually group related fields ("Button 1", "Typography") | not a value |
| `list` | repeatable items (cards) | `countKey` links to a stepper |

Every field can take `visibleWhen(config)` to hide controls that don't apply (e.g. border color when the width is 0), and `tip` for an info tooltip next to its label. List item fields take `tip` too.

## Rules (from the product brief — apply to every component)
1. Modern controls only: switches for On/Off, color pickers for colors, sliders and steppers for numbers. Keep them consistent across components.
2. Config is split into **A Content** (titles, descriptions, button labels/URLs, items), **B Widget configuration** (widget ID, counts, show/hide, behavior, uses container) and **C Styles** (alignment/position, typography, colors, shapes, radius, borders, sizes, container).
3. Every text element (not buttons) gets a `typography` field. Font family, size, weight and color are exported as variables.
4. Layout: functional description → config (left) + **sticky** live preview (right) → output code. Don't add per-widget layout code.
5. Output is HTML / SCSS / CSS / Script / Data, all **live from config**. The tooling builds SCSS/CSS from `styles()`, so widgets only return `{ html, script, data }`.
6. Viewports: Desktop / Tablet (≤768) / Mobile (≤480), in an iframe so real media queries apply.
7. If a widget can be "removed" (all content off), implement `isEmpty(config)`. The frame then shows "Component empty/removed".
8. Preview markup uses the real widget's class names and structure, so the CSS and the generated HTML stay aligned.
9. Buttons are generic **Button 1 / Button 2** with an editable label (Content). A button renders only when it's shown, has a label, **and has a URL**. Put that rule in a shared helper used by Preview and codegen, and add the URL `tip`.
10. Each widget's own block offers `widthFields()` (Max width / 100%) in Styles.
11. Config sections and list items are single-open accordions.
12. Every interactive element shows a pointer cursor (global rule in `index.css`). Custom clickable elements must be a `button`/`a` or have an interactive role.
13. Content (A) is the **only** client-managed section. `ConfigPanel` shows the "Client" badge and callout. Don't put anything the client can't edit in `content`. **Show/hide toggles (show title, show description, show button N, …) always go in Widget configuration** (a "Show / hide" group); Content only holds the texts, labels, URLs and items, hidden with `visibleWhen` when their element is off.
14. There is no "site base URL" option: external links are detected against `window.location.origin` (`currentOrigin()` in `tooling/codegen.ts`), so it works on any hosting.
    Every button gets its own class (`button button-1`, `button button-2`) and a `buttonStyle` field in Styles → "Buttons". Apply it with `customButtonStyles(prefix, '.button.button-N', config.buttonNStyle)` inside the widget root rule, so it overrides the default `.button` rule.
15. A family with no components yet shows a "coming soon" page. Families start collapsed in the sidebar, except the active one.
16. Base and default styles match the existing Saffire widgets (saffire-docs-poc.vercel.app), e.g. blue `#0079c2`, text `#313841`, Poppins.

## Combiner (Testing POC)
`/combiner` builds page layouts from the registered components. There is no code output yet.
- A layout is made of sections. Each section is a container (Boxed/Full width, max width, inner width, padding, background color/image + position, all reused from `containerOptionFields`) plus 1–3 columns, proportions, gap, vertical alignment and "stack on tablet".
- Columns hold component instances. Each instance has its own full widget config, edited with the same `ConfigPanel`.
- Widget IDs are kept unique per layout (`customCards`, `customCards2`, …) because the CSS is scoped by them.
- Drag and drop uses `@dnd-kit`. Section ids are prefixed `s:`, column droppables `c:` and items `i:`. Items move across columns in `onDragOver` and reorder in `onDragEnd`.
- The layout is saved to localStorage (`live-preview:combiner:v1`). On load, unknown components are dropped and new config defaults are merged in.
- New components appear in the Combiner automatically (the "Add" menu reads the registry). Keep `model.ts` operations pure and covered by `model.test.ts`.
## Brand (from saffire.com)
- Tooling UI: blue `#007bc7` (primary), dark blue `#005b94`, navy `#003c61`, orange `#f26922` (accent/CTA), green `#66bb6a` (success), sky `#daf1ff` (soft surface), text `#222`.
- Font: Outfit (stand-in for Strawford).
- Tokens live in `src/index.css`. Use the Tailwind names `brand-blue`, `brand-navy`, `brand-orange`, `brand-green`, `brand-sky`.
- Light theme only.
- Widget previews use the widget's own styles. The fonts available there are listed in `tooling/typography.ts → FONTS`, loaded in `PreviewFrame`.

## Skills
- `/new-category`: create a new component family.
- `/new-component`: build a component from a filled spec in `docs/specs/`.
- `/update-component`: apply a change request to an existing component.
