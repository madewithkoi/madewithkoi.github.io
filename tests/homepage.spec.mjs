import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('service examples work with pointer and keyboard', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await expect(page.getByRole('tabpanel')).toContainText('Illustrative conversation');
  }
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(tabs.nth(2)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tabs.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.nth(2)).toBeFocused();
});

test('booking placeholder explains the call and restores focus', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const booking = page.locator('[data-booking]:visible').first();
  await booking.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('30 minutes');
  await expect(dialog).toContainText('Online booking is coming soon');
  await expect(dialog.getByRole('link', { name: 'Email to arrange a call' })).toHaveAttribute('href', /^mailto:madewithkoicreative@gmail.com\?/);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(booking).toBeFocused();
  for (const link of await page.locator('[data-booking]:visible').all()) {
    await link.click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close booking details' }).click();
    await expect(dialog).not.toBeVisible();
  }
});

test('mobile navigation opens, closes, follows links, and handles resize', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const toggle = page.getByRole('button', { name: 'Menu', exact: true });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Creative studio' }).click();
  await expect(page).toHaveURL(/#creative$/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
});

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`layout and accessibility at ${width}px`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => { await document.fonts.ready; document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; }); });
    await page.getByRole('button', { name: 'Pause motion' }).click();
    for (const tab of await page.getByRole('tab').all()) {
      await tab.click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const a11y = await new AxeBuilder({ page }).analyze();
      expect(a11y.violations).toEqual([]);
    }
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('the site remains readable and contactable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4187/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#demo-panel')).toBeVisible();
  await expect(page.locator('.chat-messages')).toContainText('8 days');
  await expect(page.locator('.offering-card')).toHaveCount(3);
  await page.locator('[data-booking]:visible').first().click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact').getByRole('link', { name: 'Email to arrange a call' })).toBeVisible();
  await context.close();
});

test('reduced motion is respected and booking dialog passes accessibility', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.locator('[data-booking]:visible').first().click();
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('booking from the mobile menu returns focus to the menu toggle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const toggle = page.getByRole('button', { name: 'Menu', exact: true });
  await toggle.click();
  await page.locator('.mobile-booking').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
});

for (const [value, valid] of [
  ['https://calendly.com/koi-example/discovery', true],
  ['https://calendly.com.evil.example/discovery', false],
  ['javascript:alert(1)', false],
  ['https://calendly.com/', false]
]) {
  test(`Calendly configuration ${valid ? 'enables an event' : 'keeps the fallback'}: ${value}`, async ({ page }) => {
    await page.route('http://127.0.0.1:4187/', async route => {
      const response = await route.fetch();
      const html = (await response.text()).replace('name="calendly-event-url" content=""', `name="calendly-event-url" content="${value}"`);
      await route.fulfill({ response, body: html });
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const link = page.locator('#contact [data-calendly-link]');
    if (valid) {
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', value);
      await expect(page.locator('#contact [data-booking-placeholder]')).toBeHidden();
      await page.locator('[data-booking]:visible').first().click();
      await expect(page.getByRole('dialog').getByRole('link', { name: 'Choose a time on Calendly' })).toHaveAttribute('href', value);
    } else {
      await expect(link).toBeHidden();
      await expect(page.locator('#contact [data-booking-placeholder]')).toBeVisible();
    }
  });
}

test('offering links select the matching conversation and console', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  for (const [key, title, source] of [['hr', 'People & HR', 'Employee handbook'], ['knowledge', 'Knowledge Management', 'Customer onboarding SOP'], ['founder', 'Owner/Founder Intelligence', 'Invoice summary']]) {
    await page.locator(`.offering-card[data-scenario="${key}"]`).click();
    await expect(page).toHaveURL(/#assistant$/);
    await expect(page.locator('#console-title')).toHaveText(title);
    await expect(page.locator('#source-rows')).toContainText(source);
    await expect(page.locator('.chat-messages .message')).toHaveCount(3);
  }
  await page.getByRole('button', { name: 'Activity', exact: true }).click();
  await expect(page.locator('#console-activity')).toBeVisible();
  await expect(page.locator('#console-sources')).toBeHidden();
  await page.getByRole('button', { name: 'Knowledge sources', exact: true }).click();
  await expect(page.locator('#console-sources')).toBeVisible();
  await page.getByRole('button', { name: 'Replay this answer' }).click();
  await expect(page.locator('.chat-messages')).toContainText('What needs my attention');
});

test('motion pause stops ambient animation and empty video makes no request', async ({ page }) => {
  const mediaRequests = [];
  page.on('request', request => { if (request.resourceType() === 'media') mediaRequests.push(request.url()); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hero-video')).not.toHaveAttribute('src');
  await expect(page.locator('#video-status')).toBeVisible();
  await expect(page.locator('.hero-current')).toHaveCSS('animation-play-state', 'running');
  await page.getByRole('button', { name: 'Pause motion' }).click();
  await expect(page.locator('.hero-current')).toHaveCSS('animation-play-state', 'paused');
  await expect(page.locator('.motion-control')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Resume motion' }).click();
  await expect(page.locator('.hero-current')).toHaveCSS('animation-play-state', 'running');
  expect(mediaRequests).toEqual([]);
});

for (const value of ['media/missing-loop.mp4', 'javascript:alert(1)']) {
  test(`video configuration safely falls back: ${value}`, async ({ page }) => {
    await page.route('http://127.0.0.1:4187/', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: (await response.text()).replace('name="hero-video-url" content=""', `name="hero-video-url" content="${value}"`) });
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (value.startsWith('media')) {
      await expect(page.locator('#hero-video')).toHaveAttribute('src', /missing-loop.mp4$/);
      await expect(page.locator('#video-status')).toContainText(/unavailable|paused by your browser/);
    } else await expect(page.locator('#hero-video')).not.toHaveAttribute('src');
    await expect(page.locator('#video-status')).toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/video-ready/);
  });
}

test('configured video plays muted, loops, and follows pause and reduced motion', async ({ page }) => {
  // A tiny synthetic test fixture; never included in the website's assets.
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 32;
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    recorder.ondataavailable = event => chunks.push(event.data);
    const stopped = new Promise(resolve => recorder.onstop = resolve);
    recorder.start();
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ff4a22'; ctx.fillRect(0, 0, 32, 32);
    await new Promise(resolve => setTimeout(resolve, 250));
    recorder.stop(); await stopped; stream.getTracks().forEach(track => track.stop());
    return [...new Uint8Array(await new Blob(chunks).arrayBuffer())];
  });
  await page.route('**/test-loop.webm', route => route.fulfill({ contentType: 'video/webm', body: Buffer.from(bytes) }));
  await page.route('http://127.0.0.1:4187/', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('name="hero-video-url" content=""', 'name="hero-video-url" content="test-loop.webm"') });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveClass(/video-ready/);
  expect(await page.locator('video').evaluate(video => video.loop && video.muted && video.playsInline && !video.paused)).toBe(true);
  await page.getByRole('button', { name: 'Pause motion' }).click();
  expect(await page.locator('video').evaluate(video => video.paused)).toBe(true);
  await page.getByRole('button', { name: 'Resume motion' }).click();
  await expect.poll(() => page.locator('video').evaluate(video => video.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('video').evaluate(video => video.paused)).toBe(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  expect(await page.locator('video').evaluate(video => video.paused && !video.autoplay)).toBe(true);
});

test('unavailable remote fonts never block site interactions', async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('tab', { name: 'Knowledge Management' }).click();
  await expect(page.locator('#console-title')).toHaveText('Knowledge Management');
  await expect(page.locator('.motion-control')).toBeVisible();
});
