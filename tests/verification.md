# Verification, 2026-09-13

Outcome: technology leads the homepage, creative services stay visible, and visitors understand the 30-minute discovery call. Calendly intentionally remains a placeholder with the existing email fallback.

Three verification passes:
1. Local: clean dependency install, JavaScript syntax, Git whitespace check, three Node tests, and 10/10 deterministic content acceptance criteria.
2. Browser: 16 Playwright tests passed. Full axe scans of every service tab at 360, 390, 768, 1024, and 1440px passed. No horizontal overflow or runtime errors. Dialog, menu, keyboard controls, configured/invalid calendar URLs, reduced motion, lazy assets, and no-JavaScript fallback passed.
3. Independent review: two isolated hero variants received a blind comparison; the integrated page received a separate cold review and a fresh final release review. Final verdict: PASS. The first review caught invalid article/tabpanel semantics; the corrected div containers pass the expanded full axe suite.

Review evidence is retained locally under `/private/tmp/koi-redesign-01a098c4/critique/`: `variant-verdict.md`, `release-verdict.md`, desktop/mobile page screenshots, and booking screenshots. Full browser output: `/private/tmp/koi-redesign-01a098c4/browser-checks.log`. These temporary artifacts are not committed.

## Interaction evidence

- Every visible booking CTA opens the dialog; Close and Escape dismiss it and restore focus.
- Mobile menu opens, closes, follows section anchors, and handles desktop resize. Booking from it restores focus to Menu.
- All service tabs select their panels; ArrowLeft/ArrowRight/Home/End update selection and keyboard focus.
- Navigation, secondary links, and Back to top reach existing sections.
- Email and phone links use the existing contact details. No email or phone call was sent during testing.
- A valid Calendly configuration reveals the event link in both locations. Invalid configuration preserves the email option. Test event URLs were not visited.
- Without JavaScript, all service examples remain visible and booking links reach the contact section.

## Antislop delivery gate

- R-01 PASS: peach separates the illustrative service preview; no gradients or glows.
- R-02 PASS: no em dash in page copy.
- R-03 PASS: all five tested viewport widths fit; mobile controls meet the 44px target.
- R-04 PASS: icons indicate call duration, checklist completion, or an attention state.
- R-05 PASS: showcase, secondary use cases, creative practice, five-step process, and meeting section follow supplied content.
- R-06 PASS: DM Sans provides compact headings and readable body copy; typography rationale is in README.
- R-07 PASS: no decorative grids or background patterns.
- R-08 PASS: arrows appear on secondary navigation links, not every button.
- R-09 PASS: status labels belong to disclosed sample data; no invented trust badges.
- R-10 PASS: no glass effects.
- R-11 PASS: distinct button, panel, and surface radii preserve hierarchy.
- R-12 PASS: the mobile navigation overlay is the only shadowed component.
- R-13 PASS: no glows.
- R-14 PASS: flat use-case rows and creative-service rows complement the main example panel.
- R-15 PASS: booking, service, and email actions say what they do.
- R-16 PASS: concrete service copy replaces generic product claims.
- R-17 PASS: revenue and receivable figures come from slide 13 and are explicitly illustrative.
- R-18 PASS: no testimonials or customer claims.
- R-19 PASS: hover and selection feedback only; reduced motion tested.
- R-20 PASS: Koi logo/palette and Indonesian business examples carry the identity.
- R-21 PASS: the fixed light presentation follows the requested reference and brand direction.
- R-22 PASS: examples are native HTML figures tied to deck use cases; no stock illustrations.
- R-23 PASS: original logo retained; examples and booking placeholder clearly disclosed.
- R-24 PASS: all navigation fragments have unique destinations.
- R-25 PASS: full axe scans pass across all tab/viewport combinations and the dialog.
- R-26 PASS: interactions verified above; unavailable booking is visibly labeled with a source TODO.
- R-27 PASS: illustrative figures do not fetch live data; missing/invalid booking configuration has a working fallback.
- R-28 PASS: no speculative FAQ section.
- R-29 PASS: cream, charcoal, orange, and its peach tint form the brand palette.
- R-30 PASS: Calendly's homepage was explicitly requested as the design reference.
- R-31 PASS: major design decisions are documented in README.
- R-32 PASS: menu, tabs, dialog, and focus restoration tested by keyboard.
- R-33 PASS: UI is authored directly in HTML/CSS/JavaScript; no source-rewriting UI script ships.
- R-34 PASS: one fixed theme, tested at all five widths.
- R-35 PASS: local preview ran and the browser suite clicked the actual controls.
- R-36 PASS: no fabricated performance, customer, or compliance claims.
- R-37 PASS: explicit user design direction; ENERGY 2 / RHYTHM 2 / MOTION 1.
- R-38 PASS: sample data and unavailable booking remain explicit; no imaginary demo links.

Liveliness and craftsmanship: PASS. The centered hero establishes focus; section spacing and composition follow the content; orange is restrained; every action has a destination or an honest fallback.

Limitations: no real Calendly account is connected yet, and service previews are illustrative concepts. Google Fonts requires a network connection, with Arial/system sans as fallback. CI is configured separately from the local run; its remote result is reported in the PR.
