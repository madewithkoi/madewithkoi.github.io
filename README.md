# Koi Creative homepage

Static HTML, CSS, and JavaScript. No production dependencies or build step. Technology leads, with a WhatsApp assistant, admin console, and eight section images. Creative services remain visible.

## Preview

Run `npm start`, then open http://127.0.0.1:4187. The browser suite manages that same port; stop a manual preview before running it. The current review preview uses port 4188.

## Replace the hero video

Set the `hero-video-url` meta element in `index.html` to your video path (for example `media/hero-loop.mp4`) or an HTTPS video URL. Use an optimized, silent looping film. Until configured, a moving Koi gradient fills the video area. No sample artwork or generated video is used.

Playback is muted, inline, and looping. Pause motion stops the video and ambient animations. Reduced-motion preferences disable autoplay. Failed or blocked playback preserves the gradient placeholder. Store production video in asset hosting or Git LFS rather than committing binaries.

## Booking

Set the `calendly-event-url` meta element to your real HTTPS Calendly event URL. Empty or invalid configuration keeps the visible booking placeholder and existing email fallback. Calls are 30 minutes for problem statement and discovery. No booking is simulated.

## Imagery and type

Sora headings and DM Sans body fonts use versioned Fontsource files with swap fallbacks. Three original illustrative photographs were generated with the built-in image tool; prompts are in `assets/section-image-prompts.json`. Optimized JPEGs are stored as GitHub release assets under `koi-section-art-20260913`, with local copies in ignored `assets/generated/`. Five existing Koi concept images complete the eight-image layout. No user sample artwork or Higgsfield output is included. Images and example interfaces are clearly illustrative, not client work or performance claims.

## Checks

Run `npm ci`, `npm test`, `npm run eval`, and `npm run test:browser`. Install Playwright Chromium before the first browser run. Content tests validate links, local assets, metadata, and honest booking. The deterministic content eval requires 10/10 brief criteria; visual judgment is reviewed separately. Browser checks cover the three scenarios, console views, keyboard navigation, mobile menu, booking focus, no-JavaScript fallback, motion controls, video configuration, and full axe accessibility at five widths.

## Content

Source: the supplied 13-slide Koi deck and the updated brief. Priority offers are People & HR, Knowledge Management, and Owner/Founder Intelligence. Existing-product integrations require discovery of API availability and permissions. This homepage contains an interactive concept, not a connected chatbot backend. No user data is sent.

Review and merge through the pull request. No production deployment is included.
