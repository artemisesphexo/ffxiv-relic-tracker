# FFXIV Relic Weapon Trackers

Progress checklists for Final Fantasy XIV's relic weapon grinds. Pick a line, check off materials as you farm them, and keep track across every job.

**Live site:** https://artemisesphexo.github.io/ffxiv-relic-tracker/

## Trackers

- **Anima Weapon** — Heavensward relic progression, i170 → i275. Nine stages, dungeon runs, and the primal gauntlet.
- **Bozja Resistance Weapon** — Shadowbringers relic progression, i485 → i535. Zadnor grinding and the Irresistible stat allocation.
- **Phantom Weapon** — Dawntrail relic progression, i745 → i795. Five stages through the Occult Crescent.

Each tracker lets you select your job(s), check off materials as you collect them, and see live totals for currencies and crafting materials still needed. Progress is saved locally in your browser (no account, no server) — clearing your browser data or switching devices will reset it.

## Tech

Plain HTML/CSS/JS, no build step to run the site itself:

- [Alpine.js](https://alpinejs.dev/) for interactivity, loaded from a CDN
- [Tailwind CSS](https://tailwindcss.com/) compiled once into `assets/site.css` (only needed if you're changing styles — see below)
- No backend, no database — everything runs client-side and saves to `localStorage`

## Local development

Just open any `index.html` in a browser, or serve the folder locally:

```
npx serve .
```

If you add or change Tailwind classes in any HTML file, rebuild the stylesheet:

```
npx tailwindcss -i input.css -o assets/site.css --minify
```

## Structure

```
├── index.html          # hub page linking to all trackers
├── anima/               # Heavensward relic tracker
├── bozja/                # Shadowbringers relic tracker
├── phantom/            # Dawntrail relic tracker
├── assets/              # compiled CSS, fonts
└── scripts/             # build helpers
```

## Credits

Made by [@ArtemisEsphexo](https://twitter.com/ArtemisEsphexo). Data cross-referenced against community wikis and guides for accuracy — corrections welcome via an issue or PR.
