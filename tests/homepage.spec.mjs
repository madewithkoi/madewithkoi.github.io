import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WEB3FORMS = 'https://api.web3forms.com/submit';
const withHtml = (page, edit) => page.route('http://127.0.0.1:4187/', async route => {
  const response = await route.fetch();
  await route.fulfill({ response, body: edit(await response.text()) });
});
const centre = locator => locator.evaluate(node => { const r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });

test('hero fills exactly one screen on desktop and phone', async ({ page }) => {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(await page.locator('.hero').evaluate(hero => hero.getBoundingClientRect().height)).toBe(height);
    await expect(page.locator('.hero-cta')).toHaveAttribute('href', '#contact');
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
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Work', exact: true }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
});

for (const lang of ['en', 'id']) {
  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`layout and accessibility at ${width}px (${lang})`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(lang === 'id' ? '/?lang=id' : '/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(async () => { await document.fonts.ready; document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; }); });
      await page.locator('.motion-control').click();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const a11y = await new AxeBuilder({ page }).analyze();
      expect(a11y.violations).toEqual([]);
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test('desktop scroll flies every tool from the mess into its slot around Koi', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const systems = page.locator('.systems');
  await expect(systems).toHaveClass(/is-flying/);
  const chips = page.locator('.tool .tool-chip');
  const slots = page.locator('.hub-node .tool-chip');
  await expect(chips).toHaveCount(8);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const trackTop = await page.locator('.systems-track').evaluate(track => track.getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo(0, y), trackTop);
  await expect(systems).not.toHaveClass(/is-connected/);
  const before = await centre(page.locator('.panel-before'));
  for (let i = 0; i < 8; i++) expect((await centre(chips.nth(i))).x).toBeLessThan(before.x + 320);
  const end = await page.locator('.systems-track').evaluate(track => track.getBoundingClientRect().top + scrollY + track.offsetHeight - innerHeight);
  await page.evaluate(y => scrollTo(0, y), end);
  await expect(systems).toHaveClass(/is-connected/);
  for (let i = 0; i < 8; i++) {
    await expect.poll(async () => {
      const [a, b] = [await centre(chips.nth(i)), await centre(slots.nth(i))];
      return Math.hypot(a.x - b.x, a.y - b.y);
    }).toBeLessThan(2);
  }
  expect(await systems.evaluate(node => getComputedStyle(node).getPropertyValue('--draw').trim())).toBe('1');
  // Pausing mid-flight shows the finished ring without leaving the pinned section.
  await page.evaluate(y => scrollTo(0, y), trackTop + 200);
  await page.evaluate(() => document.querySelector('.motion-control').click());
  for (let i = 0; i < 8; i++) {
    const [a, b] = [await centre(chips.nth(i)), await centre(slots.nth(i))];
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(2);
  }
  await page.evaluate(() => document.querySelector('.motion-control').click());
  await page.evaluate(y => scrollTo(0, y), end);
  // Switching language changes label widths while pinned; chips must re-land (clicking would scroll away).
  await page.evaluate(() => document.querySelector('[data-lang="id"]').click());
  await expect(slots.nth(4)).toContainText('Akuntansi');
  const [a, b] = [await centre(chips.nth(4)), await centre(slots.nth(4))];
  expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(2);
});

test('reduced motion shows both panels still, with the ring already connected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await expect(page.locator('.systems')).not.toHaveClass(/is-flying/);
  await page.locator('.panel-after').scrollIntoViewIfNeeded();
  await expect(page.locator('.systems')).toHaveClass(/is-connected/);
  await expect(page.locator('.hub-node').first()).toBeVisible();
  expect(await page.locator('.hub-node').first().evaluate(node => getComputedStyle(node).opacity)).toBe('1');
  expect(await page.locator('.tool .tool-chip').first().evaluate(node => node.style.transform)).toBe('');
});

test('on phones the ring assembles once when it scrolls into view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const systems = page.locator('.systems');
  await expect(systems).not.toHaveClass(/is-flying/);
  await expect(systems).not.toHaveClass(/is-connected/);
  await page.locator('.hub-map').scrollIntoViewIfNeeded();
  await expect(systems).toHaveClass(/is-connected/);
  await expect.poll(() => page.locator('.hub-node').last().evaluate(node => getComputedStyle(node).opacity)).toBe('1');
});

