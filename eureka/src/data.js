// Global Icon Constants
const ICONS = {
	PLACEHOLDER: "./images/icons/placeholder.png",
};

// In-game item IDs for shared icons, used by assets/xivapi-icons.js to load
// the official icon from XIVAPI (the local PNG above stays as the fallback).
// Individual materials carry their own `itemId` on the data entry instead.
const ICON_ITEM_IDS = {};

// Sources verified against Console Games Wiki's Eurekan Weapons stage table
// (fine-grained per-substage breakdown) cross-checked against Eorzean
// Tavern's Eureka Weapons guide (per-tier cumulative totals), Sept 2026.
// Both sources agree on cumulative material totals per tier (1,300 Protean
// Crystal, 31 Frosted Protean Crystal, 650 Pyros Crystal, 350 Hydatos
// Crystal), which is what's tracked here rather than every individual
// sub-stage (Starter/Starter+1/Starter+2/etc), since the interactive
// tracker sums them the same way either way.
const EUREKA_DATA = [
	// --- STAGE 1: Antiquated (i290) ---
	{
		id: "base_relic",
		stage: "1. Antiquated (i290)",
		name: "Antiquated Weapon",
		type: "checklist",
		icon: "./images/icons/relic.png",
		qty: 1,
		tip: "Reward from your level 70 job quest, or purchased from the Calamity Salvager (Idyllshire) if you missed it.",
		options: [{ label: "Quest Complete / Purchase", cost: 0, currency: "" }],
	},

	// --- STAGE 2: Anemos (i355) ---
	{
		id: "protean_crystal",
		stage: "2. Anemos (i355)",
		name: "Protean Crystal",
		type: "item",
		icon: "./images/icons/protean-crystal.png",
		itemId: 21801,
		qty: 1300,
		tip: "Dropped by Notorious Monsters in Eureka Anemos. Accumulates across the Starter, Starter+1, Starter+2, and Anemos upgrade turn-ins.",
		options: [{ label: "NM Kills", cost: 0, currency: "" }],
	},
	{
		id: "pazuzus_feather",
		stage: "2. Anemos (i355)",
		name: "Pazuzu's Feather",
		type: "item",
		icon: "./images/icons/pazuzus-feather.png",
		itemId: 21802,
		qty: 3,
		tip: "Dropped from the 'Wail in the Willows' FATE in Eureka Anemos.",
		options: [{ label: "FATE Drop", cost: 0, currency: "" }],
	},

	// --- STAGE 3: Pagos (i370) ---
	{
		id: "frosted_protean_crystal",
		stage: "3. Pagos (i370)",
		name: "Frosted Protean Crystal",
		type: "item",
		icon: "./images/icons/frosted-protean-crystal.png",
		itemId: 23309,
		qty: 31,
		tip: "Collected via vitiated-aether gathering and higher-level Notorious Monster kills in Eureka Pagos. Accumulates across the Pagos and Pagos+1 turn-ins.",
		options: [{ label: "Gathering / NM Kills", cost: 0, currency: "" }],
	},
	{
		id: "pagos_crystal",
		stage: "3. Pagos (i370)",
		name: "Pagos Crystal",
		type: "item",
		icon: "./images/icons/pagos-crystal.png",
		itemId: 22976,
		qty: 500,
		tip: "Dropped by higher-level Notorious Monsters in Eureka Pagos.",
		options: [{ label: "NM Kills", cost: 0, currency: "" }],
	},
	{
		id: "louhis_ice",
		stage: "3. Pagos (i370)",
		name: "Louhi's Ice",
		type: "item",
		icon: "./images/icons/louhis-ice.png",
		itemId: 22975,
		qty: 5,
		tip: "Dropped from the 'Louhi on Ice' FATE in Eureka Pagos.",
		options: [{ label: "FATE Drop", cost: 0, currency: "" }],
	},

	// --- STAGE 4: Pyros (i385) ---
	{
		id: "pyros_crystal",
		stage: "4. Pyros (i385)",
		name: "Pyros Crystal",
		type: "item",
		icon: "./images/icons/pyros-crystal.png",
		itemId: 24124,
		qty: 650,
		tip: "Earned through combat and gathering in Eureka Pyros. Accumulates across the Elemental, Elemental+1, Elemental+2, and Pyros turn-ins.",
		options: [{ label: "Combat / Gathering", cost: 0, currency: "" }],
	},
	{
		id: "penthesileas_flame",
		stage: "4. Pyros (i385)",
		name: "Penthesilea's Flame",
		type: "item",
		icon: "./images/icons/penthesileas-flame.png",
		itemId: 24123,
		qty: 5,
		tip: "Dropped from the Penthesilea notorious-monster encounter in Eureka Pyros.",
		options: [{ label: "NM Drop", cost: 0, currency: "" }],
	},
	{
		id: "logos_actions",
		stage: "4. Pyros (i385)",
		name: "Logos Actions Unlocked",
		type: "item",
		icon: "./images/icons/logos.png",
		qty: 30,
		tip: "Unique Logos Actions found in notebooks scattered through Eureka Pyros. The required count grows across the Elemental+1, Elemental+2, and Pyros turn-ins.",
		options: [{ label: "Notebook Pickup", cost: 0, currency: "" }],
	},

	// --- STAGE 5: Hydatos (i405 base) ---
	{
		id: "hydatos_crystal",
		stage: "5. Hydatos (i405)",
		name: "Hydatos Crystal",
		type: "item",
		icon: "./images/icons/hydatos-crystal.png",
		itemId: 24807,
		qty: 350,
		tip: "Dropped by Notorious Monsters in Eureka Hydatos. Accumulates across the Hydatos, Hydatos+1, Base Eureka, and Eureka turn-ins.",
		options: [{ label: "NM Kills", cost: 0, currency: "" }],
	},
	{
		id: "crystalline_scale",
		stage: "5. Hydatos (i405)",
		name: "Crystalline Scale",
		type: "item",
		icon: "./images/icons/crystalline-scale.png",
		itemId: 24806,
		qty: 5,
		tip: "Dropped from the 'Crystalline Provenance' FATE in Eureka Hydatos.",
		options: [{ label: "FATE Drop", cost: 0, currency: "" }],
	},

	// --- STAGE 6: Physeos (i405, final) ---
	{
		id: "eureka_fragment",
		stage: "6. Physeos (i405)",
		name: "Eureka Fragment",
		type: "item",
		icon: "./images/icons/eureka-fragment.png",
		itemId: 24808,
		qty: 100,
		tip: "Earned from Notorious Monster kills and Elemental Level milestones. Spent filling out the Magia Board, which unlocks bonus elemental stats usable only inside Eureka zones.",
		options: [{ label: "NM Kills / Elemental Levels", cost: 0, currency: "" }],
	},
	{
		// THIS ID MUST MATCH THE HTML LOGIC ('physeos_complete')
		id: "physeos_complete",
		stage: "6. Physeos (i405)",
		name: "Physeos Weapon",
		type: "checklist",
		icon: "./images/icons/physeos.png",
		qty: 1,
		tip: "Fill enough Magia Board nodes with Eureka Fragments and turn in to Gerolt to finish your Physeos-stage weapon — the final upgrade to the Eurekan relic!",
		tooltip: [
			"Spend Eureka Fragments to fill Magia Board nodes",
			"Magia Board bonuses only apply inside Eureka zones",
			"Turn in to Gerolt for the finished Physeos weapon",
		],
		options: [{ label: "Quest Complete", cost: 0, currency: "" }],
	},
];

