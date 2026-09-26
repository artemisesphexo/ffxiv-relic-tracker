// Global Icon Constants
const ICONS = {
	POETICS: "./images/icons/poetics.png",
	GC_SEALS: "./images/icons/gc-seals.png",
	GIL: "./images/icons/gil.png",
	ALLIED_SEALS: "./images/icons/allied-seals.png",
	PURPLE_SCRIPS: "./images/icons/purple-scrips.png",
	AMBER_VILEKIN: "./images/icons/amber-vilekin.png",
	MOONSTONE: "./images/icons/moonstone.png",
	DUNGEON: "./images/icons/dungeon.png",
	REPEATQUEST: "./images/icons/repeat-quest.png",
	SCRIP: "./images/icons/scrip-token.png",
	TRIAL: "./images/icons/trials.png",
	FATE: "./images/icons/fate.png",

	// Tribe Tokens
	AMALJAA: "./images/icons/amaljaa-token.png",
	SAHAGIN: "./images/icons/sahagin_token.png",
	KOBOLD: "./images/icons/kobold-token.png",
	SYLPH: "./images/icons/sylph-token.png",
	VANU: "./images/icons/vanu-token.png",
	VATH: "./images/icons/vath-token.png",
	MOOGLE: "./images/icons/moogle-token.png",

	// Alexander Precision Parts
	A1_BOLT: "./images/icons/precision-gordian-bolt.png",
	A2_LENS: "./images/icons/precision-gordian-lens.png",
	A3_SHAFT: "./images/icons/precision-gordian-shaft.png",
	A4_SPRING: "./images/icons/precision-gordian-spring.png",

	PLACEHOLDER: "./images/icons/placeholder.png",
};

// In-game item IDs for shared icons, used by assets/xivapi-icons.js to load
// the official icon from XIVAPI (the local PNG above stays as the fallback).
// Individual materials carry their own `itemId` on the data entry instead.
const ICON_ITEM_IDS = {
	[ICONS.POETICS]: 28, // Allagan Tomestone of Poetics
	[ICONS.GC_SEALS]: 20, // Storm Seal
	[ICONS.GIL]: 1,
	[ICONS.ALLIED_SEALS]: 27,
	[ICONS.SCRIP]: 12839, // Blue Crafters' Scrip Token
	[ICONS.AMBER_VILEKIN]: 12236, // Amber-encased Vilekin
	[ICONS.MOONSTONE]: 10124,
	[ICONS.AMALJAA]: 21076, // Steel Amalj'ok
	[ICONS.SAHAGIN]: 21077, // Rainbowtide Psashp
	[ICONS.KOBOLD]: 21078, // Titan Cobaltpiece
	[ICONS.SYLPH]: 21075, // Sylphic Goldleaf
	[ICONS.VANU]: 21074, // Vanu Whitebone
	[ICONS.VATH]: 21079, // Black Copper Gil
	[ICONS.MOOGLE]: 21080, // Carved Kupo Nut
	[ICONS.A1_BOLT]: 13581, // Precision Gordian Bolt
	[ICONS.A2_LENS]: 13583, // Precision Gordian Lens
	[ICONS.A3_SHAFT]: 13587, // Precision Gordian Shaft
	[ICONS.A4_SPRING]: 13585, // Precision Gordian Spring
};

