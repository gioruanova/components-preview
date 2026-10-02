---
name: update-output-standards
description: Change or adopt coding standards (Prettier / Stylelint configs, e.g. a new .prettierrc or .stylelintrc.json) for the generated output of Components Live Preview, and make every component's SCSS/CSS/HTML/JS output comply. Use when the user provides or changes lint/format rules for the output code, or when `npm run check:output` fails.
argument-hint: "<new config pasted or path> | fix"
---

# Update output standards

Read `output-standards/README.md` first.

1. **Update the config.** Write the new rules to `output-standards/prettier.json` and/or `output-standards/stylelint.json`, as plain JSON without a BOM. If it extends new packages (e.g. another stylelint config), `npm i -D` them.
2. **Run `npm run check:output`.** It covers every widget × about 60 config variations, so the failures show exactly which rule and which variation.
3. **Fix in the generator, never per widget.**
   - Formatting (wrapping, quotes, indentation) is handled by Prettier at display time (`src/tooling/formatCode.ts`). Nothing to do unless a new parser is needed.
   - SCSS/CSS rules → `src/tooling/stylesheet.ts`:
     - Value normalisation: `normalise`, `zeroLengths`, `collapseShorthand`, `mergeLonghands`.
     - Declaration order: `ORDER`, from stylelint-config-recess-order.
     - Blank lines and comments: `toScss` / `toCss`.
     - Add a new helper next to these if needed.
   - Rules about variable names → `src/tooling/outputProfile.ts` → `varName`.
   - Font quoting → `fontStack` in `src/tooling/typography.ts` (quoted inside variables, unquoted in literal `font-family`).
   - Only if a rule truly depends on one widget's values, fix that widget's `styles.ts`.
4. **Verify:** `npm run check:output`, `npm test`, `npm run typecheck`. Then check one component's SCSS tab in the browser (the panel shows "Prettier · output standards").
5. **Report** the rules changed, the generator changes, and any rule you disabled (with the reason).
