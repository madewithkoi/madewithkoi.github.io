import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const i18n = readFileSync(new URL('../i18n.js', import.meta.url), 'utf8');

test('contact details: one email, no phone, physical address in footer', () => {
  const emails = new Set((html + i18n).match(/[\w.-]+@[\w-]+\.[a-z]{2,}/gi));
  assert.deepEqual([...emails], ['hello@madewithkoi.com']);
  assert.doesNotMatch(html, /tel:|\+62 ?8/);
  assert.match(html.match(/<footer[\s\S]*<\/footer>/)[0], /<address>[\s\S]*Jalan HR Rasuna Said Kav\. C-5[\s\S]*12920<\/address>/);
});
