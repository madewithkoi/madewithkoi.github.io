# Koi Creative homepage

Static HTML, CSS, and JavaScript. No production dependencies or build step. Hosted as a static site (GitHub Pages today; any static host works, including Railway).

## Preview

Run `npm start`, then open http://127.0.0.1:4187. The browser suite manages that same port; stop a manual preview before running it.

## Page order

Hero → before/after (tools connected through Koi) → What's in the way → What can we build → Connected to the work → How we work → Concepts (portfolio) → koi pond → closing statement and enquiry form.

Source: the "Website content" deck (Menurut Kamil) and `changes.md`.

## Languages (EN / ID)

English is written directly in `index.html`, so the page reads fully without JavaScript. Indonesian lives in `i18n.js`:

- `data-i18n="key"` swaps an element's content; `data-i18n-attr="attr:key,attr2:key2"` swaps attributes (placeholders, aria-labels, alt, meta description).
- `en` in `i18n.js` holds only strings `site.js` writes at runtime (motion button, form status).
- English is the default. The EN/ID switch remembers the choice (localStorage) and writes `?lang=id` into the URL, so an Indonesian link can be shared.
- Tone: neutral Indonesian (no "Anda"/"kamu"), common tech terms kept in English. `npm test` fails on a missing or unused key, or on "Anda"/"kamu".

To add copy: put the English in the HTML with a new `data-i18n` key and add the same key to `id` in `i18n.js`.

## Enquiry form (Web3Forms)

The form posts straight from the browser to `https://api.web3forms.com/submit`; no server is involved, so it works on any static host. The access key is the hidden `access_key` input in `index.html` (Web3Forms keys are public by design). Submissions arrive at the email the key was created with.

- With JavaScript: JSON submit, inline "reply within 1 working day" confirmation, and on failure everything typed stays in place with an email fallback.
- Without JavaScript: the native POST goes to Web3Forms, which shows its own confirmation page.
- Spam: Web3Forms' hidden `botcheck` field.
- Required: name, email, budget range, message. The submission also carries `language` (en/id) so the reply can match.

## Before/after animation

At 900px and wider with motion allowed, the section pins and the eight tool chips fly from the scattered left panel into the ring around Koi as the visitor scrolls (`setSystemsMode` / `renderSystems` in `site.js`). Narrow screens and reduced motion get two static panels; the ring assembles once when it comes into view. Without JavaScript the connected state shows immediately.

## Motion and performance

"Pause motion" stops every CSS animation, the hero film, and the pond, and reduced-motion preferences start paused. Sections that are off screen pause their animations and the hero film (`data-offscreen`), which keeps the page light on low-end devices.

## Hero video

Set the `hero-video-url` meta element to a local path or HTTPS URL. Empty or invalid values keep the moving gradient.

## Checks

Run `npm ci`, `npm test`, `npm run eval`, and `npm run test:browser` (install Playwright Chromium first). Content tests cover links and assets, i18n coverage and tone, the form contract, removed promises, the eight tools, card-to-form interests, and the single "concept" label. The deterministic content eval requires 11/11 brief criteria. Browser checks cover full-screen hero, the scroll fly-in landing within 2px of each slot (including after a language switch), reduced motion, phone behaviour, form success, failure, and validation (Web3Forms is stubbed, nothing is sent), language persistence and sharing, no-JavaScript fallback, motion controls, video configuration, and axe at five widths in both languages.

Portfolio screens are concepts drawn in HTML; names and numbers are illustrative, not client work.
