// CONFIG: Defines the strict order of stages for the table
const STAGE_ORDER = [
	"1. Manderville (i615)",
	"2. Amazing Manderville (i630)",
	"3. Majestic Manderville (i645)",
	"4. Mandervillous (i665)",
];

document.addEventListener("alpine:init", () => {
	Alpine.data("mandervilleApp", () => ({
		// Data Sources
		items: MANDERVILLE_DATA,
		availableJobs: JOBS,
		stageInfo: STAGE_INFO,

		// Job ID -> Mandervillous weapon icon URL (filled from XIVAPI)
		weaponIcons: {},

		// State
		selectedJobs: [],
		inventory: {},
		showJobSelector: false,

		// --- 1. INITIALIZATION ---
		init() {
			// Official game icons via XIVAPI; local PNGs stay as the fallback.
			if (typeof XivIcons !== "undefined") {
				XivIcons.hydrateItems(this.items, ICON_ITEM_IDS);
				XivIcons.hydrateDom();
				XivIcons.hydrate(
					Object.keys(WEAPON_ITEM_IDS).map((jobId) => ({
						ref: WEAPON_ITEM_IDS[jobId],
						apply: (url) => {
							this.weaponIcons[jobId] = url;
						},
					})),
				);
			}

			// Load Inventory
			try {
				const sInv = localStorage.getItem("manderville_inventory");
				if (sInv) this.inventory = JSON.parse(sInv);
			} catch (e) {
				// Only clear this tracker's own corrupted key — never the whole
				// origin's localStorage, since the other trackers' saves live
				// there too.
				localStorage.removeItem("manderville_inventory");
			}

			// Load Selected Jobs
			try {
				const sJobs = localStorage.getItem("manderville_jobs");
				if (sJobs) {
					this.selectedJobs = JSON.parse(sJobs);
				} else {
					this.selectedJobs = ["PLD"]; // Default
				}
			} catch (e) {
				this.selectedJobs = ["PLD"];
			}

			// Initialize safe defaults
			this.items.forEach((item) => {
				if (this.inventory[item.id] === undefined) {
					this.inventory[item.id] = item.type === "checklist" ? [] : "";
				} else if (
					item.type === "checklist" &&
					!Array.isArray(this.inventory[item.id])
				) {
					this.inventory[item.id] = [];
				}
			});

			// Watchers for Auto-Save
			this.$watch("selectedJobs", (v) =>
				localStorage.setItem("manderville_jobs", JSON.stringify(v)),
			);
			this.$watch(
				"inventory",
				(v) => localStorage.setItem("manderville_inventory", JSON.stringify(v)),
				{ deep: true },
			);
		},

		// --- 2. HELPERS ---

		get weaponCount() {
			return this.selectedJobs.length || 1;
		},

		getGoal(item) {
			return item.qty * this.weaponCount;
		},

		getOwned(item) {
			if (item.type === "checklist") {
				return Array.isArray(this.inventory[item.id])
					? this.inventory[item.id].length
					: 0;
			}
			return parseInt(this.inventory[item.id]) || 0;
		},

		getRemaining(item) {
			return Math.max(0, this.getGoal(item) - this.getOwned(item));
		},

		getStageProgress(stageName) {
			const group = this.items.filter((i) => i.stage === stageName);
			if (!group.length) return 0;

			let totalNeeded = 0;
			let totalOwned = 0;

			group.forEach((item) => {
				const goal = this.getGoal(item);
				const owned = Math.min(this.getOwned(item), goal);
				totalNeeded += goal;
				totalOwned += owned;
			});

			if (totalNeeded === 0) return 100;
			return Math.floor((totalOwned / totalNeeded) * 100);
		},

		// --- 3. UI & GROUPING ---

		getTotalProgress() {
			let totalNeeded = 0;
			let totalOwned = 0;

			this.items.forEach((item) => {
				const goal = this.getGoal(item);
				const owned = Math.min(this.getOwned(item), goal);
				totalNeeded += goal;
				totalOwned += owned;
			});

			if (totalNeeded === 0) return 0;
			return Math.floor((totalOwned / totalNeeded) * 100);
		},

		resetAll() {
			if (confirm("Are you sure you want to clear all inventory data?")) {
				this.inventory = {};
				this.selectedJobs = ["PLD"];
				this.items.forEach((item) => {
					this.inventory[item.id] = item.type === "checklist" ? [] : "";
				});
				localStorage.removeItem("manderville_inventory");
				localStorage.removeItem("manderville_jobs");
			}
		},

		groupedItems() {
			const groups = [];
			this.items.forEach((item) => {
				const stageName = item.stage || "Unknown";
				let group = groups.find((g) => g.name === stageName);
				if (!group) {
					group = { name: stageName, items: [] };
					groups.push(group);
				}
				group.items.push(item);
			});

			return groups.sort((a, b) => {
				const indexA = STAGE_ORDER.indexOf(a.name);
				const indexB = STAGE_ORDER.indexOf(b.name);
				if (indexA === -1) return 1;
				if (indexB === -1) return -1;
				return indexA - indexB;
			});
		},

		getTotalLiability(currencyName) {
			let total = 0;
			this.items.forEach((item) => {
				const remaining = this.getRemaining(item);
				if (remaining > 0) {
					const option = item.options.find(
						(o) =>
							o.currency === currencyName || o.label.includes(currencyName),
					);

					if (option && option.cost > 0) {
						const yieldPerTrade = item.yield || 1;
						const tradesNeeded = Math.ceil(remaining / yieldPerTrade);
						total += tradesNeeded * option.cost;
					}
				}
			});
			return total;
		},

		handleMissingIcon(event) {
			event.target.onerror = null;
			event.target.src = "./images/icons/placeholder.png";
		},

		// --- 4. JOB COMPLETION TRACKING ---
		toggleCompleteJob(jobId, isComplete) {
			this.items.forEach((item) => {
				// skip the completion flag itself
				if (item.id === "mandervillous_complete") return;

				if (item.type === "checklist") {
					if (!Array.isArray(this.inventory[item.id]))
						this.inventory[item.id] = [];

					if (isComplete) {
						if (!this.inventory[item.id].includes(jobId)) {
							this.inventory[item.id].push(jobId);
						}
					} else {
						this.inventory[item.id] = this.inventory[item.id].filter(
							(id) => id !== jobId,
						);
					}
				} else {
					let current = parseInt(this.inventory[item.id]);
					if (isNaN(current)) current = 0;

					if (isComplete) {
						this.inventory[item.id] = current + item.qty;
					} else {
						this.inventory[item.id] = Math.max(0, current - item.qty);
					}
				}
			});
		},

		// Finished-weapon icon for a job, or its job icon until XIVAPI answers.
		weaponIcon(jobId) {
			return this.weaponIcons[jobId] || "./images/jobs/" + jobId + ".png";
		},

		isJobComplete(jobId) {
			return (
				Array.isArray(this.inventory["mandervillous_complete"]) &&
				this.inventory["mandervillous_complete"].includes(jobId)
			);
		},

		toggleJob(jobId) {
			// If the job is complete (purple), ignore the click entirely.
			if (this.isJobComplete(jobId)) return;

			if (this.selectedJobs.includes(jobId)) {
				this.selectedJobs = this.selectedJobs.filter((id) => id !== jobId);
			} else {
				this.selectedJobs.push(jobId);
			}
		},
	}));
});
