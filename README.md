# FFXIV Relic Weapon Trackers

Progress checklists for Final Fantasy XIV's relic weapon grinds. Pick a line, check off materials as you farm them, and keep track across every job.

**Live site:** https://artemisesphexo.github.io/ffxiv-relic-tracker/

## Trackers

- **ARR Relic Weapon** — the original A Realm Reborn Zodiac Weapon line, i80 → i135. Relic, Zenith, Atma, Animus, Novus, Nexus, Zodiac Braves, and the final Zeta.
- **Anima Weapon** — Heavensward relic progression, i170 → i275. Nine stages, dungeon runs, and the primal gauntlet.
- **Bozja Resistance Weapon** — Shadowbringers relic progression, i485 → i535. Zadnor grinding and the Irresistible stat allocation.
- **Manderville Weapon** — Endwalker relic progression, i615 → i665. Four stages (Manderville, Amazing, Majestic, Mandervillous), each 3 upgrade items per weapon bought with Poetics.
- **Phantom Weapon** — Dawntrail relic progression, i745 → i795. Five stages through the Occult Crescent.

Each tracker lets you select your job(s), check off materials as you collect them, and see live totals for currencies and crafting materials still needed. Progress is saved locally in your browser (no account, no server) — clearing your browser data or switching devices will reset it.

## Tech

Plain HTML/CSS/JS, no build step to run the site itself:

- [Alpine.js](https://alpinejs.dev/) for interactivity, loaded from a CDN
- [Tailwind CSS](https://tailwindcss.com/) compiled once into `assets/site.css` (only needed if you're changing styles — see below)
- No backend, no database — everything runs client-side and saves to `localStorage`
- Item and currency icons load from [XIVAPI](https://v2.xivapi.com) via `assets/xivapi-icons.js`, looked up by in-game item ID (`itemId` on each data entry, `ICON_ITEM_IDS` for shared currency icons). Results are cached for 30 days, and the local PNGs remain as the fallback if the API is unreachable.

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
├── arr/                  # A Realm Reborn relic tracker
├── anima/               # Heavensward relic tracker
├── bozja/                # Shadowbringers relic tracker
├── manderville/     # Endwalker relic tracker
├── phantom/            # Dawntrail relic tracker
├── assets/              # compiled CSS, fonts
└── scripts/             # build helpers
```

## Credits

Made by [@ArtemisEsphexo](https://twitter.com/ArtemisEsphexo). Game icons served by [XIVAPI](https://v2.xivapi.com); FINAL FANTASY XIV © SQUARE ENIX. Data cross-referenced against community wikis and guides for accuracy — corrections welcome via an issue or PR.
