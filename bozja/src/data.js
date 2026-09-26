// Global Icon Constants
const ICONS = {
	POETICS: "./images/icons/poetics.png",
	PLACEHOLDER: "./images/icons/placeholder.png",
};

// In-game item IDs for shared icons, used by assets/xivapi-icons.js to load
// the official icon from XIVAPI (the local PNG above stays as the fallback).
// Individual materials carry their own `itemId` on the data entry instead.
const ICON_ITEM_IDS = {
	[ICONS.POETICS]: 28, // Allagan Tomestone of Poetics
};

// Sources verified against AkhMorning's Bozjan Southern Front relic guide and
// the console games wiki (Resistance Weapons / Blade's Weapons quest chain),
// Sept 2026. Quantities are per-weapon (per job selected) — Bozja has no
// account-wide sharing like Phantom's Aetherwell.
const BOZJA_DATA = [
	// --- STAGE 1: Resistance (i485) ---
	{
		id: "thavnairian_scalepowder",
		stage: "1. Resistance (i485)",
		name: "Thavnairian Scalepowder",
		type: "item",
		icon: "./images/icons/thavnairian-scalepowder.png",
		itemId: 30273,
		qty: 4,
		tip: "Quest: 'A Sober Proposal'. Bought with Poetics from Sundry Splendors vendors.",
		options: [
			{ label: "Poetics", cost: 250, currency: "Poetics", icon: ICONS.POETICS },
		],
	},

	// --- STAGE 2: Augmented Resistance (i500) ---
	{
		id: "tortured_memory",
		stage: "2. Augmented Resistance (i500)",
		name: "Tortured Memory of the Dying",
		type: "item",
		icon: "./images/icons/tortured-memory.png",
		itemId: 31573,
		qty: 20,
		tip: "Quest: 'For Want of a Memory'. Heavensward FATEs (Coerthas/Sea of Clouds) or Bozjan Southern Front skirmishes.",
		options: [{ label: "FATE / Skirmish", cost: 0, currency: "" }],
	},
	{
		id: "sorrowful_memory",
		stage: "2. Augmented Resistance (i500)",
		name: "Sorrowful Memory of the Dying",
		type: "item",
		icon: "./images/icons/sorrowful-memory.png",
		itemId: 31574,
		qty: 20,
		tip: "Heavensward FATEs (Dravanian areas) or Old Bozja skirmishes.",
		options: [{ label: "FATE / Skirmish", cost: 0, currency: "" }],
	},
	{
		id: "harrowing_memory",
		stage: "2. Augmented Resistance (i500)",
		name: "Harrowing Memory of the Dying",
		type: "item",
		icon: "./images/icons/harrowing-memory.png",
		itemId: 31575,
		qty: 20,
		tip: "Heavensward FATEs (Hinterlands/Azys Lla) or Alermuc Climb skirmishes.",
		options: [{ label: "FATE / Skirmish", cost: 0, currency: "" }],
	},

	// --- STAGE 3: Recollection (i500) ---
	{
		id: "bitter_memory",
		stage: "3. Recollection (i500)",
		name: "Bitter Memory of the Dying",
		type: "item",
		icon: "./images/icons/bitter-memory.png",
		itemId: 31576,
		qty: 6,
		tip: "Quest: 'The Will to Resist'. Level 60 dungeons (synced) or Duty Roulette: Leveling.",
		options: [{ label: "Dungeon / Roulette", cost: 0, currency: "" }],
	},

	// --- STAGE 4: Law's Order (i510) ---
	{
		id: "loathsome_memory",
		stage: "4. Law's Order (i510)",
		name: "Loathsome Memory of the Dying",
		type: "item",
		icon: "./images/icons/loathsome-memory.png",
		itemId: 32956,
		qty: 15,
		tip: "Quest: 'Change of Arms'. Castrum Lacus Litore (5 guaranteed per clear) or Crystal Tower alliance raids synced (1 per clear).",
		options: [{ label: "Castrum / Alliance Raid", cost: 0, currency: "" }],
	},

	// --- STAGE 5: Augmented Law's Order (i515) ---
	{
		id: "haunting_memory",
		stage: "5. Augmented Law's Order (i515)",
		name: "Haunting Memory of the Dying",
		type: "item",
		icon: "./images/icons/haunting-memory.png",
		itemId: 32957,
		qty: 18,
		tip: "Quest: 'The Resistance Remembers'. Dun Scaith alliance raids synced (3 per clear) or Gyr Abania FATEs.",
		options: [{ label: "Alliance Raid / FATE", cost: 0, currency: "" }],
	},
	{
		id: "vexatious_memory",
		stage: "5. Augmented Law's Order (i515)",
		name: "Vexatious Memory of the Dying",
		type: "item",
		icon: "./images/icons/vexatious-memory.png",
		itemId: 32958,
		qty: 18,
		tip: "Return to Ivalice alliance raids synced (3 per clear) or Far East FATEs.",
		options: [{ label: "Alliance Raid / FATE", cost: 0, currency: "" }],
	},
	{
		id: "timeworn_artifact",
		stage: "5. Augmented Law's Order (i515)",
		name: "Timeworn Artifact",
		type: "item",
		icon: "./images/icons/timeworn-artifact.png",
		itemId: 32959,
		qty: 15,
		tip: "Quest: 'A New Path of Resistance'. Delubrum Reginae (3 guaranteed per clear) or Palace of the Dead (100% at floors 151+).",
		options: [{ label: "Delubrum Reginae / PotD", cost: 0, currency: "" }],
	},

	// --- STAGE 6: Blade's Weapon (i535) ---
	{
		id: "compact_axle",
		stage: "6. Blade's Weapon (i535)",
		name: "Compact Axle",
		type: "item",
		icon: "./images/icons/compact-axle.png",
		itemId: 33757,
		qty: 30,
		tip: "Quest: 'Spare Parts'. Zadnor Southern Plateau skirmishes, or Alexander Normal floors 1-2/5-6/9-10.",
		options: [{ label: "Skirmish / Alexander", cost: 0, currency: "" }],
	},
	{
		id: "compact_spring",
		stage: "6. Blade's Weapon (i535)",
		name: "Compact Spring",
		type: "item",
		icon: "./images/icons/compact-spring.png",
		itemId: 33758,
		qty: 30,
		tip: "Zadnor Southern Plateau Critical Engagements (2 per CE), or Alexander floors 3-4/7-8/11-12.",
		options: [{ label: "Critical Engagement / Alexander", cost: 0, currency: "" }],
	},
	{
		id: "battles_for_realm",
		stage: "6. Blade's Weapon (i535)",
		name: "A Day in the Life: Battles for the Realm",
		type: "item",
		icon: "./images/icons/raid.png",
		qty: 30,
		tip: "Quest: 'Tell Me a Story'. Zadnor Western Plateau skirmishes, or Omega Normal floors 1-2/5-6/9-10.",
		options: [{ label: "Skirmish / Omega", cost: 0, currency: "" }],
	},
	{
		id: "beyond_the_rift",
		stage: "6. Blade's Weapon (i535)",
		name: "A Day in the Life: Beyond the Rift",
		type: "item",
		icon: "./images/icons/raid.png",
		qty: 30,
		tip: "Zadnor Western Plateau Critical Engagements (2 per CE), or Omega floors 3-4/7-8/11-12.",
		options: [{ label: "Critical Engagement / Omega", cost: 0, currency: "" }],
	},
	{
		id: "bleak_memory",
		stage: "6. Blade's Weapon (i535)",
		name: "Bleak Memory of the Dying",
		type: "item",
		icon: "./images/icons/bleak-memory.png",
		itemId: 33763,
		qty: 30,
		tip: "Quest: 'A Fond Memory'. Zadnor Northern Plateau skirmishes, or Eden Normal floors 1-2/5-6/9-10.",
		options: [{ label: "Skirmish / Eden", cost: 0, currency: "" }],
	},
	{
		id: "lurid_memory",
		stage: "6. Blade's Weapon (i535)",
		name: "Lurid Memory of the Dying",
		type: "item",
		icon: "./images/icons/lurid-memory.png",
		itemId: 33764,
		qty: 30,
		tip: "Zadnor Northern Plateau Critical Engagements (2 per CE), or Eden floors 3-4/7-8/11-12.",
		options: [{ label: "Critical Engagement / Eden", cost: 0, currency: "" }],
	},
	{
		id: "raw_emotion",
		stage: "6. Blade's Weapon (i535)",
		name: "Raw Emotion",
		type: "item",
		icon: "./images/icons/raw-emotion.png",
		itemId: 33767,
		qty: 15,
		tip: "Quest: 'Irresistible' (repeats per weapon). The Dalriada (3/clear), Delubrum Reginae (2/clear), or synced Lv70 Stormblood dungeons (1/clear).",
		options: [{ label: "Dalriada / Delubrum / Dungeon", cost: 0, currency: "" }],
	},

	// --- STAGE 7: Victory ---
	{
		// THIS ID MUST MATCH THE HTML LOGIC ('resistance_trials')
		id: "resistance_trials",
		stage: "7. Victory",
		name: "Stat Allocation (Irresistible)",
		type: "checklist",
		icon: "./images/icons/stat-allocation.png",
		qty: 1,
		tip: "Finish the 'Irresistible' quest and allocate 1,167 points across 4 stats to reveal your finished Blade's Weapon!",
		tooltip: [
			"Turn in all Stage 6 materials to Zlatan in Gangos",
			"Allocate 1,167 points across 4 stats of your choice",
			"Reallocating later costs 4x Aetherial Sealant (400 Poetics)",
		],
		options: [{ label: "Quest Complete", cost: 0, currency: "" }],
	},
];

