---
name: adopt-source-structure
description: Adopt a provided source-code structure / nomenclature for the generated outputs (HTML, SCSS, CSS, Script, Data) of Components Live Preview — output profile, widget codegen/markup/styles, specs and templates. Use when the user provides the real code structure, naming conventions, file layout or templates that the outputs should follow.
argument-hint: "<path to the provided structure, e.g. docs/source-structure>"
---

# Adopt source structure

Read `docs/output-integration.md` first. It maps each concern to its single owner. Then read `src/tooling/outputProfile.ts`.

## 1. Understand the target
- Read the provided material: examples, naming rules, file layout. If it's pasted in chat, save it to `docs/source-structure/` first so it's versioned.
- Write a short mapping table (current → target) and confirm it with the user before editing. Cover:
  - Variable naming and prefix.
  - Container/class names.
  - Breakpoints.
  - Tabs and file names.
  - Per-widget class names and data keys.
- Ask only about real ambiguities, for example a data key with no equivalent.

## 2. Global conventions → `src/tooling/outputProfile.ts`
`tabs`, `labels`, `varName`, `breakpoints`, `classNames`, `header`. One file, and it applies to every widget.

## 3. Per widget (`src/widgets/*/*/`)
- `codegen.ts` (HTML / Script / Data) and `Preview.tsx` must use **identical** class names and structure.
- In `styles.ts`, rename selectors and `vars` names. Keep using `$$name` references, because `varName` handles prefixes.
- Update `codegen.test.ts` expectations to the new names, keeping one test per rule.
- If many widgets share a pattern (e.g. a button partial), put it in `src/tooling/` (or `widgets/<category>/shared/`) instead of repeating it.

## 4. Keep future work aligned
- Templates in `.claude/skills/new-component/templates/` use the new conventions.
- The `docs/specs/*` markup, data and config tables are updated.
- `docs/reference.md` covers any new rule. Add a line to `CLAUDE.md` only if it's a golden rule.

## 5. Verify
`npm test` (including `src/tooling/output.test.ts`) and `npm run typecheck`, then check the output tabs of every component in the browser. Report the mapping table, the files changed, and anything left unmapped.
