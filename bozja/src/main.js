// CONFIG: Defines the strict order of stages for the table
const STAGE_ORDER = [
	"1. Resistance (i485)",
	"2. Augmented Resistance (i500)",
	"3. Recollection (i500)",
	"4. Law's Order (i510)",
	"5. Augmented Law's Order (i515)",
	"6. Blade's Weapon (i535)",
	"7. Victory",
];

// localStorage keys are "<prefix>_inventory", "<prefix>_jobs", "<prefix>_job_stage".
const STORAGE_PREFIX = "bozja";

// The checklist item that marks a whole weapon as finished. Its per-job boxes
// set that job to the final stage instead of storing anything in inventory.
const COMPLETION_ID = "resistance_trials";

document.addEventListener("alpine:init", () => {
	Alpine.data("bozjaApp", () => ({
		// Data Sources
		items: BOZJA_DATA,
		availableJobs: JOBS,
		stageInfo: STAGE_INFO,

		// State
		selectedJobs: [],
		inventory: {},
		showJobSelector: false,
		// jobStage: highest stage (0..stageCount) each job's weapon has reached.
		// stageCount = weapon complete.
		jobStage: {},
		// "JOB_n" -> icon URL of that job's weapon at stage n (filled from XIVAPI)
		stageIcons: {},

		// --- 1. INITIALIZATION ---
		init() {
			// Official game icons via XIVAPI (placeholder until they load).
			if (typeof XivIcons !== "undefined") {
				XivIcons.hydrateItems(this.items, ICON_ITEM_IDS);
				XivIcons.hydrateDom();
				const refs = [];
				Object.keys(STAGE_WEAPON_IDS).forEach((jobId) => {
					STAGE_WEAPON_IDS[jobId].forEach((itemId, i) => {
						refs.push({
							ref: itemId,
							apply: (url) => {
								this.stageIcons[jobId + "_" + (i + 1)] = url;
							},
						});
					});
				});
				XivIcons.hydrate(refs);
			}

			// Load Inventory
			try {
				const sInv = localStorage.getItem(STORAGE_PREFIX + "_inventory");
				if (sInv) this.inventory = JSON.parse(sInv);
			} catch (e) {
				// Only clear this tracker's own corrupted key — never the whole
				// origin's localStorage, since the other trackers' saves live
				// there too.
				localStorage.removeItem(STORAGE_PREFIX + "_inventory");
			}

			// Load Selected Jobs
			try {
				const sJobs = localStorage.getItem(STORAGE_PREFIX + "_jobs");
				if (sJobs) {
					this.selectedJobs = JSON.parse(sJobs);
				} else {
					this.selectedJobs = ["PLD"]; // Default
				}
			} catch (e) {
				this.selectedJobs = ["PLD"];
			}

			// Load Stage Progress
			let hasStageSave = false;
			try {
				const sStage = localStorage.getItem(STORAGE_PREFIX + "_job_stage");
				if (sStage) {
					this.jobStage = JSON.parse(sStage) || {};
					hasStageSave = true;
				}
			} catch (e) {
				this.jobStage = {};
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

			if (!hasStageSave) this.migrateCompletedJobs();

			// Watchers for Auto-Save
			this.$watch("selectedJobs", (v) =>
				localStorage.setItem(STORAGE_PREFIX + "_jobs", JSON.stringify(v)),
			);
			this.$watch(
				"inventory",
				(v) =>
					localStorage.setItem(STORAGE_PREFIX + "_inventory", JSON.stringify(v)),
				{ deep: true },
			);
			this.$watch(
				"jobStage",
				(v) =>
					localStorage.setItem(STORAGE_PREFIX + "_job_stage", JSON.stringify(v)),
				{ deep: true },
			);
		},

		// Older saves marked finished weapons by ticking the completion checklist,
		// which also added each item's quantity to every input box. Move those jobs
		// to the final stage and take the added quantities back out, since a job
		// past a stage now drops out of that stage's goal instead.
		migrateCompletedJobs() {
			const done = this.inventory[COMPLETION_ID];
			if (!Array.isArray(done) || !done.length) {
				localStorage.setItem(STORAGE_PREFIX + "_job_stage", "{}");
				return;
			}
			const last = this.stageCount;
			done.forEach((jobId) => {
				this.jobStage[jobId] = last;
				this.items.forEach((item) => {
					if (item.type === "checklist") return;
					const current = parseInt(this.inventory[item.id]) || 0;
					const left = Math.max(0, current - item.qty);
					this.inventory[item.id] = left > 0 ? left : "";
				});
			});
			this.inventory[COMPLETION_ID] = [];
			localStorage.setItem(STORAGE_PREFIX + "_inventory", JSON.stringify(this.inventory));
			localStorage.setItem(STORAGE_PREFIX + "_job_stage", JSON.stringify(this.jobStage));
		},

		// --- 2. STAGES ---

		// Stages that actually have items, in order.
		get stageList() {
			return STAGE_ORDER.filter((s) => this.items.some((i) => i.stage === s));
		},

		get stageCount() {
			return this.stageList.length;
		},

		stageNumber(stageName) {
			return this.stageList.indexOf(stageName) + 1;
		},

		// The stage holding the completion item gets no separate stage row —
		// the completion item's own boxes are that row.
		isCompletionStage(stageName) {
			return this.items.some((i) => i.id === COMPLETION_ID && i.stage === stageName);
		},

		getJobStage(jobId) {
			return this.jobStage[jobId] || 0;
		},

		// Checking stage n sets the job to n (implies stages 1..n).
		// Unchecking stage n drops the job to n-1.
		toggleJobStage(jobId, n) {
			const next = this.getJobStage(jobId) >= n ? n - 1 : n;
			this.jobStage = { ...this.jobStage, [jobId]: next };
		},

		// Selected jobs (or the PLD default) that still have stage n ahead of them.
		jobsNeedingStage(n) {
			const jobs = this.selectedJobs.length ? this.selectedJobs : ["PLD"];
			return jobs.filter((id) => this.getJobStage(id) < n);
		},

		// Jobs shown as boxes on a checklist item: every selected job for the
		// completion item, otherwise only jobs that haven't passed its stage yet.
		checklistJobs(item) {
			if (item.id === COMPLETION_ID) return this.selectedJobs;
			const n = this.stageNumber(item.stage);
			return this.selectedJobs.filter((id) => this.getJobStage(id) < n);
		},

		isChecked(item, jobId) {
			if (item.id === COMPLETION_ID) return this.isJobComplete(jobId);
			const list = this.inventory[item.id];
			return Array.isArray(list) && list.includes(jobId);
		},

		toggleChecked(item, jobId) {
			if (item.id === COMPLETION_ID) {
				this.toggleJobStage(jobId, this.stageCount);
				return;
			}
			const list = Array.isArray(this.inventory[item.id]) ? this.inventory[item.id] : [];
			this.inventory[item.id] = list.includes(jobId)
				? list.filter((id) => id !== jobId)
				: [...list, jobId];
		},

		// --- 3. HELPERS ---

		get weaponCount() {
			return this.selectedJobs.length || 1;
		},

		getGoal(item) {
			return item.qty * this.jobsNeedingStage(this.stageNumber(item.stage)).length;
		},

		getOwned(item) {
			if (item.type === "checklist") {
				if (item.id === COMPLETION_ID) return 0;
				const list = Array.isArray(this.inventory[item.id])
					? this.inventory[item.id]
					: [];
				return this.jobsNeedingStage(this.stageNumber(item.stage)).filter((id) =>
					list.includes(id),
				).length;
			}
			return Math.max(0, parseInt(this.inventory[item.id]) || 0);
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

		// --- 4. UI & GROUPING ---

		getTotalProgress() {
			let totalNeeded = 0;
			let totalOwned = 0;

			this.items.forEach((item) => {
				const goal = this.getGoal(item);
				const owned = Math.min(this.getOwned(item), goal);
				totalNeeded += goal;
				totalOwned += owned;
			});

			if (totalNeeded === 0) return 100;
			return Math.floor((totalOwned / totalNeeded) * 100);
		},

		resetAll() {
			if (confirm("Are you sure you want to clear all inventory data?")) {
				this.inventory = {};
				this.selectedJobs = ["PLD"];
				this.jobStage = {};
				this.items.forEach((item) => {
					this.inventory[item.id] = item.type === "checklist" ? [] : "";
				});
				localStorage.removeItem(STORAGE_PREFIX + "_inventory");
				localStorage.removeItem(STORAGE_PREFIX + "_jobs");
				localStorage.setItem(STORAGE_PREFIX + "_job_stage", "{}");
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
						// If the item has a 'yield' property (like Crystal Sand yielding 2), calculate how many trades are needed.
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
			event.target.src = "../assets/placeholder.png";
		},

		// --- 5. JOB COMPLETION ---

		// The weapon a job holds at stage n, or its job icon until XIVAPI answers.
		stageIcon(jobId, n) {
			return this.stageIcons[jobId + "_" + n] || "./images/jobs/" + jobId + ".png";
		},

		// Job button: the weapon at the job's current stage, or the job icon at stage 0.
		jobChipIcon(jobId) {
			const st = this.getJobStage(jobId);
			return st > 0 ? this.stageIcon(jobId, st) : "./images/jobs/" + jobId + ".png";
		},

		// The finished weapon.
		weaponIcon(jobId) {
			return this.stageIcon(jobId, this.stageCount);
		},

		isJobComplete(jobId) {
			return this.getJobStage(jobId) >= this.stageCount;
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