// 15 jobs eligible for the Eurekan relic weapon line: every job that existed
// during Stormblood (the ARR/Heavensward roster plus Samurai and Red Mage,
// both added at Stormblood's 4.0 launch). Gunbreaker and Dancer launched in
// Shadowbringers (5.0), after this relic line had already been retired, so
// neither one has a Eurekan weapon.
const JOBS = [
	{ id: "PLD", label: "Paladin", role: "tank" },
	{ id: "WAR", label: "Warrior", role: "tank" },
	{ id: "DRK", label: "Dark Knight", role: "tank" },
	{ id: "WHM", label: "White Mage", role: "healer" },
	{ id: "SCH", label: "Scholar", role: "healer" },
	{ id: "AST", label: "Astrologian", role: "healer" },
	{ id: "MNK", label: "Monk", role: "dps" },
	{ id: "DRG", label: "Dragoon", role: "dps" },
	{ id: "NIN", label: "Ninja", role: "dps" },
	{ id: "SAM", label: "Samurai", role: "dps" },
	{ id: "BRD", label: "Bard", role: "dps" },
	{ id: "MCH", label: "Machinist", role: "dps" },
	{ id: "BLM", label: "Black Mage", role: "dps" },
	{ id: "SMN", label: "Summoner", role: "dps" },
	{ id: "RDM", label: "Red Mage", role: "dps" },
];

const STAGE_INFO = {
	"1. Antiquated (i290)": "Your level 70 job quest weapon, or bought from the Calamity Salvager.",
	"2. Anemos (i355)": "1,300 Protean Crystals from Eureka Anemos NMs, plus 3 Pazuzu's Feathers.",
	"3. Pagos (i370)": "31 Frosted Protean Crystals, 500 Pagos Crystals, and 5 Louhi's Ice from Eureka Pagos.",
	"4. Pyros (i385)": "650 Pyros Crystals, 5 Penthesilea's Flames, and 30 Logos Actions from Eureka Pyros.",
	"5. Hydatos (i405)": "350 Hydatos Crystals and 5 Crystalline Scales from Eureka Hydatos.",
	"6. Physeos (i405)": "Fill the Magia Board with 100 Eureka Fragments for the final elemental-stat upgrade.",
};
