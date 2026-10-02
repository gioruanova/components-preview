# Component spec — <Component name>

> Copy to `docs/specs/<category>--<component>.md`, fill every section, then run `/new-component docs/specs/<file>.md`.
> Leave a section as "n/a" rather than deleting it.

## 1. Identity
- **Category:** `<existing-category-slug>` — or **NEW**: name, slug, one-line description
- **Component name:** <Display name>
- **Component slug:** `<kebab-case>` (folder + URL)
- **Status:** stable | beta | draft | deprecated
- **Summary (one line):** <shown on the category overview>
- **Order in category:** <number, lower first — optional>

## 2. Functional description
Bullets shown at the top of the page. Wrap code in backticks.
- …
- …

## 3. Real markup (HTML template)
Paste the widget's real HTML with `${Placeholders}`.
```html

```

## 3b. Real CSS (optional, recommended)
Paste the live widget's CSS, or link the page it runs on. Its values become the default styles.
```css

```

## 4. Script
Paste the real script (jQuery etc.). Note any helper it uses (e.g. `updateLinksAttributes`).
```js

```

## 5. Data
Shape + realistic default values (these become the simulator defaults).
```json

```

## 6. Config options
One row per option. Section: **A** Content · **B** Widget configuration · **C** Styles.
Field type: text · textarea · switch · switchText · select · segmented · color · slider · stepper · typography · image · group · list.
Every text element (not buttons) needs a `typography` row. Don't list container options: "Uses container" (width, max width, inner width, padding, background color/image) is added to every component automatically.

| Section | Label | Key | Field type | Default | Options / range | Visible when | Notes |
|---|---|---|---|---|---|---|---|
| B | Widget ID | widgetId | text | `customX` | | | |
| A | | | | | | | |
| C | | | | | | | |
| C | Title typography | titleFont | typography | Poppins 32 / 700 / #313841 | | | |

## 7. Rendering rules
Conditional logic the preview *and* codegen must follow (e.g. "button only if the item has a URL", "container omitted when empty").
- …

## 8. Responsive behavior
- Desktop (1280):
- Tablet (≤768):
- Mobile (≤480):

## 9. Empty / removed state
When does the widget count as "no data" (→ "Component empty/removed")? Or "n/a".

## 10. Out of scope / open questions
- …