// All 17 jobs eligible for the Resistance weapon line (every job that existed
// through Shadowbringers — excludes Reaper, Sage, Viper, Pictomancer, which
// were added in Endwalker/Dawntrail).
const JOBS = [
	{ id: "PLD", label: "Paladin", role: "tank" },
	{ id: "WAR", label: "Warrior", role: "tank" },
	{ id: "DRK", label: "Dark Knight", role: "tank" },
	{ id: "GNB", label: "Gunbreaker", role: "tank" },
	{ id: "WHM", label: "White Mage", role: "healer" },
	{ id: "SCH", label: "Scholar", role: "healer" },
	{ id: "AST", label: "Astrologian", role: "healer" },
	{ id: "MNK", label: "Monk", role: "dps" },
	{ id: "DRG", label: "Dragoon", role: "dps" },
	{ id: "NIN", label: "Ninja", role: "dps" },
	{ id: "SAM", label: "Samurai", role: "dps" },
	{ id: "BRD", label: "Bard", role: "dps" },
	{ id: "MCH", label: "Machinist", role: "dps" },
	{ id: "DNC", label: "Dancer", role: "dps" },
	{ id: "BLM", label: "Black Mage", role: "dps" },
	{ id: "SMN", label: "Summoner", role: "dps" },
	{ id: "RDM", label: "Red Mage", role: "dps" },
];

const STAGE_INFO = {
	"1. Resistance (i485)": "Buy Thavnairian Scalepowder with Poetics to start the relic.",
	"2. Augmented Resistance (i500)": "Collect 60 Memories of the Dying from FATEs or Bozja skirmishes.",
	"3. Recollection (i500)": "Run 6 synced level 60 dungeons for Bitter Memories.",
	"4. Law's Order (i510)": "Clear Castrum Lacus Litore or Crystal Tower raids for Loathsome Memories.",
	"5. Augmented Law's Order (i515)": "Dun Scaith / Return to Ivalice raids, then Delubrum Reginae for Timeworn Artifacts.",
	"6. Blade's Weapon (i535)": "The Zadnor grind — 6 material types (30 each) plus Raw Emotion from Irresistible.",
	"7. Victory": "Allocate your stat points and claim the finished Blade's Weapon!",
};
