# Reference

Detailed reference for building and changing components. `CLAUDE.md` has the short version.

## Source map
```
src/
  main.tsx               routes (Combiner + component pages are code-split with React.lazy)
  index.css              Tailwind tokens (brand colors), global pointer-cursor rule, keyframes
  app/                   shell: Layout (header, tabs, collapsible sidebar, footer, idea button), Sidebar,
                         HomePage, pages (category / component / coming soon), ComingSoon, IdeaButton
  assets/                tool-logo.png (header) · flame-icon.png ("Check Layouts" link)
  components/ui/         shadcn/ui primitives (generated: `npx shadcn add <name>`; fix `from "cn"` → `@/lib/utils`
                         and remove the stray `cn` npm package the CLI adds)
  tooling/
    types.ts             WidgetDefinition, CategoryDefinition, field types, defineWidget/defineCategory
    registry.ts          folder-driven registry (import.meta.glob) + ordering + upcoming placeholders
    output.ts            withContainer(), previewCss(), outputFiles() (tabs from the output profile)
    outputProfile.ts     naming conventions of the generated code (see docs/output-integration.md)
    stylesheet.ts        Sheet model → toCss() / toScss()
    typography.ts        Typography, typography() defaults, typeStyles(), scaledSize(), FONTS
    buttons.ts           ButtonStyle, buttonStyle() defaults, customButtonStyles()
    layout.ts            widthFields() / widthDecls() / widthVars()
    container.tsx        global "Uses container" fields, sheet, HTML wrapper, preview wrapper
    assets.ts            sample backgrounds + uploads (localStorage), previewUrl() / outputPath()
    codegen.ts           lines(), linkAttributes(), isExternalUrl(), currentOrigin(), json()
    previewLinks.tsx     previewLinkClick(url) → CenterNotice (centered message + confetti)
    ComponentPage.tsx · ConfigPanel.tsx · PreviewFrame.tsx · CodeOutput.tsx · ui.tsx
    fields/              FieldRenderer + controls (ColorPicker, SliderControl, Stepper, Typography, ButtonStyle, ImagePicker)
  combiner/              model.ts (pure ops + persistence) · sections.ts · Scheme.tsx (dnd-kit) · Inspector · CombinedPreview
  widgets/<category>/<component>/   index.ts · schema.ts · Preview.tsx · styles.ts · codegen.ts · codegen.test.ts
.claude/skills/          new-component (+ templates/) · update-component · new-category · adopt-source-structure
```

## Ordering
- Families sort by `order` in `category.ts`. Components sort by `order` in `index.ts`.
- Lower comes first, ties sort alphabetically, and a missing order counts as 100.
- `upcoming` items keep their array order and come after the built components.
- Sorting is done by `byOrder` in `tooling/registry.ts`.
- A real component folder whose slug matches an `upcoming` item replaces that placeholder.

## Field types
| type | use for | notes |
|---|---|---|
| `text` / `textarea` | texts, URLs, IDs | `placeholder`, `rows` |
| `switch` | On/Off (show/hide → Widget configuration) | `hint` |
| `select` | long option lists | `options` |
| `segmented` | 2–5 exclusive options (shape, alignment, position) | `options` |
| `color` | backgrounds, shapes, borders | alpha by default (`#rrggbbaa`, Transparent swatch); `solid: true` to disable |
| `slider` | bounded numbers | `min/max/step/unit`; always paired with a typed input (clamped, ↑/↓, Shift ×10) |
| `stepper` | small integer counts | `min/max` |
| `typography` | every text element | `typography({...})`: family, size, weight, italic, line height, spacing, case, color, clamp + lines |
| `buttonStyle` | per-button custom style | `buttonStyle({...})`: switch + panel (bg, hover bg/text, font, radius, border, shadow, padding) |
| `image` | background images | none / 5 samples / uploads (this browser only) |
| `list` | repeatable items | `itemFields`, `countKey` (stepper), `newItem`, `itemLabel` |
| `group` | visual grouping ("Show / hide", "Button 1", "Typography") | not a value; can have `visibleWhen` |

Every field accepts `visibleWhen(config)`, `help` and `tip` (an info tooltip). List item fields accept `tip`. Config sections and list items are single-open accordions. Content shows a "nothing to edit" hint when all its fields are hidden.

## Style model (`stylesheet.ts`)
- `styles(config)` returns `Sheet { scope, title, vars, rules }`.
  - `vars`: `{ name, value, group: 'Colors' | 'Typography' | 'Layout' }`.
  - `rules`: nested `{ sel, decls, nest }`. Use `&` for pseudo-classes and modifiers. Responsive rules go in `{ media: 'tablet' | 'mobile', rules }`.
- A value references a variable as `$$name`. SCSS renders `$name` and CSS renders `var(--name)` on `scope`. Names go through `profile.varName`.
- Text: `const t = typeStyles(prefix, config.xFont)`, then spread `t.vars` into `vars` and `...t.decls, ...t.clamp` into the rule. Use `scaledSize(prefix, 0.8)` for smaller breakpoints.
- Width: `...widthVars(c, 'x-max-width')` in vars, `...widthDecls(c, 'x-max-width')` in the root rule.
- Buttons: `const b1 = customButtonStyles('x-button-1', '.button.button-1', c.button1Style)`. Spread `b1.vars` into vars and put `b1.rule` inside the root rule (when not null).
- The preview iframe receives exactly `toCss([...containerSheet, widgetSheet])`, with real image URLs. The outputs use asset paths instead.

