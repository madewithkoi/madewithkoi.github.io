# Koi Creative homepage

Static HTML, CSS, and JavaScript. No production dependencies or build step. The homepage leads with business technology, preserves creative services, and uses a 30-minute discovery call as its main action.

## Preview

```sh
npm start
```

Open http://127.0.0.1:4187. This serves this worktree only. If a preview is already running, stop it before running the browser suite (the suite manages its own server on the same port).

## Booking

Set `content` on the `calendly-event-url` meta element in `index.html` to Koi's real HTTPS Calendly event URL. The current empty value deliberately shows **Online booking is coming soon**, with the existing email as a working fallback. A valid URL enables the Calendly links in both the contact section and booking dialog. Invalid URLs keep the fallback. No booking is simulated and no form data is collected.

## Checks

```sh
npm ci
npm test
npm run eval
npm run test:browser
```

The local Node tests check document structure, assets, destinations, and truthful booking behavior. The deterministic content eval checks the agreed deck coverage and disclosure rubric, with a 10/10 acceptance threshold. It is not a substitute for visual review. Playwright checks all three service examples, keyboard behavior, mobile navigation, dialog focus, no-JavaScript fallback, reduced motion, assets, console errors, and WCAG AA checks at five widths. Install Playwright Chromium if it is not already available.

## Content and design

- Source: supplied `reference/KOI Deck 1st draft.pptx`, 13 slides, plus existing creative-services and contact copy.
- All dashboards are illustrative concepts, not live demos, completed projects, client identities, or results. The intelligence figures come from slide 13 and are labeled as examples.
- The user selected Calendly's homepage structure, Koi's existing palette, English copy for Indonesian businesses, and technology as the lead offer.
- DM Sans replaces Figtree for compact, readable headings and body copy. The original Koi logo is retained.
- The three tabs illustrate the priority offers. Secondary use cases, a dedicated creative-services section, and the deck's five-step process keep the page condensed.
- The cream surface, charcoal controls, peach showcase, and restrained orange accents translate the requested reference into Koi's brand. Dark charcoal marks the secondary creative practice. Fixed light presentation follows that reference and brand direction.
- Rounded surfaces group the hero, service examples, and meeting details. Borders organize actual sample data. Icons indicate checklist status or call duration; arrows appear only on secondary navigation links. The only shadow identifies the mobile menu overlay.
- ENERGY 2 / RHYTHM 2 / MOTION 1: varied section structures and hover/selection feedback, with no ambient animation. Content remains visible without JavaScript.

Only source files and text verification files are committed. Reference decks and review screenshots remain outside the commit. No production deployment is part of this branch; merge through review.
