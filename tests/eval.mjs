import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const text = html.replace(/&amp;/g, '&').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const criteria = [
  ['Technology leads the page', text.indexOf('Business Technology Studio') < text.indexOf('Creative services')],
  ['Indonesian audience is explicit', /Indonesian businesses/.test(text)],
  ['Three priority offers are present', ['People & HR', 'Knowledge Management', 'Owner/Founder Intelligence'].every(term => text.includes(term))],
  ['Assistant is positioned as a build service', ['WhatsApp', 'admin console', 'design and build'].every(term => text.includes(term))],
  ['Creative services remain clear', ['Brand identity', 'Content', 'advertising', 'Websites'].every(term => text.includes(term))],
  ['The deck process is preserved', ['Discover', 'Diagnose', 'Design', 'Build', 'Evolve'].every(term => text.includes(term))],
  ['Build scope and integration limits are clear', /No messages are sent/.test(text) && /We map the available products/.test(text)],
  ['Discovery has an agenda and duration', /30 minutes/.test(text) && /problem statement/i.test(text) && /discovery/i.test(text)],
  ['Eight distinct section images', new Set([...html.matchAll(/<img src="([^"]+)"/g)].map(m => m[1]).filter(src => !src.includes('logo'))).size >= 8],
  ['Video and booking are replaceable placeholders', /name="hero-video-url" content=""/.test(html) && /Online booking is coming soon/.test(text)]
];
for (const [name, pass] of criteria) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
const score = criteria.filter(([, pass]) => pass).length;
console.log(`Content acceptance: ${score}/${criteria.length}; threshold: ${criteria.length}/${criteria.length}`);
process.exitCode = score === criteria.length ? 0 : 1;
