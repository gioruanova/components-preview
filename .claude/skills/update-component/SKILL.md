---
name: update-component
description: Apply a change request (new options, behavior changes, layout/style updates like Updates.txt) to an existing Components Live Preview component while keeping its spec, codegen and tests in sync. Use when the user asks to change, extend or fix an existing component page.
argument-hint: "<category>/<component> <what to change | path to change request>"
---

# Update component

1. Read `CLAUDE.md`, then the target folder `src/widgets/<category>/<component>/` and its spec `docs/specs/<category>--<component>.md`.
2. Sort each requested change into one of these kinds:
   - **Option**: a new or changed config field. Edit `schema.ts`: add to the config type, defaults and the right A/B/C section, with a field type from the catalog.
   - **Rendering rule**: update the shared helper in `codegen.ts` that both Preview and codegen use. Never patch only one of them.
   - **Style**: add a variable plus rules in `styles.ts`. Never use inline styles in `Preview.tsx`. New text elements get a `typography` field and `typeStyles()`.
   - **Tooling-wide** (affects every component, e.g. a new viewport preset or a new control type): change `src/tooling/*` generically. Check that every widget still works, and update `CLAUDE.md`.
3. Update the spec file so it remains the source of truth (config table, rules, responsive behavior).
4. Add or adjust tests in `codegen.test.ts` for every changed rule.
5. Verify as in `/new-component` step 4: typecheck, tests, a browser check at 3 viewports, build.
6. Summarize what changed, with file links, and any part of the request you interpreted.
