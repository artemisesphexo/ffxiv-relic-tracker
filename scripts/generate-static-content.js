#!/usr/bin/env node
/**
 * Regenerates the crawler-visible "Full material list" tables in
 * anima/index.html and phantom/index.html from the SAME data arrays the
 * interactive tracker uses (anima/src/data.js + anima/src/main.js, and the
 * PHANTOM_DATA array inlined in phantom/index.html).
 *
 * Run this after editing item data so the static tables never drift from
 * what the interactive tracker actually shows:
 *
 *   node scripts/generate-static-content.js
 *
 * It does NOT need a build step at deploy time — the output is committed
 * as plain HTML, and Netlify keeps serving these files as static assets.
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

function costCell(item) {
  const opts = (item.options || []).filter((o) => o.cost > 0);
  if (opts.length === 0) {
    const labels = (item.options || []).map((o) => o.label).filter(Boolean);
    return esc(labels.join(' or ') || 'Task');
  }
  return opts.map((o) => `${o.cost.toLocaleString()} ${esc(o.currency || o.label)}`).join(' <span class="opacity-50">or</span> ');
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

console.log('Done. Diff anima/index.html, phantom/index.html, bozja/index.html, and arr/index.html to review before committing.');
