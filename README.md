# FFXIV Relic Weapon Trackers

Progress checklists for Final Fantasy XIV's relic weapon grinds. Pick a line, check off materials as you farm them, and keep track across every job.

**Live site:** https://artemisesphexo.github.io/ffxiv-relic-tracker/

## Trackers

- **ARR Relic Weapon** — the original A Realm Reborn Zodiac Weapon line, i80 → i135. Relic, Zenith, Atma, Animus, Novus, Nexus, Zodiac Braves, and the final Zeta.
- **Anima Weapon** — Heavensward relic progression, i170 → i275. Nine stages, dungeon runs, and the primal gauntlet.
- **Eureka Weapon** — Stormblood relic progression, i290 → i405. Anemos, Pagos, Pyros, and Hydatos crystal grinding, up to the final Physeos upgrade.
- **Bozja Resistance Weapon** — Shadowbringers relic progression, i485 → i535. Zadnor grinding and the Irresistible stat allocation.
- **Manderville Weapon** — Endwalker relic progression, i615 → i665. Four stages (Manderville, Amazing, Majestic, Mandervillous), each 3 upgrade items per weapon bought with Poetics.
- **Phantom Weapon** — Dawntrail relic progression, i745 → i795. Five stages through the Occult Crescent.

Each tracker lets you select your job(s), check off materials as you collect them, and see live totals for currencies and crafting materials still needed. Every tracker page also ends with a full, crawler-friendly material list for each stage. Progress is saved locally in your browser (no account, no server) — clearing your browser data or switching devices will reset it.

## Tech

Plain HTML/CSS/JS, no build step to run the site itself:

- [Alpine.js](https://alpinejs.dev/) for interactivity, loaded from a CDN
- [Tailwind CSS](https://tailwindcss.com/) compiled once into `assets/site.css` (only needed if you're changing styles — see below)
- No backend, no database — everything runs client-side and saves to `localStorage`
- Game icons load from [XIVAPI](https://v2.xivapi.com) via `assets/xivapi-icons.js` (see [Icons](#icons) below). Lookups are cached for 30 days, and the local PNGs remain as the fallback if the API is unreachable.

## Local development

Just open any `index.html` in a browser, or serve the folder locally:

```
npx serve .
```

If you add or change Tailwind classes in any HTML file, rebuild the stylesheet:

```
npx tailwindcss -i input.css -o assets/site.css --minify
```

Note: `input.css` and the Tailwind config aren't committed, so a rebuild needs them recreated first. Until then, arbitrary-value classes such as `text-[#2ea8a3]` only work if they're already in `assets/site.css` — otherwise define the colour in the page's own `<style>` block (the Manderville page does this).

## Editing tracker data

Each tracker's materials live in `<tracker>/src/data.js` (Phantom keeps its `PHANTOM_DATA` array inline in `phantom/index.html`). After changing any data, regenerate the static material lists at the bottom of each page:

```
node scripts/generate-static-content.js
```

The output is committed as plain HTML, so there's still no build step at deploy time.

## Icons

Icons are referenced by game ID in the data files, and `assets/xivapi-icons.js` swaps them in once they've loaded:

| Reference | Meaning | Example |
|---|---|---|
| `itemId: 28` | Row in XIVAPI's `Item` sheet | Allagan Tomestone of Poetics |
| `itemId: "EventItem:2001298"` | Key item (`EventItem` sheet) | Book of Skyfire I |
| `itemId: "Icon:61801"` | Raw game icon ID, no lookup needed | Dungeon duty icon |

- Shared currency icons (Poetics, seals, tokens) are mapped once per tracker in `ICON_ITEM_IDS` in `data.js`.
- Static `<img>` tags take a `data-xiv-item="…"` attribute instead.
- Item IDs can be found with XIVAPI's search, e.g. `https://v2.xivapi.com/api/search?query=Name="Cosmic Crystallite"&sheets=Item&fields=Name,Icon`.
- Icon IDs for non-item things (duty types, FATEs, etc.) are listed in Gamer Escape's [Dictionary of Icons](https://ffxiv.gamerescape.com/wiki/Dictionary_of_Icons) — e.g. 061801 Dungeon, 061804 Trial, 061807 Duty Roulette, 061809 FATE.

## Structure

```
├── index.html            # hub page linking to all trackers
├── arr/                  # A Realm Reborn relic tracker (Zodiac)
├── anima/                # Heavensward relic tracker
├── eureka/               # Stormblood relic tracker
├── bozja/                # Shadowbringers relic tracker
├── manderville/          # Endwalker relic tracker
├── phantom/              # Dawntrail relic tracker
├── assets/               # compiled CSS, fonts, social preview images, xivapi-icons.js
└── scripts/              # generate-static-content.js
```

Each tracker folder holds its own `index.html`, `src/` (`data.js` + `main.js`), and `images/` fallbacks.

## Credits

Made by [@ArtemisEsphexo](https://twitter.com/ArtemisEsphexo). Game icons served by [XIVAPI](https://v2.xivapi.com); FINAL FANTASY XIV © SQUARE ENIX. Data cross-referenced against community wikis and guides for accuracy — corrections welcome via an issue or PR.
