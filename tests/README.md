# Homepage verification notes

- Run axe without tag filtering. A WCAG-only filter missed `aria-allowed-role` when a panel used `article role="tabpanel"`; a neutral `div` is the correct host. Scan every active tab so hidden content is covered too.
- Select visible booking controls when testing desktop. The mobile navigation includes a separate link that is deliberately hidden at desktop widths.
- Scroll lazy-loaded assets into view before checking their decoded dimensions. An offscreen image with no dimensions is not necessarily broken.
- Decode HTML entities before evaluating rendered copy. `&amp;` represents `&`.
- Test configured booking URLs by substituting the meta value in a browser fixture, without changing the shipped placeholder or visiting an invented account.
- The original contact form showed success without sending a request. Regression checks prohibit simulated submission claims, and the replacement uses the existing email address.

The local gate runs in the supplied `.githooks/pre-commit` hook. CI runs the gate, content eval, and browser suite on pull requests. A headless browser provides automation evidence; visual review separately checks the reference and responsive screenshots.
