---
name: new-category
description: Create a new component category in Components Live Preview — a new sidebar group, category tab and homepage catalog entry under src/widgets/<slug>/. Use when a spec says "Category: NEW" or the user asks for a new component category.
argument-hint: "<Category name> [description]"
---

# New category

A category is a folder `src/widgets/<slug>/` with a `category.ts`. The registry picks it up automatically (sidebar tree, category tabs, `/<slug>` overview route). Nothing else needs editing.

## Steps
1. Work out `name`, `slug` (kebab-case, becomes the URL), a one-sentence `description`, and `order`. To pick `order`, read the existing `src/widgets/*/category.ts` files and use the next multiple of 10, unless the user wants a specific position.
2. Check `src/widgets/<slug>/` doesn't exist yet. If it does, stop and tell the user.
3. Create `src/widgets/<slug>/category.ts`:
   ```ts
   import { defineCategory } from '@/tooling/types'

   export default defineCategory({
     name: '<Name>',
     description: '<One sentence about this category of components.>',
     order: <n>,
   })
   ```
4. Only create `src/widgets/<slug>/shared/` when two or more components in the category will share CSS or codegen helpers. The registry ignores `shared/`. Never put an `index.ts` widget definition there.
5. To list components that aren't built yet, add `upcoming: [{ name, summary }]` to `category.ts`. Each one gets a "coming soon" page at `/<slug>/<slugified-name>`. When you later build one with `/new-component`, use the same slug and the placeholder disappears automatically.
6. A category with no components and no `upcoming` items shows a "coming soon" page. Usually continue straight into `/new-component` for its first child.
7. Run `npm run typecheck`.

Follow the conventions in `CLAUDE.md`.