## Per-viewport values (responsive fields)
- Mark a field `responsive: true`. Values are stored as `<key>@tablet` / `<key>@mobile`, absent = inherit: Tablet inherits Desktop, Mobile inherits Tablet.
- **The preview viewport is the editing viewport.** Choosing Tablet in the preview (or with a field's viewport icons) makes responsive fields edit their tablet values. An orange dot means overridden, and "Reset" goes back to inheriting.
- Defaults per viewport: `export const defaults = withOverrides<C>({ ...desktop }, { 'cardsPerRow@tablet': 2 })` (keys are type-checked).
- In `styles.ts`: `const r = responsive(c, 'key')` → `r.desktop`, `r.tablet` / `r.mobile` (only when they change, otherwise undefined) and `r.at[vp]` (effective values). Build an `at(vp)` rule whose declarations use `r[vp]`. Undefined declarations are dropped, so media blocks only contain real differences.
- Typography: `responsiveType(prefix, responsive(c, 'xFont'), fluidOptions?)` → `base` / `tablet` / `mobile` (decls + clamp) and `vars`. Overrides get their own variables (`$x-font-size-tablet`).
- **Media overrides must use the same selectors and nesting as the base rules** (same specificity). `standards.test.ts` fails otherwise.
- Already responsive: SEO alignment, padding, typography and "Stack buttons". Cards per row, width, min width, height, aspect ratio, content position and typography. Container padding.

## Fluid typography
- In the typography popover, "Fluid size" + "Min size" produce `font-size: clamp(min, <size/ref × 100><unit>, max)`.
- Default unit is `vw` (reference 1280). Widgets inside sized boxes (cards) pass `{ unit: 'cqi', ref: <design width> }` and set `container-type: inline-size` on the box, so text follows the box width.
- Card titles also use `text-wrap: balance` and `overflow-wrap: break-word` for natural line breaks.

## Fonts are placeholders
- Preview fonts (`FONTS`) are for testing only. The real project font is chosen by the client and lives in the site theme under its own variable name.
- Every font picker shows `FONT_NOTE`, and the SCSS/CSS output repeats it as a comment above the font variables.
- When the real tokens are known, map them via `outputProfile.varName` / `fontStack` (see docs/output-integration.md).

## Output standards
- `output-standards/prettier.json` and `output-standards/stylelint.json` are the real codebase's configs, applied to the generated output (not to this tool's source).
- The Output panel Prettier-formats every tab (`tooling/formatCode.ts`, lazy-loaded). The generator emits Stylelint-compliant SCSS/CSS (`tooling/stylesheet.ts`).
- `npm run check:output` proves, for every widget and many config variations, that: CSS = preview CSS, SCSS compiled with Sass = CSS, the formatted code lints with zero warnings, and media overrides keep base specificity.
- To change the standards, use `/update-output-standards`.

## Container (global)
- `withContainer()` adds `useContainer` and a "Container" group to every widget's Widget configuration:
  - Boxed (max width) or Full width (edge to edge).
  - Inner content max width and padding.
  - Background color, and background image + position (always cover).
- Markup: `.{profile.classNames.container} > .{containerInner}`. The Combiner reuses the same fields (`containerOptionFields`) per section.

## Buttons and links
- Buttons are generic Button 1 / Button 2. The label and URL are Content, and "Show button N" is in Widget configuration.
- A button renders only when it's shown and has both a URL and a label (shared helper used by Preview and codegen).
- Each button has the class `button button-N` and a `buttonStyle` field in Styles → "Buttons".
- External = a different origin than the current page (`currentOrigin()`). There is no base-URL option. External links get `target/rel/aria-label`.
- Preview clicks never navigate. They show a centered "Navigating to section" or "Opening external URL in a new tab" message with confetti.

## Combiner (Testing POC)
- A layout is made of sections (a container plus 1–3 columns, proportions, gap, alignment and "stack on tablet").
- Columns hold component instances, each with its own widget config. Widget IDs are unique per layout.
- Drag and drop uses dnd-kit. Ids are prefixed `s:` (sections), `c:` (columns) and `i:` (items).
- The layout is saved to localStorage (`live-preview:combiner:v1`). On load, unknown components are dropped and new defaults are merged in.
- There is no code output yet.

## Brand
- Tooling UI: blue `#007bc7`, dark `#005b94`, navy `#003c61`, orange `#f26922`, green `#66bb6a`, sky `#daf1ff`, text `#222`. Font: Outfit (stand-in for Strawford). Light theme only.
- Tailwind names: `brand-blue`, `brand-navy`, `brand-orange`, `brand-green`, `brand-sky`.
- Widget defaults follow saffire-docs-poc: `#0079c2`, `#313841`, Poppins. Preview fonts are in `typography.ts → FONTS`.

## Deployment
- This is a single-page app: the host must serve `index.html` for every route, or reloading `/combiner` or `/<category>/<component>` returns a 404.
  - `vercel.json` (rewrite) and `public/_redirects` (Netlify) handle this.
  - On other hosts, add the equivalent "SPA fallback" rule.
- `main.tsx` reloads once on `vite:preloadError`, so tabs left open across a deploy recover instead of failing to load a lazy page.

## Performance notes
- Component pages, the Combiner and confetti are lazy-loaded. Keep heavy libraries out of `tooling/registry` imports (widgets load eagerly for the nav).
- If the widget count grows a lot (dozens), split each widget into an eager `meta` and a lazy `index` to keep the main bundle small.