test('a "What can we build" card jumps to the form with its interest chosen', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  for (const interest of ['Business Intelligence', 'Digital Experience']) {
    await page.locator(`.build-card[data-interest="${interest}"]`).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#f-interest')).toHaveValue(interest);
  }
});

async function fillForm(page) {
  await page.getByLabel('Name').fill('Rina Putri');
  await page.getByLabel('Company (optional)').fill('Arunika Group');
  await page.getByLabel('Email').fill('rina@example.com');
  await page.getByLabel('Budget range').selectOption('Rp50–100 juta');
  await page.getByLabel('What’s slowing your business down?').fill('Leave requests live in three spreadsheets.');
}

test('the form sends to Web3Forms and confirms a reply within 1 working day', async ({ page }) => {
  let payload;
  await page.route(WEB3FORMS, async route => {
    payload = route.request().postDataJSON();
    await route.fulfill({ json: { success: true, message: 'Email sent successfully!' } });
  });
  await page.goto('/?lang=id', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await fillForm(page);
  await page.getByRole('button', { name: 'Start a conversation' }).click();
  const success = page.locator('.form-success');
  await expect(success).toBeVisible();
  await expect(success).toBeFocused();
  await expect(success).toContainText('within 1 working day');
  expect(payload).toMatchObject({ access_key: expect.stringMatching(/^[0-9a-f-]{36}$/), name: 'Rina Putri', company: 'Arunika Group', email: 'rina@example.com', budget: 'Rp50–100 juta', interest: 'Not sure yet', language: 'en', message: 'Leave requests live in three spreadsheets.' });
  expect(payload).not.toHaveProperty('botcheck');
  await page.getByRole('button', { name: 'Send another message' }).click();
  await expect(page.getByLabel('Name')).toBeFocused();
  await expect(page.getByLabel('Name')).toHaveValue('');
});

for (const [label, reply] of [['HTTP error', { status: 500, json: { success: false } }], ['rejected submission', { status: 200, json: { success: false, message: 'Invalid access key' } }], ['network failure', null]]) {
  test(`a ${label} keeps everything typed and offers email`, async ({ page }) => {
    await page.route(WEB3FORMS, route => reply ? route.fulfill(reply) : route.abort());
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await fillForm(page);
    await page.getByRole('button', { name: 'Start a conversation' }).click();
    await expect(page.locator('.form-status')).toContainText('madewithkoicreative@gmail.com');
    await expect(page.locator('.form-success')).toBeHidden();
    await expect(page.getByLabel('Name')).toHaveValue('Rina Putri');
    await expect(page.getByLabel('Budget range')).toHaveValue('Rp50–100 juta');
    await expect(page.getByRole('button', { name: 'Start a conversation' })).toBeEnabled();
  });
}

test('the form does not send until required fields, including budget, are filled', async ({ page }) => {
  let requests = 0;
  await page.route(WEB3FORMS, route => { requests++; return route.fulfill({ json: { success: true } }); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Name').fill('Rina Putri');
  await page.getByLabel('Email').fill('rina@example.com');
  await page.getByLabel('What’s slowing your business down?').fill('Reports take a week.');
  await page.getByRole('button', { name: 'Start a conversation' }).click();
  expect(await page.getByLabel('Budget range').evaluate(select => select.validity.valueMissing)).toBe(true);
  expect(requests).toBe(0);
});

test('language switch translates the page, persists, and is shareable', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('We turn business problems');
  await page.getByRole('button', { name: 'ID', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  await expect(page.locator('h1')).toContainText('Kami mengubah masalah bisnis');
  await expect(page).toHaveURL(/\?lang=id/);
  await expect(page.locator('.motion-control')).toContainText('Jeda animasi');
  await expect(page.getByRole('button', { name: 'ID', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#f-message')).toHaveAttribute('placeholder', /Ceritakan/);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('Kami mengubah masalah bisnis');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page).not.toHaveURL(/lang=/);
  await expect(page.locator('h1')).toContainText('We turn business problems');
  await expect(page.locator('#f-message')).toHaveAttribute('placeholder', /Tell us/);
});

test('English is the default and a shared ?lang=id link opens in Indonesian', async ({ browser }) => {
  const fresh = await browser.newContext({ locale: 'id-ID' });
  const page = await fresh.newPage();
  await page.goto('http://127.0.0.1:4187/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('http://127.0.0.1:4187/?lang=id', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#problems-title')).toHaveText('Apa yang biasanya menghambat?');
  await fresh.close();
});

test('the site remains readable and contactable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4187/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hub-node')).toHaveCount(8);
  await expect(page.locator('.hub-node').first()).toBeVisible();
  await expect(page.locator('.pain-card')).toHaveCount(5);
  await expect(page.locator('.work-card').first()).toBeVisible();
  await expect(page.locator('.lang-switch')).toBeHidden();
  await expect(page.locator('#enquiry-form')).toHaveAttribute('action', WEB3FORMS);
  await expect(page.locator('#enquiry-form')).toHaveAttribute('method', 'POST');
  await page.locator('.hero-cta').click();
  await expect(page).toHaveURL(/#contact$/);
  await context.close();
});

test('motion pause stops ambient animation and the hero film', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.hero-current')).toHaveCSS('animation-play-state', 'running');
  await page.getByRole('button', { name: 'Pause motion' }).click();
  await expect(page.locator('.hero-current')).toHaveCSS('animation-play-state', 'paused');
  await expect(page.locator('.ribbon-track')).toHaveCSS('animation-play-state', 'paused');
  // Illustrations drop to their finished frame instead of freezing mid-fade.
  await expect(page.locator('.art-note')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.kb-answer li').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.motion-control')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('video').evaluate(video => video.paused)).toBe(true);
  await page.getByRole('button', { name: 'Resume motion' }).click();
  await expect(page.locator('.hero-current')).toHaveCSS('animation-play-state', 'running');
});

test('an empty video setting makes no media request', async ({ page }) => {
  const mediaRequests = [];
  page.on('request', request => { if (request.resourceType() === 'media') mediaRequests.push(request.url()); });
  await withHtml(page, html => html.replace('name="hero-video-url" content="media/hero-loop.mp4"', 'name="hero-video-url" content=""'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#hero-video')).not.toHaveAttribute('src');
  await page.waitForTimeout(300);
  expect(mediaRequests).toEqual([]);
});

test('the restored lower-page koi canvas pauses with global motion controls', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const koi = page.locator('#koiCanvas');
  await koi.scrollIntoViewIfNeeded();
  await expect(koi).toBeVisible();
  await expect(koi).toHaveAttribute('aria-hidden', 'true');
  const movingPixels = () => page.locator('#koiCanvas').evaluate(canvas => {
    const ctx = canvas.getContext('2d');
    return [...ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data];
  });
  await page.getByRole('button', { name: 'Pause motion' }).click();
  await page.waitForTimeout(80);
  const pausedPixels = await movingPixels();
  await page.waitForTimeout(160);
  expect(await movingPixels()).toEqual(pausedPixels);
  await page.getByRole('button', { name: 'Resume motion' }).click();
  await expect.poll(movingPixels).not.toEqual(pausedPixels);
});

for (const value of ['media/missing-loop.mp4', 'javascript:alert(1)']) {
  test(`video configuration safely falls back: ${value}`, async ({ page }) => {
    await withHtml(page, html => html.replace('name="hero-video-url" content="media/hero-loop.mp4"', `name="hero-video-url" content="${value}"`));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (value.startsWith('media')) await expect(page.locator('#hero-video')).toHaveAttribute('src', /missing-loop.mp4$/);
    else await expect(page.locator('#hero-video')).not.toHaveAttribute('src');
    await page.waitForTimeout(300);
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
  await withHtml(page, html => html.replace('name="hero-video-url" content="media/hero-loop.mp4"', 'name="hero-video-url" content="test-loop.webm"'));
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
  await page.getByRole('button', { name: 'ID', exact: true }).click();
  await expect(page.locator('h1')).toContainText('Kami mengubah masalah bisnis');
  await expect(page.locator('.motion-control')).toBeVisible();
});
