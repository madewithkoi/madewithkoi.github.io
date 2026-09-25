// Deterministic acceptance against the "Website content" deck (Menurut Kamil)
// and changes.md. Visual quality is judged separately from screenshots.
import { readFileSync } from 'node:fs';
import { id } from '../i18n.js';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const text = html.replace(/<script[\s\S]*?<\/script>|<svg class="sprite"[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ');
const has = (...terms) => terms.every(term => text.includes(term));
const order = (...terms) => terms.every((term, index) => index === 0 || text.indexOf(terms[index - 1]) < text.indexOf(term));
const criteria = [
  ['Hero carries the new jargon and deck subline', /WE TURN BUSINESS PROBLEMS\s*INTO DIGITAL SOLUTIONS/.test(text) && has('We find what’s slowing your business down', 'then design and build the system to fix it')],
  ['Before/after names all eight tools and the deck lines', has('WhatsApp', 'Excel', 'Google Drive', 'POS', 'Accounting', 'HR', 'CRM', 'Marketplace', 'They’re just not connected.', 'Your business is already running on systems.', 'We’re not there to replace it', 'but to fill the gap.')],
  ['What’s in the way keeps the deck copy, one line per problem', has('What usually gets in the way?', 'Too much manual work', 'shouldn’t require a human', 'Too many tools', 'doesn’t move where it needs to go', 'Too little visibility', 'asking people for reports', 'Too much dependency', 'lives inside people’s heads', 'Too slow to scale', 'worked with 5 people break at 50')],
  ['What can we build lists the six deck offers with their lines', has('What can we build?', 'Automation', 'Turn repetitive workflows into systems.', 'AI', 'knowledge and data usable', 'Business Intelligence', 'visibility into what matters', 'Integration', 'Connect the systems you already use.', 'Custom Software', 'Build the tools your business actually needs.', 'Digital Experience', 'boost your customer experience')],
  ['How we work is unchanged', /Discover.*Diagnose.*Design.*Build.*Evolve/.test(text.slice(text.indexOf('Start with the problem.'))) && has('Understand your people, systems, and what gets in the way.')],
  ['Portfolio holds the six chosen concepts', has('Kopi Nusa Group', 'Arunika Group', 'Sinar Logistik', 'Teman Roti', 'Serene Skin Clinic', 'Pocha Social', 'Concepts')],
  ['Pocha Social follows the brief: private match, buy a round, join the table', /Private match/.test(text) && /Soju sent/.test(text) && /Join Table/.test(text)],
  ['Closing statement matches the deck and leads to the form', has('Don’t know', 'what to build?', 'That’s exactly where we start.', 'Bring us a business problem, a messy process') && /api\.web3forms\.com\/submit/.test(html)],
  ['Sections follow the agreed order', order('WE TURN', 'Before & after', 'What usually gets in the way?', 'What can we build?', 'Connected to the work', 'Start with the problem.', 'What it could look like.', 'Follow the current.', 'That’s exactly where we start.')],
  ['Indonesian covers every translatable string', [...html.matchAll(/data-i18n="([^"]+)"/g)].every(m => m[1] in id)],
  ['No SaaS or WhatsApp-only promise remains', !/admin console|WhatsApp for the team|Meet the assistant|calendly/i.test(html)]
];
for (const [name, pass] of criteria) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
const score = criteria.filter(([, pass]) => pass).length;
console.log(`Content acceptance: ${score}/${criteria.length}; threshold: ${criteria.length}/${criteria.length}`);
process.exitCode = score === criteria.length ? 0 : 1;
