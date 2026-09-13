import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('service examples work with pointer and keyboard', async ({ page }) => {
  await page.goto('/');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await tabs.nth(i).click();
    await expect(tabs.nth(i)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await expect(page.getByRole('tabpanel')).toContainText('Illustrative example');
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
  await page.goto('/');
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
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menu', exact: true });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Creative services' }).click();
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
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
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
  await page.goto('http://127.0.0.1:4187/');
  await expect(page.locator('#operations')).toBeVisible();
  await expect(page.locator('#sales')).toBeVisible();
  await expect(page.locator('#intelligence')).toBeVisible();
  await page.locator('[data-booking]:visible').first().click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#contact').getByRole('link', { name: 'Email to arrange a call' })).toBeVisible();
  await context.close();
});

test('reduced motion is respected and booking dialog passes accessibility', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.locator('[data-booking]:visible').first().click();
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
});

test('booking from the mobile menu returns focus to the menu toggle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
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
    await page.goto('/');
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

test('navigation and secondary anchors reach their actual sections', async ({ page }) => {
  await page.goto('/');
  for (const [name, fragment] of [['Business technology', 'services'], ['Creative services', 'creative'], ['Our approach', 'approach']]) {
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${fragment}$`));
  }
  await page.getByRole('link', { name: 'Back to top' }).click();
  await expect(page).toHaveURL(/#home$/);
  await page.getByRole('link', { name: 'See what we can build' }).click();
  await expect(page).toHaveURL(/#services$/);
  await page.getByRole('link', { name: 'How we work' }).click();
  await expect(page).toHaveURL(/#approach$/);
});
