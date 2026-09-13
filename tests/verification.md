# Verification — immersive rework, 2026-09-13

Outcome: a cinematic replaceable video stage, eight distinct section images, three priority offers, and an interactive WhatsApp/admin-console concept. The full rework keeps creative services and the 30-minute discovery CTA.

## Three verification passes

1. Local: `node --check site.js`, `git diff --check`, all 3 Node content tests, and 10/10 deterministic content acceptance criteria passed.
2. Browser: 20 browser tests passed together; the actual-video test passed separately after correcting its asynchronous media-preference assertion. All 21 scenarios passed. Full axe scans at 360, 390, 768, 1024, and 1440 pixels cover all three selected offers. No horizontal overflow, missing decoded images, or page errors. Desktop/mobile screenshots were refreshed after fixes.
3. Independent visual review: two isolated hero variants, blind selection, then a separate cold review of the integrated result. Verdict PASS, conditional on mobile overflow and contact contrast corrections; both were corrected and verified by the browser suite. Review artifacts: `/private/tmp/koi-immersive-01a098c4/critique/variant-verdict.md`, `final-verdict.md`, `final-1440.png`, and `final-390.png`.

Browser evidence: `/private/tmp/koi-browser-results.log` and `/private/tmp/koi-video-results.log`. Review screenshots stay outside Git.

## Behavior checked

- All three offering links select matching WhatsApp messages, console title, access group, and knowledge sources. Tabs support pointer and Arrow/Home/End keyboard selection. Replay recreates the answer; console source/activity controls switch visible content.
- Booking CTAs, modal closing, focus restoration, mobile menu, and responsive resizing work. Valid Calendly configuration enables both event links; invalid configuration keeps the existing email fallback. Test event URLs were not visited.
- With JavaScript disabled, the HR example and all services remain readable; contact anchors and email links work.
- Empty video configuration makes no media request. Invalid URL schemes and failed video preserve the placeholder. A temporary synthetic WebM fixture verifies actual muted inline looping playback, pause/resume, runtime reduced-motion changes, and disabled autoplay on a reduced-motion page load. The fixture is never shipped.
- Global motion pause stops CSS animation and video. System reduced motion disables ambient motion. A regression test proves failed external fonts cannot block interactions.
- Eight distinct content images decode successfully. Three original generated photographs are stored in release asset hosting; five existing concept images are retained. No sample artwork supplied as inspiration is used.

## Limits

The assistant and admin console are illustrative browser demos, with no live messaging or business integrations. Video and Calendly are intentionally unconfigured for the owner to replace. Third-party font/image hosting still requires network access; font fallback remains functional if unavailable. Automated contrast checks cover the paused representative gradient state; moving backgrounds retain dark overlays for text readability. This is a review branch, not a production deployment.

Self-rating: 8.5/10. The rework delivers the requested visual density and interaction; final cinematic character depends on the owner's film.
