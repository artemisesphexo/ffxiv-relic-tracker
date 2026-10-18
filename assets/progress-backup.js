/**
 * Progress backup
 * ---------------
 * Lets people move their tracker progress between browsers and devices
 * without an account: export everything to a file or a copyable code,
 * then import it somewhere else.
 *
 * Load it on any page with a plain <script> tag placed AFTER the page's
 * markup (end of <body>). It adds a "Backup" button next to the tracker's
 * Reset button, or above the footer on the hub page. No other wiring needed.
 *
 * Only keys belonging to the trackers are exported (see PREFIXES); the
 * XIVAPI icon cache is skipped. Importing replaces this device's progress
 * for the trackers contained in the backup and leaves the others alone.
 */
(function () {
	"use strict";

	var APP = "ffxiv-relic-tracker";
	var VERSION = 1;
	var CODE_PREFIX = "FRT1:";
	var TRACKERS = {
		arr: "ARR Zodiac",
		anima: "Anima",
		eureka: "Eureka",
		bozja: "Bozja",
		manderville: "Manderville",
		phantom: "Phantom",
	};
	var PREFIXES = Object.keys(TRACKERS).map(function (t) {
		return t + "_";
	});

	// ---- storage ---------------------------------------------------------

	function trackerOf(key) {
		for (var i = 0; i < PREFIXES.length; i++) {
			if (key.indexOf(PREFIXES[i]) === 0) return PREFIXES[i].slice(0, -1);
		}
		return null;
	}

	function collect() {
		var data = {};
		try {
			for (var i = 0; i < localStorage.length; i++) {
				var key = localStorage.key(i);
				if (key && trackerOf(key)) data[key] = localStorage.getItem(key);
			}
		} catch (e) {}
		return data;
	}

	function trackersIn(data) {
		var seen = {};
		Object.keys(data).forEach(function (k) {
			var t = trackerOf(k);
			if (t) seen[t] = true;
		});
		return Object.keys(TRACKERS).filter(function (t) {
			return seen[t];
		});
	}

	function names(list) {
		return list
			.map(function (t) {
				return TRACKERS[t];
			})
			.join(", ");
	}

	// ---- encoding --------------------------------------------------------

	function buildBackup() {
		return {
			app: APP,
			version: VERSION,
			exported: new Date().toISOString(),
			data: collect(),
		};
	}

	function toCode(backup) {
		var bytes = new TextEncoder().encode(JSON.stringify(backup));
		var bin = "";
		for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
		return CODE_PREFIX + btoa(bin);
	}

	/** Accepts a backup code or raw backup JSON; returns a checked backup or throws. */
	function parse(text) {
		text = String(text || "").trim();
		var backup;
		try {
			var json = text;
			if (text.indexOf(CODE_PREFIX) === 0) {
				var bin = atob(text.slice(CODE_PREFIX.length).replace(/\s+/g, ""));
				var bytes = new Uint8Array(bin.length);
				for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
				json = new TextDecoder().decode(bytes);
			}
			backup = JSON.parse(json);
		} catch (e) {
			throw new Error("the code is incomplete or not a backup code");
		}
		if (!backup || backup.app !== APP || typeof backup.data !== "object" || !backup.data) {
			throw new Error("not a relic tracker backup");
		}
		if (backup.version > VERSION) {
			throw new Error("made by a newer version of the site, reload the page and try again");
		}
		var clean = {};
		Object.keys(backup.data).forEach(function (k) {
			var v = backup.data[k];
			if (trackerOf(k) && typeof v === "string" && v.length < 200000) clean[k] = v;
		});
		if (!Object.keys(clean).length) throw new Error("the backup contains no progress");
		backup.data = clean;
		return backup;
	}

	function restore(backup) {
		var included = trackersIn(backup.data);
		// Clear the included trackers first so stale keys don't survive.
		var stale = [];
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if (key && included.indexOf(trackerOf(key)) !== -1) stale.push(key);
		}
		stale.forEach(function (k) {
			localStorage.removeItem(k);
		});
		Object.keys(backup.data).forEach(function (k) {
			localStorage.setItem(k, backup.data[k]);
		});
	}

	// ---- UI --------------------------------------------------------------

	var CSS =
		".pb-btn{padding:.25rem .625rem;border-radius:.25rem;background:rgba(30,41,59,.5);border:1px solid #334155;" +
		"color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;cursor:pointer;transition:all .15s;flex-shrink:0;font-family:inherit}" +
		".pb-btn:hover{color:#e2e8f0;border-color:#64748b;background:rgba(51,65,85,.6)}" +
		".pb-btn:disabled{opacity:.4;cursor:default}" +
		".pb-group{display:flex;gap:.5rem;align-items:center;flex-shrink:0}" +
		".pb-hub{display:flex;justify-content:center;margin-top:1.5rem}" +
		".pb-dialog{background:#12151b;color:#cbd5e1;border:1px solid rgba(255,255,255,.1);border-radius:.5rem;" +
		"padding:0;width:min(440px,calc(100vw - 32px));box-shadow:0 10px 40px rgba(0,0,0,.6);font-family:Lato,sans-serif}" +
		".pb-dialog::backdrop{background:rgba(0,0,0,.6)}" +
		".pb-body{padding:1.25rem}" +
		".pb-dialog h2{font-family:Cinzel,serif;font-size:1rem;font-weight:700;color:#f1f5f9;margin:0 0 .25rem}" +
		".pb-dialog h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin:1.25rem 0 .5rem}" +
		".pb-dialog p{font-size:12px;line-height:1.5;color:#94a3b8;margin:0 0 .5rem}" +
		".pb-row{display:flex;gap:.5rem;flex-wrap:wrap}" +
		".pb-dialog textarea{width:100%;box-sizing:border-box;height:4.5rem;background:#0a0c10;border:1px solid #334155;border-radius:.25rem;" +
		"color:#e2e8f0;font:11px/1.4 ui-monospace,monospace;padding:.5rem;resize:vertical;margin-bottom:.5rem}" +
		".pb-dialog textarea:focus{outline:none;border-color:#64748b}" +
		".pb-msg{font-size:12px;min-height:1.1em;margin-top:.75rem}" +
		".pb-ok{color:#34d399}.pb-err{color:#f87171}" +
		".pb-close{position:absolute;top:.5rem;right:.75rem;background:none;border:0;color:#64748b;font-size:20px;cursor:pointer;line-height:1}" +
		".pb-close:hover{color:#e2e8f0}";

	function el(tag, attrs, text) {
		var node = document.createElement(tag);
		Object.keys(attrs || {}).forEach(function (k) {
			node.setAttribute(k, attrs[k]);
		});
		if (text) node.textContent = text;
		return node;
	}

	function buildDialog() {
		var dlg = el("dialog", { class: "pb-dialog", "aria-labelledby": "pb-title" });
		dlg.style.position = "fixed";
		var body = el("div", { class: "pb-body" });
		var close = el("button", { class: "pb-close", type: "button", "aria-label": "Close" }, "×");

		body.appendChild(el("h2", { id: "pb-title" }, "Backup & Restore"));
		body.appendChild(
			el("p", {}, "Progress is saved only in this browser. Export it here and import it on another device or browser to carry it over."),
		);

		// Export
		body.appendChild(el("h3", {}, "Export"));
		var summary = el("p", {});
		body.appendChild(summary);
		var exRow = el("div", { class: "pb-row" });
		var dlBtn = el("button", { class: "pb-btn", type: "button" }, "Download file");
		var copyBtn = el("button", { class: "pb-btn", type: "button" }, "Copy code");
		exRow.appendChild(dlBtn);
		exRow.appendChild(copyBtn);
		body.appendChild(exRow);

		// Import
		body.appendChild(el("h3", {}, "Import"));
		body.appendChild(el("p", {}, "Paste a backup code, or load a backup file. This replaces this device's progress for the trackers in the backup."));
		var area = el("textarea", { placeholder: CODE_PREFIX + "…", "aria-label": "Backup code", spellcheck: "false" });
		body.appendChild(area);
		var imRow = el("div", { class: "pb-row" });
		var pasteBtn = el("button", { class: "pb-btn", type: "button" }, "Import code");
		var fileBtn = el("button", { class: "pb-btn", type: "button" }, "Load file");
		var fileInput = el("input", { type: "file", accept: ".json,application/json,text/plain", hidden: "" });
		imRow.appendChild(pasteBtn);
		imRow.appendChild(fileBtn);
		imRow.appendChild(fileInput);
		body.appendChild(imRow);

		var msg = el("div", { class: "pb-msg", role: "status" });
		body.appendChild(msg);

		dlg.appendChild(close);
		dlg.appendChild(body);
		document.body.appendChild(dlg);

		function say(text, ok) {
			msg.textContent = text;
			msg.className = "pb-msg " + (ok ? "pb-ok" : "pb-err");
		}

		function refresh() {
			var list = trackersIn(collect());
			summary.textContent = list.length ? "Saved on this device: " + names(list) + "." : "Nothing saved on this device yet.";
			dlBtn.disabled = copyBtn.disabled = !list.length;
			area.value = "";
			msg.textContent = "";
		}

		dlBtn.addEventListener("click", function () {
			var blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: "application/json" });
			var a = el("a", {
				href: URL.createObjectURL(blob),
				download: "ffxiv-relic-backup-" + new Date().toISOString().slice(0, 10) + ".json",
			});
			document.body.appendChild(a);
			a.click();
			a.remove();
			setTimeout(function () {
				URL.revokeObjectURL(a.href);
			}, 1000);
			say("Backup file downloaded.", true);
		});

		copyBtn.addEventListener("click", function () {
			var code = toCode(buildBackup());
			function fallback() {
				area.value = code;
				area.select();
				say("Select-all and copy the code above.", true);
			}
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(code).then(function () {
					say("Code copied. Paste it into Import on your other device.", true);
				}, fallback);
			} else fallback();
		});

		function doImport(text) {
			var backup;
			try {
				backup = parse(text);
			} catch (e) {
				say("Couldn't read that backup: " + (e.message || "invalid code") + ".", false);
				return;
			}
			var list = trackersIn(backup.data);
			var when = backup.exported ? " from " + new Date(backup.exported).toLocaleString() : "";
			if (!confirm("Import backup" + when + "?\n\nThis replaces progress on this device for: " + names(list) + ".")) return;
			try {
				restore(backup);
			} catch (e) {
				say("Couldn't save the backup in this browser.", false);
				return;
			}
			location.reload();
		}

		pasteBtn.addEventListener("click", function () {
			if (!area.value.trim()) return say("Paste a backup code first.", false);
			doImport(area.value);
		});
		fileBtn.addEventListener("click", function () {
			fileInput.value = "";
			fileInput.click();
		});
		fileInput.addEventListener("change", function () {
			var file = fileInput.files && fileInput.files[0];
			if (!file) return;
			var reader = new FileReader();
			reader.onload = function () {
				doImport(reader.result);
			};
			reader.readAsText(file);
		});
		close.addEventListener("click", function () {
			dlg.close();
		});
		dlg.addEventListener("click", function (e) {
			if (e.target === dlg) dlg.close(); // backdrop click
		});

		return { open: function () { refresh(); dlg.showModal(); } };
	}

	function mount() {
		if (typeof HTMLDialogElement === "undefined") return; // very old browsers
		var style = el("style", {});
		style.textContent = CSS;
		document.head.appendChild(style);

		var dialog;
		var btn = el("button", { class: "pb-btn", type: "button", title: "Export or import your progress" }, "Backup");
		btn.addEventListener("click", function () {
			if (!dialog) dialog = buildDialog();
			dialog.open();
		});

		// Tracker pages: group with the Reset button so the header layout holds.
		var reset = Array.prototype.find.call(document.querySelectorAll("button"), function (b) {
			return b.getAttribute("@click") === "resetAll()";
		});
		if (reset) {
			var group = el("div", { class: "pb-group" });
			reset.parentNode.insertBefore(group, reset);
			group.appendChild(btn);
			group.appendChild(reset);
			return;
		}

		// Hub page: centred above the "Made by" footer.
		var footer = Array.prototype.find.call(document.querySelectorAll("div"), function (d) {
			return d.textContent.trim().indexOf("Made by") === 0;
		});
		var wrap = el("div", { class: "pb-hub" });
		wrap.appendChild(btn);
		if (footer) footer.parentNode.insertBefore(wrap, footer);
		else document.body.appendChild(wrap);
	}

	// Runs before Alpine (loaded with defer), so moving the Reset button
	// happens before Alpine binds its @click.
	if (document.body) mount();
	else document.addEventListener("DOMContentLoaded", mount);
})();
