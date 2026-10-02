---
name: update-component
description: Apply a change request (new options, behavior changes, layout/style updates) to an existing Components Live Preview component while keeping its spec, codegen and tests in sync. Use when the user asks to change, extend or fix an existing component page, or a change that must apply to all components.
argument-hint: "<category>/<component> <what to change | path to change request>"
---

# Update component

1. Read `CLAUDE.md`, then the target folder `src/widgets/<category>/<component>/` and its spec `docs/specs/<category>--<component>.md`. Open `docs/reference.md` only for the sections you need.
2. Sort each requested change into one of these kinds:
   - **Option**: edit `schema.ts`. Add it to the type, defaults and the right section. Client-editable text goes in A, toggles in B "Show / hide", styles in C.
   - **Rendering rule**: update the shared helper in `codegen.ts` used by both Preview and codegen. Never patch only one of them.
   - **Style**: add a var plus rules in `styles.ts`. No inline styles in `Preview.tsx`.
   - **For all components**: change `src/tooling/*` generically (e.g. a field type, the container, `outputProfile.ts` for output naming). Then run the tests: `output.test.ts` covers every widget.
3. Update the spec so it stays the source of truth (config table, rules, responsive behavior).
4. Add or adjust tests in `codegen.test.ts` for every changed rule.
5. Verify: `npm test`, `npm run typecheck`, and a browser check at the 3 viewports.
6. Summarize what changed (with file links) and any part of the request you interpreted.
