// Global Icon Constants
const ICONS = {
	POETICS: "./images/icons/poetics.png",
	PLACEHOLDER: "./images/icons/placeholder.png",
};

// In-game item IDs for shared icons, used by assets/xivapi-icons.js to load
// the official icon from XIVAPI. Paths listed here are only lookup keys, so
// they need no local file; anything without an ID needs its PNG in images/.
// Individual materials carry their own `itemId` on the data entry instead.
const ICON_ITEM_IDS = {
	[ICONS.POETICS]: 28, // Allagan Tomestone of Poetics
};

// Sources verified against Console Games Wiki's Manderville Weapons page,
// cross-checked against Icy Veins' Manderville Relic Weapons guide and
// Eorzean Tavern's Manderville Weapons guide, Sept 2026. All three agree:
// every stage costs 3 upgrade items per weapon at 500 Allagan Tomestones of
// Poetics each (1,500 Poetics per weapon per stage), bought from Jubrunnah in
// Radz-at-Han and turned in to the House Manderville Artisan.
const MANDERVILLE_DATA = [
	// --- STAGE 1: Manderville (i615) ---
	{
		id: "manderium_meteorite",
		stage: "1. Manderville (i615)",
		name: "Manderium Meteorite",
		type: "item",
		icon: ICONS.PLACEHOLDER,
		itemId: 38420,
		qty: 3,
		tip: "Buy from Jubrunnah in Radz-at-Han (X:12.2, Y:10.9) for 500 Poetics each. First weapon via 'Make It a Manderville', every one after via 'Make Another Manderville' (House Manderville Artisan).",
		options: [
			{ label: "Poetics", cost: 500, currency: "Poetics", icon: ICONS.POETICS },
		],
	},

	// --- STAGE 2: Amazing Manderville (i630) ---
	{
		id: "complementary_chondrite",
		stage: "2. Amazing Manderville (i630)",
		name: "Complementary Chondrite",
		type: "item",
		icon: ICONS.PLACEHOLDER,
		itemId: 38940,
		qty: 3,
		tip: "Buy from Jubrunnah in Radz-at-Han for 500 Poetics each, then turn in with your Manderville weapon via 'The Next Mander-level'.",
		options: [
			{ label: "Poetics", cost: 500, currency: "Poetics", icon: ICONS.POETICS },
		],
	},

	// --- STAGE 3: Majestic Manderville (i645) ---
	{
		id: "amplifying_achondrite",
		stage: "3. Majestic Manderville (i645)",
		name: "Amplifying Achondrite",
		type: "item",
		icon: ICONS.PLACEHOLDER,
		itemId: 40322,
		qty: 3,
		tip: "Buy from Jubrunnah in Radz-at-Han for 500 Poetics each, then turn in with your Amazing weapon via 'In Need of Adjustment'. You pick the substats: two at 293, one at 72 (re-rolling costs 1 more Achondrite).",
		options: [
			{ label: "Poetics", cost: 500, currency: "Poetics", icon: ICONS.POETICS },
		],
	},

	// --- STAGE 4: Mandervillous (i665) ---
	{
		id: "cosmic_crystallite",
		stage: "4. Mandervillous (i665)",
		name: "Cosmic Crystallite",
		type: "item",
		icon: ICONS.PLACEHOLDER,
		itemId: 41032,
		qty: 3,
		tip: "Buy from Jubrunnah in Radz-at-Han for 500 Poetics each, then turn in with your Majestic weapon via 'Positively Mandervillous'. Substats: two at 306, one at 72 (re-rolling costs 1 more Crystallite).",
		options: [
			{ label: "Poetics", cost: 500, currency: "Poetics", icon: ICONS.POETICS },
		],
	},
	{
		// THIS ID MUST MATCH THE HTML LOGIC ('mandervillous_complete')
		id: "mandervillous_complete",
		stage: "4. Mandervillous (i665)",
		name: "Mandervillous Weapon",
		type: "checklist",
		icon: ICONS.PLACEHOLDER,
		itemId: 40932, // Mandervillous Falchion (PLD)
		qty: 1,
		tip: "Turn in 3 Cosmic Crystallites and your Majestic weapon to the House Manderville Artisan and pick your substats — the final Endwalker relic!",
		tooltip: [
			"Two substats at 306, one at 72",
			"Substats can be changed later for 1 Cosmic Crystallite",
			"Checking a job here marks all of its earlier stages done",
		],
		options: [{ label: "Quest Complete", cost: 0, currency: "" }],
	},
];

