# Saffire Component Simulator

A modern, responsive simulator for Saffire widgets. Each page shows the functional description, the configuration (Content / Widget configuration / Styles), a live preview with Desktop / Tablet / Mobile viewports, and the generated HTML / Script / Data, with a copy button.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # codegen + rendering-rule tests
npm run build
```

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

Conventions, field types and brand tokens are documented in [CLAUDE.md](CLAUDE.md).
