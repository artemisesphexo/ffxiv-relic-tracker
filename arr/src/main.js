// CONFIG: Defines the strict order of stages for the table
const STAGE_ORDER = [
	"1. Relic (i80)",
	"2. Zenith (i90)",
	"3. Atma (i100)",
	"4. Animus (i100)",
	"5. Novus (i110)",
	"6. Nexus (i115)",
	"7. Zodiac Braves (i125)",
	"8. Zodiac Zeta (i135)",
];

document.addEventListener("alpine:init", () => {
	Alpine.data("arrApp", () => ({
		// Data Sources
		items: ARR_DATA,
		availableJobs: JOBS,
		stageInfo: STAGE_INFO,

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
			}

			// Load Inventory
			try {
				const sInv = localStorage.getItem("arr_inventory");
				if (sInv) this.inventory = JSON.parse(sInv);
			} catch (e) {
				// Only clear this tracker's own corrupted key — never the whole
				// origin's localStorage, since Anima, Bozja, and Phantom's saves
				// live there too.
				localStorage.removeItem("arr_inventory");
			}

			// Load Selected Jobs
			try {
				const sJobs = localStorage.getItem("arr_jobs");
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
				localStorage.setItem("arr_jobs", JSON.stringify(v)),
			);
			this.$watch(
				"inventory",
				(v) => localStorage.setItem("arr_inventory", JSON.stringify(v)),
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
				localStorage.removeItem("arr_inventory");
				localStorage.removeItem("arr_jobs");
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
						// If the item has a 'yield' property (like Alexandrite yielding 5
						// per Mysterious Map), calculate how many trades are needed.
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
				if (item.id === "zeta_complete") return;

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

		isJobComplete(jobId) {
			return (
				Array.isArray(this.inventory["zeta_complete"]) &&
				this.inventory["zeta_complete"].includes(jobId)
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
