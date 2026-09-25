import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { en, id } from '../i18n.js';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../site.js', import.meta.url), 'utf8');
const section = name => html.match(new RegExp(`<section[^>]*id="${name}"[\\s\\S]*?</section>`))[0];

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
  assert.match(html, /<title>Koi \| Business Technology Studio<\/title>/);
});

test('every translatable string has Indonesian copy and no key is orphaned', () => {
  const htmlKeys = new Set([
    ...[...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]),
    ...[...html.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap(m => m[1].split(',').map(pair => pair.split(':')[1]))
  ]);
  const runtimeKeys = new Set([...js.matchAll(/\bt\((?:paused \? )?'([^']+)'(?: : '([^']+)')?\)/g)].flatMap(m => m.slice(1).filter(Boolean)));
  for (const key of htmlKeys) assert.ok(key in id, `Missing Indonesian copy: ${key}`);
  for (const key of runtimeKeys) {
    assert.ok(key in en, `Missing English runtime string: ${key}`);
    assert.ok(key in id, `Missing Indonesian runtime string: ${key}`);
  }
  for (const key of Object.keys(id)) assert.ok(htmlKeys.has(key) || key in en, `Unused Indonesian key: ${key}`);
  for (const key of Object.keys(en)) assert.ok(runtimeKeys.has(key), `Unused runtime key: ${key}`);
});

test('Indonesian copy stays neutral: no Anda or kamu', () => {
  for (const [key, value] of Object.entries(id)) assert.doesNotMatch(value, /\b(anda|kamu)\b/i, key);
});

test('the enquiry form posts to Web3Forms with a bot trap and the agreed fields', () => {
  const form = html.match(/<form[\s\S]*?<\/form>/)[0];
  assert.match(form, /action="https:\/\/api\.web3forms\.com\/submit" method="POST"/);
  assert.match(form, /name="access_key" value="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/);
  assert.match(form, /name="botcheck"/);
  for (const name of ['name', 'email', 'budget', 'message']) assert.match(form, new RegExp(`name="${name}"[^>]*required`), `${name} required`);
  for (const name of ['company', 'whatsapp', 'interest', 'pain']) assert.doesNotMatch(form, new RegExp(`name="${name}"[^>]*required`), `${name} optional`);
  const budget = form.match(/<select id="f-budget"[\s\S]*?<\/select>/)[0];
  assert.deepEqual([...budget.matchAll(/<option value="([^"]+)"/g)].map(m => m[1]), ['< Rp50 juta', 'Rp50–100 juta', 'Rp100–300 juta', '> Rp300 juta']);
});

test('removed promises stay removed: no WhatsApp demo, admin console, creative grid, or booking', () => {
  assert.doesNotMatch(html, /admin console|role="tab"|calendly|<dialog|Creative services|data-scenario/i);
});

test('before/after shows the same eight tools on both sides, three as real brand logos', () => {
  const tools = ['WhatsApp', 'Excel', 'Google Drive', 'POS', 'Accounting', 'HR', 'CRM', 'Marketplace'];
  const names = list => [...section('systems').match(new RegExp(`<ul class="${list}"[\\s\\S]*?</ul>`))[0].matchAll(/<span class="tool-chip">(?:(?!<\/li>)[\s\S])*?class="tool-name"[^>]*>([^<]+)</g)].map(m => m[1]);
  assert.deepEqual(names('tool-list'), tools);
  assert.deepEqual(names('hub-list'), tools);
  for (const brand of ['i-whatsapp', 'i-excel', 'i-drive']) assert.match(html, new RegExp(`<symbol id="${brand}"[^>]*>(?:(?!</symbol>).)*fill="#`));
});

test('every "What can we build" card preselects a real interest option', () => {
  const options = [...html.match(/<select id="f-interest"[\s\S]*?<\/select>/)[0].matchAll(/<option(?: value="([^"]+)")?[^>]*>([^<]+)</g)].map(m => m[1] || m[2]);
  const interests = [...section('build').matchAll(/data-interest="([^"]+)"/g)].map(m => m[1]);
  assert.equal(interests.length, 6);
  for (const interest of interests) assert.ok(options.includes(interest), interest);
});

test('the portfolio shows six concepts and says "concept" exactly once', () => {
  const work = section('work');
  assert.equal((work.match(/class="work-card/g) || []).length, 6);
  assert.equal((work.replace(/<[^>]*>/g, ' ').match(/concept/gi) || []).length, 1);
  assert.equal((id['work.eyebrow'] + id['work.title'] + id['work.lead']).match(/konsep/gi).length, 1);
});
