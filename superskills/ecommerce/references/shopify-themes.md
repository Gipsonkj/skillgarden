# Shopify themes (Liquid)

> Distilled from: shopify-liquid-themes (Shopify/liquid-skills, MIT declared in plugin.json); shopify-expert liquid-templating and performance-optimization (jeffallan/claude-skills, MIT). Written in this skill's own words; the full filter, tag and object references live in the original skill (see the router's Go deeper table).

Online Store 2.0 themes are JSON templates that place sections, which hold blocks, which can nest more blocks. Merchants edit them in the theme editor, so every setting you add is UI someone else will use.

## 1. Files and what goes where

```
layout/     theme.liquid (must output {{ content_for_header }} and {{ content_for_layout }})
templates/  product.json, collection.json ... which sections appear on each page type
sections/   full-width modules with {% schema %}: hero, product grid, FAQ
blocks/     nestable theme blocks with {% schema %}: slide, text, group
snippets/   reusable fragments via {% render %}, no schema
config/     settings_schema.json (global settings), settings_data.json (values)
locales/    en.default.json, en.default.schema.json, fr.json ...
assets/     static files (prefer {% stylesheet %} / {% javascript %} in components)
```

| Need | Use | Why |
|---|---|---|
| Merchant-placeable full-width module | Section | Has schema, appears in the editor, renders blocks |
| Small editable component, maybe nested | Theme block | Has schema, nests in sections and other blocks |
| Shared markup or logic the merchant doesn't edit | Snippet | Takes parameters, rendered with `{% render %}` |
| Logic shared between blocks | Snippet | Blocks can't render other blocks directly |

## 2. Liquid rules that bite

1. No parentheses in conditions and no ternary: nest `{% if %}` or use `{% if %}...{% else %}...{% endif %}`.
2. `for` loops stop at 50 items: wrap large arrays in `{% paginate collection.products by 24 %}`.
3. `contains` works on strings and arrays of strings, not on objects.
4. `{% render 'snippet' %}` has its own scope: pass every variable it needs as a parameter. `include` is deprecated.
5. `{% liquid %}` holds multi-line logic without delimiters; output inside it with `echo`.
6. `{% stylesheet %}` and `{% javascript %}` don't run Liquid and allow one of each per file; for setting-driven CSS use `{% style %}` or CSS variables.
7. Use `{{- -}}` and `{%- -%}` to trim whitespace in tight markup.
8. Money goes through `money` filters, never manual string maths; prices are in the shop's minor units in Liquid objects.

## 3. Section and block schema

```liquid
{% schema %}
{
  "name": "t:sections.feature_list.name",
  "tag": "section",
  "class": "feature-list",
  "settings": [
    { "type": "inline_richtext", "id": "heading", "label": "t:labels.heading" },
    { "type": "range", "id": "columns", "label": "t:labels.columns", "min": 1, "max": 4, "step": 1, "default": 3 }
  ],
  "blocks": [{ "type": "@theme" }, { "type": "@app" }],
  "max_blocks": 12,
  "presets": [{ "name": "t:sections.feature_list.name" }],
  "enabled_on": { "templates": ["index", "product"] }
}
{% endschema %}
```

- **Presets make a section or block addable** in the editor; without one it can only be placed in JSON.
- `@theme` accepts any theme block, `@app` accepts app blocks (add it wherever apps should be able to inject UI), a name accepts one block type.
- `range` needs `min`, `max` and `default`; `font_picker` needs `default`; `header` and `paragraph` are editor labels with no `id`.
- `visible_if` hides a setting until another setting makes it relevant: `"visible_if": "{{ block.settings.layout == 'vertical' }}"`.
- Put `{{ block.shopify_attributes }}` on the outermost element of every block so the editor can select it.
- One CSS property per setting: pass it as a CSS variable (`style="--gap: {{ block.settings.gap }}px"`). Several properties: make the select values class names.

## 4. Documentation and translations

- Every snippet starts with a `{% doc %}` block: one-line purpose, `@param {type} name - description` (brackets for optional), and an `@example` render call. Blocks rendered statically with `{% content_for 'block', type: 'x', id: 'y' %}` get one too.
- Every customer-facing string uses the `t` filter: `{{ 'products.add_to_cart' | t }}`. Editor labels use `t:` keys that live in `*.schema.json` locale files.
- Keys are snake_case, grouped by component, at most 3 levels deep; text is sentence case.
- Interpolate rather than concatenate: `{{ 'products.price_from' | t: price: product.price_min | money }}`.

## 5. Commerce patterns

**Variant picker.** Render options from `product.options_with_values`, keep the selected variant in the URL (`?variant=`), disable unavailable combinations, and update price, compare-at price, availability and media when the variant changes.

**Add to cart.** Use the `{% form 'product', product %}` tag so the form posts the right fields; for an AJAX cart use the theme's cart API endpoints and re-render the cart section rather than rebuilding totals in JavaScript.

**Collection filtering.** Loop `collection.filters` and their `values` (`param_name`, `value`, `active`, `count`); filters come from the Search & Discovery settings, so products need clean product types, vendors, tags or metafields.

**Metafields and metaobjects.** Read with `.value` (`product.metafields.custom.care.value`); render rich text or lists with `metafield_tag`. Avoid reading a metaobject reference for every product in a large loop; precompute on the product or limit the loop.

**Images.** `{{ image | image_url: width: 1200 | image_tag: loading: 'lazy', widths: '400,800,1200', sizes: '(min-width: 990px) 50vw, 100vw' }}`. Give the above-the-fold product image `loading: 'eager'` and `fetchpriority: 'high'`; always keep width and height so nothing shifts.

## 6. Performance

| Target (mobile, field data) | Good |
|---|---|
| LCP | under 2.5 s |
| INP | under 200 ms |
| CLS | under 0.1 |

- Defer non-critical JavaScript; load third-party app scripts on interaction where the app allows it. Uninstalled apps often leave snippets behind: search the theme for them.
- Lazy-load below-the-fold sections such as recommendations with the section rendering API and an IntersectionObserver.
- Preload only the LCP image and the main font; use `font-display: swap`.
- Fewer apps beat clever code: each app script is a cost on every page.
- The general Core Web Vitals method lives in `website-building` (`references/performance-cwv.md`).

## 7. Workflow with Shopify CLI

```bash
shopify theme dev --store your-store.myshopify.com   # local preview with hot reload
shopify theme check                                   # lint Liquid, schema, translations, performance
shopify theme push --unpublished                      # upload as a new unpublished theme
shopify theme pull --only templates/*.json            # pull editor changes before editing JSON
```

1. Work on a copy: duplicate the live theme or push unpublished. Never edit the published theme directly.
2. Pull JSON templates and `settings_data.json` before editing: merchants change them in the editor and a push overwrites their work.
3. Run `shopify theme check` and fix every error before any push; re-run until clean.
4. Preview on mobile and desktop, in the editor too (add, reorder, remove the section).
5. Publishing a theme changes the live store: ask before running `shopify theme publish` or pushing to the live theme.

## Checklist

- [ ] Section or block has a preset, translated labels and sensible defaults
- [ ] Snippets have `{% doc %}` headers; no `include`
- [ ] No hardcoded customer-facing text; locale keys added to `en.default.json` and schema locale file
- [ ] `block.shopify_attributes` on block wrappers; `@app` allowed where apps may inject
- [ ] Images sized with `image_url` widths, lazy below the fold, LCP image eager
- [ ] `shopify theme check` clean; tested on an unpublished theme; live publish confirmed by the user
