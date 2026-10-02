# Components Live Preview (Saffire)

Explore, configure and preview Saffire website widgets live. Each page shows the functional description, the configuration (Content / Widget configuration / Styles, plus an optional container with background), a live preview with Desktop / Tablet / Mobile viewports, and the generated HTML / SCSS / CSS / Script / Data, each with a copy button.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # codegen + rendering-rule tests
npm run build
```

## Combiner (Testing POC)
At `/combiner` you can stack sections (1–3 columns, any container settings), drop any component into them, drag and drop to rearrange, and preview the result on Desktop, Tablet, Mobile or in a resizable popup. The layout is saved in your browser.

## Adding components
Components are grouped into **categories** (families). Both are just folders:

```
src/widgets/<category>/category.ts            → new category (sidebar group + tab)
src/widgets/<category>/<component>/index.ts   → new component page
```

Workflow with Claude Code:
1. Copy `docs/component-spec.template.md` to `docs/specs/<category>--<component>.md` and fill it in (markup, script, data, options, rules).
2. Run `/new-component docs/specs/<file>.md`. It creates the category first if needed (`/new-category`).
3. Run `/update-component <category>/<component> <change>` for later change requests.
4. Planned components: add them to `upcoming` in a `category.ts` and they get a "coming soon" page. Build one later with the same name and the placeholder disappears.

## Generated code conventions
All naming of the generated code (tabs, CSS variable naming, container classes, breakpoints, file headers) lives in `src/tooling/outputProfile.ts`. When the real source-code structure is provided, follow [docs/output-integration.md](docs/output-integration.md) or run `/adopt-source-structure <path>`.

## Docs
- [CLAUDE.md](CLAUDE.md): short context and golden rules (loaded by Claude Code every session).
- [docs/reference.md](docs/reference.md): source map, field types, style model, container, buttons, Combiner, brand.
- [docs/specs/](docs/specs): one spec per component (the source of truth).
- [docs/brief/](docs/brief): the original brief and brand assets.
