/**
 * XIVAPI icon loader
 * ------------------
 * Swaps local item/currency icons for the official game icons served by
 * XIVAPI v2 (https://v2.xivapi.com). Game icons are looked up by in-game
 * item ID, so data files only need to say WHICH item something is — no more
 * hand-saving PNGs.
 *
 * How it works:
 *   1. Collect every item ID the page needs (from data objects and from
 *      <img data-xiv-item="…"> tags).
 *   2. Ask XIVAPI for all of their Icon paths in one batched request per
 *      sheet (/api/sheet/Item?rows=1,2,3&fields=Icon).
 *   3. Preload each icon image; only once it has actually loaded do we swap
 *      it in. If XIVAPI is down, blocked, or slow, the local PNG simply stays
 *      put — the page never shows a broken image because of this script.
 *   4. The ID → URL map is cached in localStorage for 30 days, so repeat
 *      visits skip step 2 entirely.
 *
 * Referencing an icon:
 *   - A number is an Item sheet row ID:          itemId: 28
 *   - Key items live in a different sheet:       itemId: "EventItem:2001298"
 *
 * Usage (inside an Alpine component's init()):
 *   if (typeof XivIcons !== "undefined") {
 *     XivIcons.hydrateItems(this.items, ICON_ITEM_IDS);
 *     XivIcons.hydrateDom();
 *   }
 */
