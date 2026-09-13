import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const text = html.replace(/&amp;/g, '&').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const criteria = [
  ['Technology leads the page', /Business Technology Studio/.test(text) && text.indexOf('Business Technology Studio') < text.indexOf('Your creative agency')],
  ['Indonesian audience is explicit', /Indonesian businesses/.test(text)],
  ['Three priority offers are present', ['Operations', 'Sales & CRM', 'Business intelligence'].every(term => text.includes(term))],
  ['The remaining deck use cases are covered', ['Finance', 'People & HR', 'Knowledge', 'Multi-outlet'].every(term => text.includes(term))],
  ['Creative services remain clear', ['Brand', 'Content', 'Advertising', 'Websites'].every(term => text.includes(term))],
  ['The deck process is preserved', ['Discover', 'Diagnose', 'Design', 'Build', 'Evolve'].every(term => text.includes(term))],
  ['Examples are disclosed in all three panels', (text.match(/Illustrative example/g) || []).length >= 3],
  ['Discovery call has an explicit agenda and duration', /30 minutes/.test(text) && /problem statement/i.test(text) && /discovery/i.test(text)],
  ['No invented social proof', !/trusted by|clients served|customer testimonial|projects delivered|SOC 2|guaranteed|% faster/i.test(text)],
  ['Booking is honest about its placeholder state', /Online booking is coming soon/.test(text) && /Email to arrange a call/.test(text)]
];
for (const [name, pass] of criteria) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
const score = criteria.filter(([, pass]) => pass).length;
console.log(`Content acceptance: ${score}/${criteria.length}; threshold: ${criteria.length}/${criteria.length}`);
process.exitCode = score === criteria.length ? 0 : 1;
