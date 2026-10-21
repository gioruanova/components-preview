---
name: update-component
description: Apply a change request (new options, behavior changes, layout/style updates) to an existing Components Live Preview component while keeping its spec, codegen and tests in sync. Can target one output of the component only (HTML, SCSS, CSS, Script, Data, Preview, content options or docs). Use when the user asks to change, extend or fix an existing component page, to change just one part of its generated code (e.g. "only the HTML", "the script", "the SCSS"), or a change that must apply to all components.
argument-hint: "<category>/<component> [html|scss|css|script|data|preview|options|docs] <what to change | path to change request>"
---

# Update component

1. Read `CLAUDE.md`, then the target folder `src/widgets/<category>/<component>/` and its spec `docs/specs/<category>--<component>.md`. Open `docs/reference.md` only for the sections you need.
   If the change should match the live Saffire sites, check them first with the `/mirror-sites` steps (`docs/mirror-sites.md`).
2. **Targeted change?** If the request names one part of the component (a target word in the arguments, or "only the HTML / script / SCSS…"), follow the matching row of [Targets](#targets) and touch only its files. If it doesn't, sort each requested change into one of these kinds:
   - **Option**: edit `schema.ts`. Add it to the type, defaults and the right section. Client-editable text goes in A, toggles in B "Show / hide", styles in C.
   - **Rendering rule**: update the shared helper in `codegen.ts` used by both Preview and codegen. Never patch only one of them.
   - **Style**: add a var plus rules in `styles.ts`. No inline styles in `Preview.tsx`.
   - **For all components**: change `src/tooling/*` generically (e.g. a field type, the container, `outputProfile.ts` for output naming). Then run the tests: `output.test.ts` covers every widget.
3. Update the spec so it stays the source of truth (config table, rules, markup, script, data, responsive behavior).
4. Add or adjust tests in `codegen.test.ts` for every changed rule.
5. Verify: `npm test`, `npm run typecheck`, and a browser check at the 3 viewports. Run `npm run check:output` whenever styles changed.
6. Summarize what changed (with file links), which outputs it affects, and any part of the request you interpreted.

## Targets

Each output tab of the page comes from one place. Change that place, never the displayed code: HTML / SCSS / CSS / Script / Data are generated live from config.

| Target | Output tab | Edit | Keep in sync | Never |
|---|---|---|---|---|
| `html` | HTML | `toHtml(c)` in `codegen.ts` (`lines()` for optional markup) | `Preview.tsx` (same markup and class names), shared rendering helpers, spec §3 | Patch only one of HTML / Preview; add the container wrapper (the tooling adds it) |
| `preview` | Live preview | `Preview.tsx` | `toHtml` when the markup changes, spec §3 | Inline styles; links without `previewLinkClick(url)` + `linkAttributes(url, label)` |
| `scss` / `css` | SCSS, CSS | `styles.ts` (`Sheet`, vars as `$$name`, responsive `at(vp)` mirroring the base selectors) | Both tabs and the preview come from the same sheet; spec §6 (C) and §8 | Edit SCSS or CSS separately (there is one source); hard-code tablet / mobile values; naming conventions here (they live in `src/tooling/outputProfile.ts`, generic) |
| `script` | Script | `toScript(c)` in `codegen.ts` | Data keys it reads (`toData`), spec §4 | Read keys that `toData` doesn't output; widget IDs other than the configured one |
| `data` | Data | `toData(c)` in `codegen.ts` | `toScript` (keys it reads), spec §5 | Rename a key without updating the script and the spec |
| `options` | Config panel (A / B / C) | `schema.ts` (type, `defaults`, `schema`) | Every output that uses the option; spec §6 | Toggles in A, client text in B / C (golden rule 1); native inputs (golden rule 2) |
| `docs` | Description, Specs tab, spec file | `index.ts` (`description`, `specs`, `previewHint`), `docs/specs/<category>--<component>.md` | Each other: the page and the spec file must say the same | Change code for a docs-only request |

Rules for every target:
- **Stay in scope.** Touch only the files of the chosen target. If the change also needs another target (e.g. a new class in the HTML that needs a style, or a new data key the script must read), say so and ask before widening, unless the user already asked for it.
- **Shared helpers first.** If the change is a rendering rule (what shows and when), update the helper used by both Preview and codegen, whatever the target.
- **Tests.** Add or adjust the test for what changed: `toHtml` / `toScript` / `toData` assertions in `codegen.test.ts`; `toCss` / `toScss` for styles. Run `npm run check:output` for `scss` / `css`.
- **Output naming** (tabs, CSS variable names, container classes, breakpoints, headers) is generic: change it in `src/tooling/outputProfile.ts` with `/update-output-standards` steps if it's a lint rule, never in one widget.
