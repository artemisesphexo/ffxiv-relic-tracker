// CONFIG: Defines the strict order of stages for the table
const STAGE_ORDER = [
	"1. Animated (i170)",
	"2. Awoken (i200)",
	"3. Anima (i210)",
	"4. Hyperconductive (i230)",
	"5. Reconditioned (i240)",
	"6. Sharpened (i260)",
	"7. Complete (i270)",
	"8. Lux (i275)",
	"9. Victory",
];

document.addEventListener("alpine:init", () => {
	Alpine.data("relicApp", () => ({
		// Data Sources
		items: ANIMA_DATA,
		availableJobs: JOBS,
		stageInfo: STAGE_INFO,

		// State
		selectedJobs: [],
		inventory: {},
		showJobSelector: false,

		// --- 1. INITIALIZATION ---
		init() {
			// Load Inventory
			try {
				const sInv = localStorage.getItem("relic_inventory");
				if (sInv) this.inventory = JSON.parse(sInv);
			} catch (e) {
				// Only clear this tracker's own corrupted key — never the whole
				// origin's localStorage, since Phantom and Bozja's saves live there too.
				localStorage.removeItem("relic_inventory");
			}

			// Load Selected Jobs
			try {
				const sJobs = localStorage.getItem("relic_jobs");
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
				localStorage.setItem("relic_jobs", JSON.stringify(v)),
			);
			this.$watch(
				"inventory",
				(v) => localStorage.setItem("relic_inventory", JSON.stringify(v)),
				{ deep: true },
			);
		},

		// --- 2. HELPERS ---

		get weaponCount() {
			return this.selectedJobs.length || 1;
		},

		toggleJob(jobId) {
			if (this.selectedJobs.includes(jobId)) {
				this.selectedJobs = this.selectedJobs.filter((id) => id !== jobId);
			} else {
				this.selectedJobs.push(jobId);
			}
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
				localStorage.removeItem("relic_inventory");
				localStorage.removeItem("relic_jobs");
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
						// If the item has a 'yield' property (like Crystal Sand yielding 2),
						// calculate how many trades are needed. Default to 1 if no yield defined.
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

		// --- 4. NEW LOGIC FOR JOB COMPLETION TRACKING ---
		toggleCompleteJob(jobId, isComplete) {
			this.items.forEach((item) => {
				// skip primal gauntlet itself
				if (item.id === "primal_gauntlet") return;

				if (item.type === "checklist") {
					if (!Array.isArray(this.inventory[item.id]))
						this.inventory[item.id] = [];

					if (isComplete) {
						// add
						if (!this.inventory[item.id].includes(jobId)) {
							this.inventory[item.id].push(jobId);
						}
					} else {
						// remove
						this.inventory[item.id] = this.inventory[item.id].filter(
							(id) => id !== jobId,
						);
					}
				} else {
					// numeric items
					let current = parseInt(this.inventory[item.id]);
					if (isNaN(current)) current = 0;

					if (isComplete) {
						this.inventory[item.id] = current + item.qty;
					} else {
						// subtract, but don't go below 0
						this.inventory[item.id] = Math.max(0, current - item.qty);
					}
				}
			});
		},

		// 1. Helper to check if a job is complete
		isJobComplete(jobId) {
			return (
				Array.isArray(this.inventory["primal_gauntlet"]) &&
				this.inventory["primal_gauntlet"].includes(jobId)
			);
		},

		// 2. Modified toggleJob to ignore clicks on completed jobs
		toggleJob(jobId) {
			// NEW: If the job is complete (purple), ignore the click entirely.
			// "Nothing happens" - as desired.
			if (this.isJobComplete(jobId)) return;

			if (this.selectedJobs.includes(jobId)) {
				this.selectedJobs = this.selectedJobs.filter((id) => id !== jobId);
			} else {
				this.selectedJobs.push(jobId);
			}
		},
	}));
});