(function (global) {
	"use strict";

	var API = "https://v2.xivapi.com/api";
	var CACHE_KEY = "xivapi_icons_v1";
	var CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // icons basically never change
	var ROWS_PER_REQUEST = 100;

	// ---- refs ------------------------------------------------------------

	function parseRef(ref) {
		if (ref === undefined || ref === null || ref === "") return null;
		if (typeof ref === "number") return { sheet: "Item", id: ref };
		var s = String(ref);
		var i = s.indexOf(":");
		var sheet = i === -1 ? "Item" : s.slice(0, i);
		var id = parseInt(i === -1 ? s : s.slice(i + 1), 10);
		if (!/^[A-Za-z]+$/.test(sheet) || !(id > 0)) return null;
		return { sheet: sheet, id: id };
	}

	function keyOf(ref) {
		var p = parseRef(ref);
		return p ? p.sheet + ":" + p.id : null;
	}

	function assetUrl(texPath) {
		return API + "/asset?path=" + encodeURIComponent(texPath) + "&format=png";
	}

	// ---- cache -----------------------------------------------------------

	function loadCache() {
		try {
			var raw = global.localStorage && global.localStorage.getItem(CACHE_KEY);
			if (!raw) return {};
			var parsed = JSON.parse(raw);
			if (!parsed || Date.now() - parsed.t > CACHE_TTL_MS) return {};
			return parsed.icons || {};
		} catch (e) {
			return {};
		}
	}

	function saveCache(icons) {
		try {
			global.localStorage.setItem(
				CACHE_KEY,
				JSON.stringify({ t: Date.now(), icons: icons }),
			);
		} catch (e) {
			/* storage full / disabled — fine, we just refetch next time */
		}
	}

	var cache = loadCache();

	// ---- API -------------------------------------------------------------

	function fetchSheetIcons(sheet, ids) {
		var url =
			API +
			"/sheet/" +
			sheet +
			"?rows=" +
			ids.join(",") +
			"&fields=Icon";
		return fetch(url)
			.then(function (res) {
				if (!res.ok) throw new Error("XIVAPI " + res.status);
				return res.json();
			})
			.then(function (json) {
				var out = {};
				(json.rows || []).forEach(function (row) {
					var icon = row.fields && row.fields.Icon;
					var path = icon && (icon.path_hr1 || icon.path);
					if (path && icon.id) out[sheet + ":" + row.row_id] = assetUrl(path);
				});
				return out;
			});
	}

	// Calls made in the same tick (e.g. hydrateItems + hydrateDom) are merged
	// into one batch, so a page makes a single request per sheet.
	var queued = null;
	var queuedFlush = null;

	/** Resolve refs to icon URLs. Always resolves (never rejects). */
	function resolve(refs) {
		if (!queued) {
			queued = [];
			queuedFlush = new Promise(function (done) {
				setTimeout(function () {
					var batch = queued;
					queued = null;
					fetchMissing(batch).then(done);
				}, 0);
			});
		}
		queued.push.apply(queued, refs);
		return queuedFlush;
	}

	function fetchMissing(refs) {
		var missing = {};
		refs.forEach(function (ref) {
			var p = parseRef(ref);
			if (!p) return;
			var k = p.sheet + ":" + p.id;
			if (cache[k]) return;
			(missing[p.sheet] = missing[p.sheet] || {})[p.id] = true;
		});

		var jobs = [];
		Object.keys(missing).forEach(function (sheet) {
			var ids = Object.keys(missing[sheet]);
			for (var i = 0; i < ids.length; i += ROWS_PER_REQUEST) {
				jobs.push(
					fetchSheetIcons(sheet, ids.slice(i, i + ROWS_PER_REQUEST)).catch(
						function (err) {
							if (global.console) console.warn("[XivIcons]", err);
							return {};
						},
					),
				);
			}
		});

		if (!jobs.length) return Promise.resolve(cache);
		return Promise.all(jobs).then(function (results) {
			results.forEach(function (r) {
				Object.keys(r).forEach(function (k) {
					cache[k] = r[k];
				});
			});
			saveCache(cache);
			return cache;
		});
	}

	var preloaded = {};
	function preload(url) {
		if (!preloaded[url]) {
			preloaded[url] = new Promise(function (done) {
				var img = new Image();
				img.onload = function () {
					done(true);
				};
				img.onerror = function () {
					done(false);
				};
				img.src = url;
			});
		}
		return preloaded[url];
	}

	/**
	 * targets: [{ ref, apply(url) }]. Resolves refs, preloads, then calls
	 * apply() for every icon that loaded. Anything that fails is left alone.
	 */
	function hydrate(targets) {
		targets = targets.filter(function (t) {
			return keyOf(t.ref);
		});
		if (!targets.length || typeof fetch === "undefined") return Promise.resolve();
		return resolve(
			targets.map(function (t) {
				return t.ref;
			}),
		).then(function (icons) {
			return Promise.all(
				targets.map(function (t) {
					var url = icons[keyOf(t.ref)];
					if (!url) return null;
					return preload(url).then(function (ok) {
						if (ok) t.apply(url);
					});
				}),
			);
		});
	}

	/**
	 * Swap `icon` on each data item (and on each of its `options`).
	 * An object's game item comes from its own `itemId`, or failing that from
	 * `iconMap[object.icon]` — handy for shared currency icons like Poetics.
	 * Pass Alpine's reactive `this.items` so the UI updates on swap.
	 */
	function hydrateItems(items, iconMap) {
		iconMap = iconMap || {};
		var targets = [];
		function add(obj) {
			if (!obj) return;
			var ref = obj.itemId !== undefined ? obj.itemId : iconMap[obj.icon];
			if (ref === undefined) return;
			targets.push({
				ref: ref,
				apply: function (url) {
					obj.icon = url;
				},
			});
		}
		(items || []).forEach(function (item) {
			add(item);
			(item.options || []).forEach(add);
		});
		return hydrate(targets);
	}

	/** Swap the src of every <img data-xiv-item="…"> under root. */
	function hydrateDom(root) {
		var imgs = (root || document).querySelectorAll("img[data-xiv-item]");
		var targets = [];
		Array.prototype.forEach.call(imgs, function (img) {
			targets.push({
				ref: img.getAttribute("data-xiv-item"),
				apply: function (url) {
					img.src = url;
				},
			});
		});
		return hydrate(targets);
	}

	global.XivIcons = {
		resolve: resolve,
		hydrate: hydrate,
		hydrateItems: hydrateItems,
		hydrateDom: hydrateDom,
		assetUrl: assetUrl,
	};
})(typeof window !== "undefined" ? window : this);
