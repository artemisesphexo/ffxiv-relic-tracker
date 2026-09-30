#!/usr/bin/env node
/**
 * Regenerates the crawler-visible "Full material list" tables on every
 * tracker page from the SAME data arrays the interactive tracker uses
 * (<tracker>/src/data.js + main.js, and the PHANTOM_DATA array inlined in
 * phantom/index.html). It also regenerates, from that same data:
 *   - the "Frequently asked questions" block under each material list
 *   - the JSON-LD (BreadcrumbList + FAQPage) in each tracker page's <head>
 *   - sitemap.xml at the repo root (lastmod = the day you run this)
 *
 * Run this after editing item data so the static tables never drift from
 * what the interactive tracker actually shows:
 *
 *   node scripts/generate-static-content.js
 *
 * It does NOT need a build step at deploy time — the output is committed
 * as plain HTML, and GitHub Pages keeps serving these files as static assets.
 * Only re-run this script by hand when the underlying data changes.
 */
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function captureAlpineApp(sourceFiles) {
  let captured = null;
  const sandbox = {
    document: {
      addEventListener(event, cb) {
        if (event === 'alpine:init') cb();
      },
    },
    Alpine: {
      data(name, factory) {
        captured = factory();
        captured.$watch = () => {};
      },
    },
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {},
      clear() {},
    },
    console,
  };
  vm.createContext(sandbox);
  for (const file of sourceFiles) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  }
  if (!captured) throw new Error('Alpine.data() was never called for: ' + sourceFiles.join(', '));
  captured.init();
  return captured;
}