// Manderville weapon at each stage, per job: Manderville, Amazing, Majestic,
// Mandervillous.
// Item IDs for XIVAPI icons, used for the stage checks and the job buttons.
const STAGE_WEAPON_IDS = {
	PLD: [38400, 39144, 39920, 40932], // Manderville Sword → Mandervillous Falchion
	WAR: [38402, 39146, 39922, 40934], // Manderville Axe → Mandervillous Battleaxe
	DRK: [38406, 39150, 39926, 40938], // Manderville Zweihander → Mandervillous Greatsword
	GNB: [38415, 39159, 39935, 40947], // Manderville Gunblade → Mandervillous Gunblade
	WHM: [38408, 39152, 39928, 40940], // Manderville Cane → Mandervillous Cane
	SCH: [38411, 39155, 39931, 40943], // Manderville Codex → Mandervillous Codex
	AST: [38412, 39156, 39932, 40944], // Manderville Torquetum → Mandervillous Torquetum
	SGE: [38417, 39161, 39937, 40949], // Manderville Milpreves → Mandervillous Wings
	MNK: [38401, 39145, 39921, 40933], // Manderville Knuckles → Mandervillous Fists
	DRG: [38403, 39147, 39923, 40935], // Manderville Spear → Mandervillous Trident
	NIN: [38405, 39149, 39925, 40937], // Manderville Knives → Mandervillous Knives
	SAM: [38413, 39157, 39933, 40945], // Manderville Samurai Blade → Mandervillous Samurai Blade
	RPR: [38418, 39162, 39938, 40950], // Manderville Scythe → Mandervillous Zaghnal
	BRD: [38404, 39148, 39924, 40936], // Manderville Harp Bow → Mandervillous Compound Bow
	MCH: [38407, 39151, 39927, 40939], // Manderville Revolver → Mandervillous Revolver
	DNC: [38416, 39160, 39936, 40948], // Manderville Chakrams → Mandervillous Chakrams
	BLM: [38409, 39153, 39929, 40941], // Manderville Rod → Mandervillous Rod
	SMN: [38410, 39154, 39930, 40942], // Manderville Index → Mandervillous Index
	RDM: [38414, 39158, 39934, 40946], // Manderville Rapier → Mandervillous Rapier
};

// 19 jobs eligible for the Manderville weapon line: every combat job that
// existed during Endwalker. Viper and Pictomancer launched in Dawntrail (7.0),
// after this relic line, so neither one has a Manderville weapon.
const JOBS = [
	{ id: "PLD", label: "Paladin", role: "tank" },
	{ id: "WAR", label: "Warrior", role: "tank" },
	{ id: "DRK", label: "Dark Knight", role: "tank" },
	{ id: "GNB", label: "Gunbreaker", role: "tank" },
	{ id: "WHM", label: "White Mage", role: "healer" },
	{ id: "SCH", label: "Scholar", role: "healer" },
	{ id: "AST", label: "Astrologian", role: "healer" },
	{ id: "SGE", label: "Sage", role: "healer" },
	{ id: "MNK", label: "Monk", role: "dps" },
	{ id: "DRG", label: "Dragoon", role: "dps" },
	{ id: "NIN", label: "Ninja", role: "dps" },
	{ id: "SAM", label: "Samurai", role: "dps" },
	{ id: "RPR", label: "Reaper", role: "dps" },
	{ id: "BRD", label: "Bard", role: "dps" },
	{ id: "MCH", label: "Machinist", role: "dps" },
	{ id: "DNC", label: "Dancer", role: "dps" },
	{ id: "BLM", label: "Black Mage", role: "dps" },
	{ id: "SMN", label: "Summoner", role: "dps" },
	{ id: "RDM", label: "Red Mage", role: "dps" },
];

const STAGE_INFO = {
	"1. Manderville (i615)": "Needs Endwalker MSQ and the Hildibrand questline through 'The Imperfect Gentleman'. 3 Manderium Meteorites (1,500 Poetics) per weapon.",
	"2. Amazing Manderville (i630)": "Continue the Somehow Further Hildibrand Adventures. 3 Complementary Chondrites (1,500 Poetics) per weapon.",
	"3. Majestic Manderville (i645)": "Continue the Hildibrand story. 3 Amplifying Achondrites (1,500 Poetics) per weapon, and you choose the substats.",
	"4. Mandervillous (i665)": "Finish the Hildibrand story (includes the trial 'The Gilded Araya'). 3 Cosmic Crystallites (1,500 Poetics) per weapon.",
};
