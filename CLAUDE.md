# Components Live Preview (Saffire) — Testing POC

Vite + React 19 + TS + Tailwind v4 + shadcn/ui tool to preview and configure Saffire website widgets. Each component page has three config sections (A Content, B Widget configuration, C Styles), a live iframe preview (Desktop/Tablet/Mobile + popup) and generated HTML / SCSS / CSS / Script / Data. There is also a Layout builder (`/layout-builder`, code in `src/combiner/`) for page layouts.

`npm run dev` · `npm test` · `npm run typecheck` · `npm run build` · `npm run check:output` (output standards) · `npm run check:unused` (unused files/deps). Run test + typecheck after every change.

## Where things go
- `src/widgets/<category>/category.ts`: a category (sidebar, tabs, homepage). `upcoming: [...]` lists planned components ("coming soon").
- `src/widgets/<category>/<component>/`: one component. `index.ts` holds the metadata, plus `schema.ts`, `Preview.tsx`, `styles.ts`, `codegen.ts` and `codegen.test.ts`. **Adding a folder = adding a page.** No registry, routing or nav edits.
- `src/tooling/`: generic machinery shared by all widgets (fields, preview, outputs, style model). Change it generically, never for one widget.
- `src/tooling/outputProfile.ts`: **naming conventions of the generated code** (tabs, CSS var naming, container classes, breakpoints, headers).
- `src/combiner/`: Layout builder (pure model in `model.ts`, covered by `model.test.ts`).
- `docs/specs/<category>--<component>.md`: the source of truth for each component. The template is `docs/component-spec.template.md`.
- `docs/reference.md`: full reference (field types, style model, container, buttons, Layout builder, brand, ordering). **Read it when building or changing a component.**
- `docs/output-integration.md`: how to adopt the real source-code structure and nomenclature when it arrives.
- `output-standards/`: the Prettier + Stylelint configs the generated code must follow (see its README).
- `docs/brief/`: the original brief, brand references and logos.
- `docs/mirror-sites.md`: the six Saffire starter sites (Mango, Banana, Grape, Cherry, Peach, Lemon), the functional and visual reference for every component.

## Golden rules (every component)
1. Content (A) = **only what the client edits** (texts, labels, URLs, items). Show/hide toggles go in B → "Show / hide". Styles go in C.
2. Use only the field types (switches, color pickers, sliders with number input, steppers, segmented, typography, buttonStyle). No native checkboxes or color inputs.
3. Every text element gets a `typography` field. Every button is a generic Button 1/2 with a label, class `button button-N` and a `buttonStyle` field. A button renders only with a URL and a label (shared helper + URL `tip`).
4. All CSS comes from `styles.ts` (`Sheet`, variables as `$$name`). The preview and the SCSS/CSS output use the same sheet. No static `.css` files, and no inline styles in `Preview.tsx`.
5. `Preview.tsx` mirrors the real markup and class names. Links use `onClick={previewLinkClick(url)}` and `{...linkAttributes(url, label)}`.
6. Codegen is live from config (`lines()` for optional markup) and returns `{ html, script, data }`. The tooling adds the container wrapper and SCSS/CSS.
7. Each widget's own block gets `widthFields()` (Max width / 100%). The global container is added automatically (opt out with `container: false`).
8. Implement `isEmpty` if the widget can be "removed".
9. Defaults match the live Saffire widgets (saffire-docs-poc): `#0079c2`, text `#313841`, Poppins.
10. Every rendering rule in the spec gets a test in `codegen.test.ts`.
11. Anything that can differ per viewport is a `responsive: true` field (`responsive()` / `responsiveType()` in styles). Media overrides reuse the base selectors exactly. Never hard-code tablet/mobile values; put them in `withOverrides` defaults.
12. Generated SCSS/CSS must pass `npm run check:output` (`output-standards/`: Stylelint + Prettier, SCSS ≡ CSS ≡ preview). Fix the generator, not the widget.

## Skills
- `/mirror-sites <component>`: study a component on the Saffire starter sites (markup, behavior, styles) before defining it.
- `/new-component <spec>`: build a component from a filled spec.
- `/update-component <category>/<component> <change>`: change an existing one.
- `/new-category <name>`: add a category, or planned "coming soon" items.
- `/adopt-source-structure <path>`: map the real source structure and nomenclature onto the outputs.
- `/update-output-standards <config>`: change the Prettier/Stylelint rules for the output and make every component comply.

Keep this file short. Detail belongs in `docs/reference.md`.