function extractInlineScript(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('No inline <script> found in ' + htmlPath);
  const tmp = path.join(require('os').tmpdir(), 'inline-' + Date.now() + '.js');
  fs.writeFileSync(tmp, m[1]);
  return tmp;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Some options use a generic internal `currency` bucket (used by the tracker's
// totals) that reads badly on its own, e.g. "5 Items" or "3 Alex P1". For
// those, show the option's descriptive label instead.
const GENERIC_CURRENCIES = new Set(['Items', 'Tokens', 'Tomestones', 'Gemstones']);
function optionName(o) {
  const label = String(o.label || '').trim();
  const currency = String(o.currency || '').trim();
  if (!currency) return label;
  if (label && (GENERIC_CURRENCIES.has(currency) || /^Alex P\d$/.test(currency))) return label;
  return currency;
}

function costText(item, joiner) {
  const opts = (item.options || []).filter((o) => o.cost > 0);
  if (opts.length === 0) {
    const labels = (item.options || []).map((o) => String(o.label || '').trim()).filter(Boolean);
    return { html: esc(labels.join(' or ') || 'Task'), text: labels.join(' or ') };
  }
  const parts = opts.map((o) => `${o.cost.toLocaleString('en-US')} ${optionName(o)}`);
  const prefix = item.yield > 1 ? `Each exchange yields ${item.yield}: ` : '';
  return {
    html: esc(prefix) + parts.map(esc).join(joiner),
    text: parts.join(' or ') + (item.yield > 1 ? ` per exchange (each exchange yields ${item.yield})` : ''),
  };
}

function costCell(item) {
  return costText(item, ' <span class="opacity-50">or</span> ').html;
}

function stageTable(items, { showScope }) {
  const rows = items.map((item) => {
    const scopeCell = showScope
      ? `<td class="py-1.5 pr-3 whitespace-nowrap">${item.scope === 'shared' ? 'Account-wide' : 'Per weapon'}</td>`
      : '';
    return `<tr class="border-b border-slate-800/60 align-top">
        <td class="py-1.5 pr-3 font-semibold">${esc(item.name)}</td>
        <td class="py-1.5 pr-3 whitespace-nowrap">${item.qty.toLocaleString()}</td>
        ${scopeCell}
        <td class="py-1.5 pr-3">${esc(item.tip || '')}</td>
        <td class="py-1.5">${costCell(item)}</td>
      </tr>`;
  }).join('\n');
  const scopeHeader = showScope ? '<th class="text-left font-semibold pr-3 py-1">Scope</th>' : '';
  return `<table class="w-full text-left border-collapse">
    <thead>
      <tr class="border-b border-slate-700 text-slate-400 uppercase text-[10px] tracking-wide">
        <th class="text-left font-semibold pr-3 py-1">Item</th>
        <th class="text-left font-semibold pr-3 py-1">Qty needed</th>
        ${scopeHeader}
        <th class="text-left font-semibold pr-3 py-1">How to obtain</th>
        <th class="text-left font-semibold py-1">Exchange cost</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>`;
}

function buildSection({ title, intro, stageOrder, itemsByStage, stageInfo, showScope, note }) {
  const stageBlocks = stageOrder
    .filter((s) => itemsByStage[s] && itemsByStage[s].length)
    .map((stageName) => `<div class="mb-5">
        <h4 class="text-sm font-bold text-slate-200 mb-1">${esc(stageName)}</h4>
        <p class="text-[11px] text-slate-500 mb-2">${esc(stageInfo[stageName] || '')}</p>
        <div class="overflow-x-auto">${stageTable(itemsByStage[stageName], { showScope })}</div>
      </div>`)
    .join('\n');

  return `<details class="ff-card rounded-lg p-4 text-xs text-slate-300 leading-relaxed">
    <summary class="cursor-pointer text-sm font-bold text-slate-200 select-none">${esc(title)}</summary>
    <div class="mt-3">
      <p class="text-[11px] text-slate-500 mb-4">${esc(intro)}</p>
${stageBlocks}
      ${note ? `<p class="text-[10px] text-slate-600 mt-2">${esc(note)}</p>` : ''}
    </div>
  </details>`;
}

function groupByStage(items) {
  const byStage = {};
  // "completion" items are UI-only checkboxes (e.g. Phantom's per-weapon
  // "already finished" checker) with no real qty/cost — skip them here so
  // the crawler-visible table only lists actual materials.
  items.filter((it) => it.type !== 'completion').forEach((it) => { (byStage[it.stage] ||= []).push(it); });
  return byStage;
}

function injectIntoFile(htmlPath, fragment, markerLabel) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const startMarker = `<!-- STATIC_CONTENT_START: ${markerLabel} -->`;
  const endMarker = '<!-- STATIC_CONTENT_END -->';
  const block = `${startMarker}\n${fragment}\n${endMarker}`;

  let next;
  if (html.includes(startMarker)) {
    const re = new RegExp(startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + endMarker);
    next = html.replace(re, block);
  } else {
    const anchor = '<div class="text-center text-[11px] text-slate-600 py-5">';
    if (!html.includes(anchor)) throw new Error('Could not find footer anchor in ' + htmlPath);
    next = html.replace(anchor, block + '\n\n\t\t\t' + anchor);
  }
  fs.writeFileSync(htmlPath, next);
  console.log('Updated', htmlPath);
}

// ---- Anima ----
const anima = captureAlpineApp([
  path.join(ROOT, 'anima/src/data.js'),
  path.join(ROOT, 'anima/src/main.js'),
]);
const animaStageOrder = [
  '1. Animated (i170)', '2. Awoken (i200)', '3. Anima (i210)', '4. Hyperconductive (i230)',
  '5. Reconditioned (i240)', '6. Sharpened (i260)', '7. Complete (i270)', '8. Lux (i275)', '9. Victory',
];
const animaFragment = buildSection({
  title: 'Full material list — every stage, i170 to i275',
  intro: 'Complete Anima Weapon relic requirements for Heavensward, stage by stage. Quantities below are per weapon (each job you level the relic for needs its own full set).',
  stageOrder: animaStageOrder,
  itemsByStage: groupByStage(anima.items),
  stageInfo: anima.stageInfo,
  showScope: false,
  note: 'Quantities scale per weapon/job selected — the interactive tracker above multiplies these automatically.',
});
injectIntoFile(
  path.join(ROOT, 'anima/index.html'),
  animaFragment,
  'generated by scripts/generate-static-content.js from src/data.js. Edit data.js, not this block.'
);

// ---- Phantom ----
const phantomHtmlPath = path.join(ROOT, 'phantom/index.html');
const phantomInlineTmp = extractInlineScript(phantomHtmlPath);
const phantom = captureAlpineApp([phantomInlineTmp]);
fs.unlinkSync(phantomInlineTmp);
const phantomStageOrder = [
  '1. Penumbrae (i745)', '2. Umbrae (i760)', '3. Obscurum (i775)', '4. Eclipticum (i790)', '5. Occultum (i795)',
];
const phantomFragment = buildSection({
  title: 'Full material list — every stage, i745 to i795',
  intro: 'Complete Phantom Weapon relic requirements for Dawntrail\'s Occult Crescent, stage by stage. "Account-wide" materials are gathered once total; "Per weapon" materials (like the Arcanite exchanges) are needed again for every job.',
  stageOrder: phantomStageOrder,
  itemsByStage: groupByStage(phantom.items),
  stageInfo: phantom.stageInfo,
  showScope: true,
  note: 'Arcanite exchange quantities are tracked in number of Arcanite bought (not Tomestones of Mathematics), since Mathematics tomestones are capped at 2000/week and must be exchanged continuously.',
});
injectIntoFile(
  phantomHtmlPath,
  phantomFragment,
  'generated by scripts/generate-static-content.js from the PHANTOM_DATA array below. Edit that array, not this block.'
);

// ---- Bozja ----
const bozja = captureAlpineApp([
  path.join(ROOT, 'bozja/src/data.js'),
  path.join(ROOT, 'bozja/src/main.js'),
]);
const bozjaStageOrder = [
  "1. Resistance (i485)", "2. Augmented Resistance (i500)", "3. Recollection (i500)",
  "4. Law's Order (i510)", "5. Augmented Law's Order (i515)", "6. Blade's Weapon (i535)", "7. Victory",
];
const bozjaFragment = buildSection({
  title: 'Full material list — every stage, i485 to i535',
  intro: 'Complete Bozja Resistance Weapon relic requirements for Shadowbringers\' Bozjan Southern Front and Zadnor, stage by stage. Quantities below are per weapon (each job you level the relic for needs its own full set).',
  stageOrder: bozjaStageOrder,
  itemsByStage: groupByStage(bozja.items),
  stageInfo: bozja.stageInfo,
  showScope: false,
  note: 'Quantities scale per weapon/job selected — the interactive tracker above multiplies these automatically.',
});
injectIntoFile(
  path.join(ROOT, 'bozja/index.html'),
  bozjaFragment,
  'generated by scripts/generate-static-content.js from src/data.js. Edit data.js, not this block.'
);

// ---- ARR ----
const arr = captureAlpineApp([
  path.join(ROOT, 'arr/src/data.js'),
  path.join(ROOT, 'arr/src/main.js'),
]);
const arrStageOrder = [
  '1. Relic (i80)', '2. Zenith (i90)', '3. Atma (i100)', '4. Animus (i100)',
  '5. Novus (i110)', '6. Nexus (i115)', '7. Zodiac Braves (i125)', '8. Zodiac Zeta (i135)',
];
const arrFragment = buildSection({
  title: 'Full material list — every stage, i80 to i135',
  intro: 'Complete ARR Zodiac Weapon relic requirements for the original A Realm Reborn relic line, stage by stage. Quantities below are per weapon (each job you level the relic for needs its own full set). Nexus onward is quest/light-gated rather than a simple item turn-in — see each stage\'s tip for the real requirement.',
  stageOrder: arrStageOrder,
  itemsByStage: groupByStage(arr.items),
  stageInfo: arr.stageInfo,
  showScope: false,
  note: 'Quantities scale per weapon/job selected — the interactive tracker above multiplies these automatically.',
});
injectIntoFile(
  path.join(ROOT, 'arr/index.html'),
  arrFragment,
  'generated by scripts/generate-static-content.js from src/data.js. Edit data.js, not this block.'
);

// ---- Eureka ----
const eureka = captureAlpineApp([
  path.join(ROOT, 'eureka/src/data.js'),
  path.join(ROOT, 'eureka/src/main.js'),
]);
const eurekaStageOrder = [
  '1. Antiquated (i290)', '2. Anemos (i355)', '3. Pagos (i370)',
  '4. Pyros (i385)', '5. Hydatos (i405)', '6. Physeos (i405)',
];
const eurekaFragment = buildSection({
  title: 'Full material list — every stage, i290 to i405',
  intro: 'Complete Eureka Weapon relic requirements for Stormblood, stage by stage. Quantities below are per weapon (each job you level the relic for needs its own full set) and are cumulative totals across each tier\'s sub-stages.',
  stageOrder: eurekaStageOrder,
  itemsByStage: groupByStage(eureka.items),
  stageInfo: eureka.stageInfo,
  showScope: false,
  note: 'Quantities scale per weapon/job selected — the interactive tracker above multiplies these automatically.',
});
injectIntoFile(
  path.join(ROOT, 'eureka/index.html'),
  eurekaFragment,
  'generated by scripts/generate-static-content.js from src/data.js. Edit data.js, not this block.'
);

// ---- Manderville ----
const manderville = captureAlpineApp([
  path.join(ROOT, 'manderville/src/data.js'),
  path.join(ROOT, 'manderville/src/main.js'),
]);
const mandervilleStageOrder = [
  '1. Manderville (i615)', '2. Amazing Manderville (i630)',
  '3. Majestic Manderville (i645)', '4. Mandervillous (i665)',
];
const mandervilleFragment = buildSection({
  title: 'Full material list — every stage, i615 to i665',
  intro: 'Complete Manderville Weapon relic requirements for Endwalker, stage by stage. Quantities below are per weapon (each job you upgrade needs its own set), and every upgrade item costs 500 Allagan Tomestones of Poetics.',
  stageOrder: mandervilleStageOrder,
  itemsByStage: groupByStage(manderville.items),
  stageInfo: manderville.stageInfo,
  showScope: false,
  note: 'Quantities scale per weapon/job selected — the interactive tracker above multiplies these automatically.',
});
injectIntoFile(
  path.join(ROOT, 'manderville/index.html'),
  mandervilleFragment,
  'generated by scripts/generate-static-content.js from src/data.js. Edit data.js, not this block.'
);

// ---------------------------------------------------------------------------
// SEO extras, all derived from the same tracker data so they can't drift:
//   * a visible "Frequently asked questions" block under each material list
//   * JSON-LD (BreadcrumbList + FAQPage) in each tracker page's <head>
//   * sitemap.xml at the repo root
// ---------------------------------------------------------------------------
const SITE = 'https://artemisesphexo.github.io/ffxiv-relic-tracker/';
const HUB_NAME = 'FFXIV Relic Weapon Trackers';

const TRACKERS = [
  { slug: 'arr', app: arr, stageOrder: arrStageOrder, weapon: 'Zodiac Weapon', expansion: 'A Realm Reborn', crumb: 'ARR Zodiac Weapon Tracker' },
  { slug: 'anima', app: anima, stageOrder: animaStageOrder, weapon: 'Anima Weapon', expansion: 'Heavensward', crumb: 'Anima Weapon Tracker' },
  { slug: 'eureka', app: eureka, stageOrder: eurekaStageOrder, weapon: 'Eureka Weapon', expansion: 'Stormblood', crumb: 'Eureka Weapon Tracker' },
  { slug: 'bozja', app: bozja, stageOrder: bozjaStageOrder, weapon: 'Bozja Resistance Weapon', expansion: 'Shadowbringers', crumb: 'Bozja Resistance Weapon Tracker' },
  { slug: 'manderville', app: manderville, stageOrder: mandervilleStageOrder, weapon: 'Manderville Weapon', expansion: 'Endwalker', crumb: 'Manderville Weapon Tracker' },
  { slug: 'phantom', app: phantom, stageOrder: phantomStageOrder, weapon: 'Phantom Weapon', expansion: 'Dawntrail', crumb: 'Phantom Weapon Tracker' },
];

// "3. Pagos (i370)" -> { name: "Pagos", ilvl: "i370" }
function parseStage(stage) {
  const m = String(stage).match(/^\d+\.\s*(.*?)\s*\((i\d+)\)\s*$/);
  return m ? { name: m[1], ilvl: m[2] } : { name: String(stage).replace(/^\d+\.\s*/, ''), ilvl: '' };
}

function sentence(s) {
  const t = String(s || '').trim();
  if (!t) return '';
  return /[.!?]$/.test(t) ? t : t + '.';
}

function buildFaq(t) {
  const realStages = t.stageOrder.filter((s) => parseStage(s).ilvl);
  const first = parseStage(realStages[0]);
  const last = parseStage(realStages[realStages.length - 1]);
  const stageList = realStages.map((s) => { const p = parseStage(s); return `${p.name} (${p.ilvl})`; }).join(', ');
  const perWeaponAll = !t.app.items.some((it) => it.scope === 'shared');

  const faqs = [];
  faqs.push({
    q: `How many stages does the FFXIV ${t.weapon} have?`,
    a: `The ${t.expansion} ${t.weapon} has ${realStages.length} upgrade stages, from ${first.ilvl} to ${last.ilvl}: ${stageList}.`,
  });

  // The materials people actually search quantities for: real items with a
  // meaningful count. Fall back to smaller counts if a line has few of those.
  const candidates = t.app.items.filter((it) =>
    it.type !== 'checklist' && it.type !== 'completion' && it.qty > 1 &&
    !/exchange|checklist|unlocked/i.test(it.name) && !/^'/.test(it.name));
  // Group colour/letter variants ("Aetherwell: Green", "Phantom Dispeller α")
  // into one question so the FAQ doesn't repeat itself.
  const baseName = (n) => n.replace(/:\s.*$/, '').replace(/\s*\(.*\)$/, '').replace(/\s+[αβγδ]$/, '').trim();
  const groups = new Map();
  for (const it of candidates) {
    const k = baseName(it.name) + '|' + it.stage + '|' + it.qty;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(it);
  }
  const picked = [...groups.values()]
    .sort((a, b) => b[0].qty - a[0].qty)
    .slice(0, 6)
    .sort((a, b) => t.stageOrder.indexOf(a[0].stage) - t.stageOrder.indexOf(b[0].stage));

  for (const group of picked) {
    const it = group[0];
    const st = parseStage(it.stage);
    const scope = it.scope === 'shared' ? 'in total (account-wide, not per job)' : 'per weapon';
    const stagePart = `for the ${st.name}${st.ilvl ? ` (${st.ilvl})` : ''} stage`;
    if (group.length > 1) {
      const base = baseName(it.name);
      const variant = (g) => g.name.slice(base.length).replace(/^[:\s(]+|\)$/g, '').trim();
      const sources = group.map((g) => `${variant(g)}: ${sentence(g.tip)}`).join(' ');
      faqs.push({
        q: `How many ${base} do you need for the ${t.weapon}?`,
        a: `You need ${it.qty.toLocaleString('en-US')} of each ${base} (${group.map(variant).join(', ')}) ${scope} ${stagePart}. ${sources}`.replace(/\s+/g, ' ').trim(),
      });
      continue;
    }
    const cost = costText(it, ' or ');
    const costPart = (it.options || []).some((o) => o.cost > 0) ? ` Exchange cost: ${cost.text}.` : '';
    faqs.push({
      q: `How many ${it.name} do you need for the ${t.weapon}?`,
      a: `You need ${it.qty.toLocaleString('en-US')} ${it.name} ${scope} ${stagePart}. ${sentence(it.tip)}${costPart}`.replace(/\s+/g, ' ').trim(),
    });
  }

  faqs.push({
    q: `Does this ${t.weapon} tracker save my progress?`,
    a: `Yes. Progress is saved in your browser's local storage, with no account or server. ${perWeaponAll ? 'Select one or more jobs and the totals multiply automatically for every weapon you are working on.' : 'Account-wide materials are counted once, while per-weapon materials multiply for every job you select.'} Clearing browser data or switching devices resets it.`,
  });
  return faqs;
}

function faqHtml(faqs) {
  const items = faqs.map((f) => `      <div class="mb-4">
        <h3 class="text-sm font-bold text-slate-200 mb-1">${esc(f.q)}</h3>
        <p class="text-slate-400">${esc(f.a)}</p>
      </div>`).join('\n');
  return `<section class="ff-card rounded-lg p-4 mt-3 text-xs text-slate-300 leading-relaxed">
    <h2 class="text-sm font-bold text-slate-200 mb-3">Frequently asked questions</h2>
${items}
  </section>`;
}

function jsonLd(t, faqs) {
  const graph = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: HUB_NAME, item: SITE },
        { '@type': 'ListItem', position: 2, name: t.crumb, item: `${SITE}${t.slug}/` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  // Escape "<" so no string in the data can close the script tag early.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

function replaceOrInsert(html, start, end, block, insertFn) {
  const re = new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const full = `${start}\n${block}\n${end}`;
  return re.test(html) ? html.replace(re, full) : insertFn(html, full);
}

for (const t of TRACKERS) {
  const file = path.join(ROOT, t.slug, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const faqs = buildFaq(t);

  html = replaceOrInsert(html, '<!-- FAQ_START: generated by scripts/generate-static-content.js -->', '<!-- FAQ_END -->', faqHtml(faqs),
    (h, full) => {
      const anchor = '<!-- STATIC_CONTENT_END -->';
      if (!h.includes(anchor)) throw new Error('No STATIC_CONTENT_END in ' + file);
      return h.replace(anchor, `${anchor}\n${full}`);
    });

  html = replaceOrInsert(html, '<!-- JSONLD_START: generated by scripts/generate-static-content.js -->', '<!-- JSONLD_END -->', jsonLd(t, faqs),
    (h, full) => {
      if (!h.includes('</head>')) throw new Error('No </head> in ' + file);
      return h.replace('</head>', `${full}\n</head>`);
    });

  fs.writeFileSync(file, html);
  console.log('Updated FAQ + JSON-LD in', file);
}

// sitemap.xml — lastmod is today's date each time this script runs, which is
// whenever tracker data changes.
const today = new Date().toISOString().slice(0, 10);
const urls = [SITE, ...TRACKERS.map((t) => `${SITE}${t.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log('Wrote sitemap.xml');

console.log('Done. Diff anima/index.html, phantom/index.html, bozja/index.html, arr/index.html, eureka/index.html, and manderville/index.html to review before committing.');
