# Output standards

The coding standards that the **generated** code (Output code panel: HTML / SCSS / CSS / Script / Data) must follow. These are the same configs as the real Saffire codebase.

| File | Applies to | How |
|---|---|---|
| `prettier.json` | every output tab | The Output panel formats each tab with it before showing or copying (`src/tooling/formatCode.ts`, lazy-loaded Prettier). |
| `stylelint.json` | SCSS + CSS tabs | `src/tooling/stylesheet.ts` emits compliant code: recess property order, short hex, modern `rgb()`, quotes, zero units, shorthands, blank lines. `npm run check:output` proves it. |

These are deliberately **not** root configs. They describe the output, not this tool's own source (Tailwind CSS would fail them).

## Guarantees (`npm run check:output` → `src/tooling/standards.test.ts`)
The tests run for every widget and about 60 generated config variations each: every toggle, option and slider extreme, typography, custom buttons and per-viewport overrides. They check that:
1. The CSS output equals the CSS the live preview uses (only asset URLs differ).
2. The SCSS output, compiled with Sass, produces exactly the same rules as the CSS output.
3. After Prettier, the SCSS/CSS pass `stylelint.json` with zero warnings.
4. Every `@media` override targets a selector of the base rules, so it has the same specificity and wins.

New widgets are covered automatically.

## Changing the standards
Edit these files (e.g. paste a new `.stylelintrc.json`), then run `npm run check:output`. If rules now fail, fix them in the generator (`stylesheet.ts`), not per widget. The `/update-output-standards` skill walks through this.