const ANIMA_DATA = [
	// --- STAGE 1: Animated (i170) ---
	{
		id: "crystals_wind",
		stage: "1. Animated (i170)",
		name: "Luminous Crystal (Wind)",
		type: "item",
		icon: "./images/icons/luminous-wind.png",
		itemId: 13570,
		qty: 1,
		tip: "FATEs in Churning Mists. Drop rate is approx 10%.",
		options: [
			{
				label: "FATE (Churning Mists)",
				cost: 0,
				currency: "",
				icon: ICONS.FATE,
			},
		],
	},
	{
		id: "crystals_fire",
		stage: "1. Animated (i170)",
		name: "Luminous Crystal (Fire)",
		type: "item",
		icon: "./images/icons/luminous-fire.png",
		itemId: 13571,
		qty: 1,
		tip: "FATEs in Azys Lla.",
		options: [
			{ label: "FATE (Azys Lla)", cost: 0, currency: "", icon: ICONS.FATE },
		],
	},
	{
		id: "crystals_light",
		stage: "1. Animated (i170)",
		name: "Luminous Crystal (Lightning)",
		type: "item",
		icon: "./images/icons/luminous-lightning.png",
		itemId: 13573,
		qty: 1,
		tip: "FATEs in Dravanian Forelands.",
		options: [
			{
				label: "FATE (Dravanian Forelands)",
				cost: 0,
				currency: "",
				icon: ICONS.FATE,
			},
		],
	},
	{
		id: "crystals_ice",
		stage: "1. Animated (i170)",
		name: "Luminous Crystal (Ice)",
		type: "item",
		icon: "./images/icons/luminous-ice.png",
		itemId: 13569,
		qty: 1,
		tip: "FATEs in Coerthas Western Highlands.",
		options: [
			{
				label: "FATE (Coerthas Western)",
				cost: 0,
				currency: "",
				icon: ICONS.FATE,
			},
		],
	},
	{
		id: "crystals_earth",
		stage: "1. Animated (i170)",
		name: "Luminous Crystal (Earth)",
		type: "item",
		icon: "./images/icons/luminous-earth.png",
		itemId: 13572,
		qty: 1,
		tip: "FATEs in Dravanian Hinterlands.",
		options: [
			{
				label: "FATE (Dravanian Hinterlands)",
				cost: 0,
				currency: "",
				icon: ICONS.FATE,
			},
		],
	},
	{
		id: "crystals_water",
		stage: "1. Animated (i170)",
		name: "Luminous Crystal (Water)",
		type: "item",
		icon: "./images/icons/luminous-water.png",
		itemId: 13574,
		qty: 1,
		tip: "FATEs in The Sea of Clouds.",
		options: [
			{
				label: "FATE (Sea of Clouds)",
				cost: 0,
				currency: "",
				icon: ICONS.FATE,
			},
		],
	},

	// --- STAGE 2: Awoken (i200) ---
	{
		id: "dungeon_crawl",
		stage: "2. Awoken (i200)",
		name: "Dungeon Crawl",
		type: "checklist",
		icon: ICONS.DUNGEON,
		qty: 1,
		tip: "Equip your Animated weapon before exiting the dungeon!",
		tooltip: [
			"1. Snowcloak",
			"2. Sastasha (Hard)",
			"3. The Sunken Temple of Qarn (Hard)",
			"4. The Keeper of the Lake",
			"5. The Wanderer's Palace (Hard)",
			"6. Amdapor Keep (Hard)",
			"7. The Dusk Vigil",
			"8. Sohm Al",
			"9. The Aery",
			"10. The Vault",
		],
		options: [{ label: "Duty Complete", cost: 0, currency: "" }],
	},

	// --- STAGE 3: Anima (i210) - Tokens ---
	{
		id: "unid_bone",
		stage: "3. Anima (i210)",
		name: "Unidentifiable Bone",
		type: "item",
		icon: "./images/icons/unid-bone.png",
		itemId: 13582,
		qty: 10,
		tip: "Precision Gordian Bolt drops from Alexander - The Fist of the Father (A1).",
		options: [
			{ label: "Poetics", cost: 150, currency: "Poetics", icon: ICONS.POETICS },
			{
				label: "Amalj'aa Tokens",
				cost: 3,
				currency: "Steel Amalj'ok",
				icon: ICONS.AMALJAA,
			},
			{
				label: "Vanu Vanu Tokens",
				cost: 6,
				currency: "Vanu Whitebone",
				icon: ICONS.VANU,
			},
			{
				label: "Vath Tokens",
				cost: 6,
				currency: "Black Copper Gil",
				icon: ICONS.VATH,
			},
			{
				label: "Moogle Tokens",
				cost: 18,
				currency: "Carved Kupo Nut",
				icon: ICONS.MOOGLE,
			},
			{
				label: "Allied Seals",
				cost: 300,
				currency: "Allied Seals",
				icon: ICONS.ALLIED_SEALS,
			},
			{
				label: "Precision Gordian Bolt",
				cost: 3,
				currency: "Alex P1",
				icon: ICONS.A1_BOLT,
			},
		],
	},
	{
		id: "unid_shell",
		stage: "3. Anima (i210)",
		name: "Unidentifiable Shell",
		type: "item",
		icon: "./images/icons/unid-shell.png",
		itemId: 13584,
		qty: 10,
		tip: "Precision Lens drops from Alexander - The Cuff of the Father (A2) Normal.",
		options: [
			{ label: "Poetics", cost: 150, currency: "Poetics", icon: ICONS.POETICS },
			{
				label: "Sahagin Tokens",
				cost: 3,
				currency: "Sahagin",
				icon: ICONS.SAHAGIN,
			},
			{
				label: "Vanu Vanu Tokens",
				cost: 6,
				currency: "Vanu Whitebone",
				icon: ICONS.VANU,
			},
			{
				label: "Vath Tokens",
				cost: 6,
				currency: "Black Copper Gil",
				icon: ICONS.VATH,
			},
			{
				label: "Moogle Tokens",
				cost: 18,
				currency: "Carved Kupo Nut",
				icon: ICONS.MOOGLE,
			},
			{
				label: " Precision Gordian Lens",
				cost: 3,
				currency: "Alex P2",
				icon: ICONS.A2_LENS,
			},
		],
	},
	{
		id: "unid_ore",
		stage: "3. Anima (i210)",
		name: "Unidentifiable Ore",
		type: "item",
		icon: "./images/icons/unid-ore.png",
		itemId: 13586,
		qty: 10,
		tip: "Precision Shaft drops from Alexander - The Arm of the Father (A3) Normal.",
		options: [
			{ label: "Poetics", cost: 150, currency: "Poetics", icon: ICONS.POETICS },
			{
				label: "Kobold Tokens",
				cost: 3,
				currency: "Kobold",
				icon: ICONS.KOBOLD,
			},
			{
				label: "Vanu Vanu Tokens",
				cost: 6,
				currency: "Vanu Whitebone",
				icon: ICONS.VANU,
			},
			{
				label: "Vath Tokens",
				cost: 6,
				currency: "Black Copper Gil",
				icon: ICONS.VATH,
			},
			{
				label: "Moogle Tokens",
				cost: 18,
				currency: "Carved Kupo Nut",
				icon: ICONS.MOOGLE,
			},
			{
				label: "Precision Gordian Spring",
				cost: 3,
				currency: "Alex P3",
				icon: ICONS.A3_SHAFT,
			},
		],
	},
	{
		id: "unid_seeds",
		stage: "3. Anima (i210)",
		name: "Unidentifiable Seeds",
		type: "item",
		icon: "./images/icons/unid-seeds.png",
		itemId: 13588,
		qty: 10,
		tip: "Precision Spring drops from Alexander Gordias (A4) Normal.",
		options: [
			{ label: "Poetics", cost: 150, currency: "Poetics", icon: ICONS.POETICS },
			{ label: "Sylph Tokens", cost: 3, currency: "Sylph", icon: ICONS.SYLPH },
			{
				label: "Vanu Vanu Tokens",
				cost: 6,
				currency: "Vanu Whitebone",
				icon: ICONS.VANU,
			},
			{
				label: "Vath Tokens",
				cost: 6,
				currency: "Black Copper Gil",
				icon: ICONS.VATH,
			},
			{
				label: "Moogle Tokens",
				cost: 18,
				currency: "Carved Kupo Nut",
				icon: ICONS.MOOGLE,
			},
			{
				label: "Allied Seals",
				cost: 300,
				currency: "Allied Seals",
				icon: ICONS.ALLIED_SEALS,
			},
			{
				label: "Alex P4 (Spring)",
				cost: 3,
				currency: "Alex P4",
				icon: ICONS.A4_SPRING,
			},
		],
	},

	// --- STAGE 3: Anima (i210) - Crafted ---
	{
		id: "francesca",
		stage: "3. Anima (i210)",
		name: "Adamantite Francesca",
		type: "item",
		icon: "./images/icons/francesca.png",
		itemId: 13589,
		qty: 4,
		tip: "Can also be crafted. Refer to crafting log.",
		options: [
			{
				label: "GC Seals",
				cost: 5000,
				currency: "GC Seals",
				icon: ICONS.GC_SEALS,
			},
		],
	},
	{
		id: "mirror",
		stage: "3. Anima (i210)",
		name: "Titanium Alloy Mirror",
		type: "item",
		icon: "./images/icons/mirror.png",
		itemId: 13591,
		qty: 4,
		tip: "Can also be crafted. Refer to crafting log.",
		options: [
			{
				label: "GC Seals",
				cost: 5000,
				currency: "GC Seals",
				icon: ICONS.GC_SEALS,
			},
		],
	},
	{
		id: "arrow",
		stage: "3. Anima (i210)",
		name: "Dispelling Arrow",
		type: "item",
		icon: "./images/icons/arrow.png",
		itemId: 13593,
		qty: 4,
		tip: "Can also be crafted. Refer to crafting log.",
		options: [
			{
				label: "GC Seals",
				cost: 5000,
				currency: "GC Seals",
				icon: ICONS.GC_SEALS,
			},
		],
	},
	{
		id: "kingcake",
		stage: "3. Anima (i210)",
		name: "Kingcake",
		type: "item",
		icon: "./images/icons/kingcake.png",
		itemId: 13595,
		qty: 4,
		tip: "Can also be crafted. Refer to crafting log.",
		options: [
			{
				label: "GC Seals",
				cost: 5000,
				currency: "GC Seals",
				icon: ICONS.GC_SEALS,
			},
		],
	},

	// --- STAGE 4: Hyperconductive (i230) ---
	{
		id: "oil",
		stage: "4. Hyperconductive (i230)",
		name: "Aether Oil",
		type: "item",
		icon: "./images/icons/aether-oil.png",
		itemId: 14899,
		qty: 5,
		tip: "Weekly quest 'The Gift of the Archmagus' gives 1 oil.",
		options: [
			{ label: "Poetics", cost: 350, currency: "Poetics", icon: ICONS.POETICS },
			{
				label: "Weekly CT Quest",
				cost: 0,
				currency: "",
				icon: ICONS.REPEATQUEST,
			},
		],
	},

	// --- STAGE 5: Reconditioned (i240) ---
	{
		id: "umbrite",
		stage: "5. Reconditioned (i240)",
		name: "Umbrite",
		type: "item",
		icon: "./images/icons/umbrite.png",
		itemId: 15840,
		qty: 75,
		tip: "No other way to get this. Pure Poetics dump.",
		options: [
			{
				label: "Poetics Only",
				cost: 75,
				currency: "Poetics",
				icon: ICONS.POETICS,
			},
		],
	},
	{
		id: "sand",
		stage: "5. Reconditioned (i240)",
		name: "Crystal Sand",
		type: "item",
		icon: "./images/icons/crystal-sand.png",
		itemId: 15841,
		qty: 75,
		yield: 2, // Add this property to indicate 1 trade = 2 items
		tip: "Trade items to Ulan. Each trade yields 2 Crystal Sands.",
		options: [
			{
				label: "Blue Crafters' Scrip Token",
				cost: 5, // Actual cost per trade
				currency: "Tokens",
				icon: ICONS.SCRIP,
			},
			{
				label: "Amber Vilekin",
				cost: 1, // Actual cost per trade
				currency: "Items",
				icon: ICONS.AMBER_VILEKIN,
			},
			{
				label: "Moonstones",
				cost: 5, // Actual cost per trade
				currency: "Items",
				icon: ICONS.MOONSTONE,
			},
			{
				label: "Ink + Mist (Poetics)",
				cost: 450, // 5 Ink (225) + 5 Mist (225)
				currency: "Poetics",
				icon: "./images/icons/poetics.png",
			},
		],
	},

	// --- STAGE 6: Sharpened (i260) ---
	{
		id: "clusters",
		stage: "6. Sharpened (i260)",
		name: "Singing Cluster",
		type: "item",
		icon: "./images/icons/singing-clusters.png",
		itemId: 16064,
		qty: 50,
		tip: "Do the Weekly Quest (18 clusters) and Daily Quest (1 cluster) in Idyllshire.",
		options: [
			{ label: "Poetics", cost: 40, currency: "Poetics", icon: ICONS.POETICS },
			{
				label: "Daily/Weekly Quests",
				cost: 0,
				currency: "",
				icon: ICONS.REPEATQUEST,
			},
		],
	},

	// --- STAGE 7: Complete (i270) ---
	{
		id: "pneumite",
		stage: "7. Complete (i270)",
		name: "Pneumite",
		type: "item",
		icon: "./images/icons/pneumite.png",
		itemId: 16933,
		qty: 15,
		tip: "Use GC Seals as they are easier to farm than Poetics.",
		options: [
			{ label: "Poetics", cost: 100, currency: "Poetics", icon: ICONS.POETICS },
			{
				label: "GC Seals",
				cost: 4000,
				currency: "GC Seals",
				icon: ICONS.GC_SEALS,
			},
		],
	},

	// --- STAGE 8/9: The Grand Finale ---
	{
		id: "archaic_ink",
		stage: "8. Lux (i275)",
		name: "Archaic Enchanted Ink",
		type: "number",
		icon: "./images/icons/ink.png",
		itemId: 16934,
		qty: 1,
		tip: "Buy from Hismena (Idyllshire) for 500 Poetics.",
		options: [
			{
				label: "Poetics",
				cost: 500,
				currency: "Poetics",
				icon: "./images/icons/poetics.png",
			},
		],
	},
	{
		// THIS ID MUST MATCH THE HTML LOGIC ('primal_gauntlet')
		id: "primal_gauntlet",
		stage: "8. Lux (i275)",
		name: "Primal Gauntlet (Lux)",
		type: "checklist",
		icon: "./images/icons/trial.png",
		qty: 1,
		tip: "Complete the 12 Trials. Clicking DONE reveals your finished Lux Weapon!",
		tooltip: [
			"1. Ifrit (Hard)",
			"2. Titan (Hard)",
			"3. Garuda (Hard)",
			"4. Mog (Hard)",
			"5. Leviathan (Hard)",
			"6. Ramuh (Hard)",
			"7. Shiva (Hard)",
			"8. Ravana (Hard)",
			"9. Bismarck (Hard)",
			"10. Sephirot",
			"11. Sophia",
			"12. Zurvan",
		],
		options: [{ label: "Duty Complete", cost: 0, currency: "" }],
	},
];

// List of all Jobs available for Anima Weapons
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
	{ id: "BRD", label: "Bard", role: "dps" },
	{ id: "MCH", label: "Machinist", role: "dps" },
	{ id: "BLM", label: "Black Mage", role: "dps" },
	{ id: "SMN", label: "Summoner", role: "dps" },
];

// List of all Jobs available for Anima Weapons
const STAGE_INFO = {
	"1. Animated (i170)": "Farm FATEs in Heavensward zones to get crystals.",
	"2. Awoken (i200)": "Run 10 specific dungeons with your weapon equipped.",
	"3. Anima (i210)":
		"The massive grind. Collect tokens via Poetics, Tribes, or Alex Normal.",
	"4. Hyperconductive (i230)":
		"Collect 5 Aether Oils (Weekly CT quest is best).",
	"5. Reconditioned (i240)": "Feed Crystal Sand & Umbrite to the weapon stats.",
	"6. Sharpened (i260)": "Collect Singing Clusters via Daily/Weekly quests.",
	"7. Complete (i270)": "Run 3 HM Primals and collect 15 Pneumite.",
	"8. Lux (i275)": "The victory lap. Defeat primal pairs and buy the Ink.",
	"9. Victory": "Enjoy your shiny new weapon!",
};
