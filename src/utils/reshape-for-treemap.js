import { sectorNameTidy } from "./to-title-case.js";

export function reshapeForTreemap(rawObj) {
        const rows = [];
        const keys = Object.keys(rawObj);

        // helpers
        const isAllCaps = (s) =>
            /[A-Z]/.test(s) && s === s.toUpperCase(); // simple + works for "INDUSTRY TOTAL", "LULUCF NET EMISSIONS"
        const isGrandTotal = (s) => s.trim() === "GRAND TOTAL";

        let pendingItems = []; // { name, value }

        for (const k of keys) {
            const v = rawObj[k];

            if (isGrandTotal(k)) {
            // ignore completely
            continue;
            }

            if (isAllCaps(k)) {

                // we've hit the sector total: flush pending items under this sector
                const sector = sectorNameTidy(k)

                for (const item of pendingItems) {
                    // ignore non-numeric / missing values defensively
                    const num = Number(item.value);

                    if (Number.isFinite(num)) {
                        const safeValue = Math.max(0, num); // negative values become 0
                        rows.push({ sector, subsector: item.name, value: safeValue });
                    }
                }

                // reset for next sector block
                pendingItems = [];
            } else {
                // title-case / normal key => a leaf item to be grouped under the next ALL CAPS total
                pendingItems.push({ name: k, value: v });
            }
        }

        return rows;
    }