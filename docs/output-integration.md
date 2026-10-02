# Adopting the real source-code structure

Today the generated code (HTML / SCSS / CSS / Script / Data) follows the conventions of the original POC. When the real source structure and nomenclature are provided, adopt them in this order. Each layer has a single owner.

| Concern | Owner | Typical change |
|---|---|---|
| Which tabs exist, their order and labels | `src/tooling/outputProfile.ts` → `tabs`, `labels` | e.g. add `twig`, hide `css` |
| CSS custom property / SCSS variable naming | `outputProfile.ts` → `varName` | e.g. `(n) => \`sf-${n}\`` → `$sf-card-color` / `--sf-card-color` |
| Breakpoints | `outputProfile.ts` → `breakpoints` | match the site's SCSS breakpoints |
| Font families (testing placeholders) | `typography.ts` → `fontStack` / `FONTS`, plus `varName` | point to the project's font tokens, e.g. `$font-primary` |
| Lint/format rules of the output | `output-standards/*.json` | see `/update-output-standards` |
| Global container class names | `outputProfile.ts` → `classNames` | e.g. `section-wrapper` / `section-inner` |
| File header / path comments | `outputProfile.ts` → `header` | e.g. `(tab, w) => \`widgets/${w.slug}/${w.slug}.${tab}\`` |
| Markup, class names, data keys, script | each widget's `codegen.ts` + `Preview.tsx` (they must match) | rename classes, new templates, new data contract |
| Style rules and variable names per widget | each widget's `styles.ts` | rename `vars`, selectors |
| How SCSS/CSS text is rendered | `src/tooling/stylesheet.ts` | e.g. emit mixins or `@use`, maps instead of flat vars |

## Steps
1. Put the provided structure under `docs/source-structure/` (examples, naming rules, file layout).
2. Run `/adopt-source-structure docs/source-structure`. It does the following:
   - Fills in `outputProfile.ts`.
   - Updates each widget's codegen, Preview and styles to the new names (Preview and HTML must keep identical class names).
   - Updates the specs (`docs/specs/*`), the new-component templates and `docs/reference.md`.
3. Verify with `npm test` and `npm run typecheck`. `src/tooling/output.test.ts` checks every widget against the profile. Then check the HTML/SCSS/CSS tabs in the browser.

## If the real structure needs new output types
- New tab: add the id to `CodeTabId` and `profile.tabs`, produce it in `outputFiles()` (`tooling/output.ts`), and if it's per-widget, add an optional field to `WidgetCode` (e.g. `twig?: string`).
- Multiple files per tab: extend `CodeFile` with `path` and render a file list in `CodeOutput.tsx`. Widgets keep returning plain strings.
