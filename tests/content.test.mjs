import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('every fragment has one destination and every local asset exists', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'duplicate element IDs');
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Missing anchor: ${target}`);
  }
  for (const [, target] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(https?:|mailto:|tel:)/.test(target)) continue;
    assert.ok(existsSync(resolve(target)), `Missing asset: ${target}`);
  }
});

test('the page has one main heading and English search metadata', () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<meta name="description" content="[^"]{40,180}"/);
  assert.match(html, /<title>Koi Creative.*Business Technology Studio<\/title>/);
});

test('the booking placeholder does not point to an invented account or claim submission', () => {
  assert.doesNotMatch(html, /https:\/\/calendly\.com\/[^"\s]+/);
  assert.doesNotMatch(html, /message sent|booking confirmed|meeting confirmed/i);
  assert.match(html, /Online booking is coming soon/);
  assert.match(html, /mailto:madewithkoicreative@gmail\.com/);
});
