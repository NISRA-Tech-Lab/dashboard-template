import { sectorNameTidy } from "./to-title-case.js";

export function reshapeForTreemap(rawObj) {
        const rows = [];
        const keys = Object.keys(rawObj);

        // helpers
        const isAllCaps = (s) =>
            /[A-Z]/.test(s) && s === s.toUpperCase(); // simple + works for "INDUSTRY TOTAL", "LULUCF NET EMISSIONS"
        const isSectorTotal = (s) =>
            s.indexOf(" total") > -1 || s.indexOf(" net emissions") > -1;
        const isGrandTotal = (s) => s.trim() === "Grand total";
        const isPublicSector = (s) => s.toLocaleLowerCase().includes("public sector");

        let pendingItems = []; // { name, value }

        for (const k of keys) {
            const v = rawObj[k];

            if (isGrandTotal(k) || isPublicSector(k)) {
            // ignore completely
            continue;
            }

            if (isSectorTotal(k)) {

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

         for (let i = 0; i < rows.length; i ++) {
            if (rows[i].subsector.indexOf(rows[i].sector) == 0) {
                rows[i].subsector_tidy = rows[i].subsector.replace(`${rows[i].sector} `, "");
            } else if (rows[i].subsector.indexOf("Net Emissions: ") == 0) {
                rows[i].subsector_tidy = rows[i].subsector.replace("Net Emissions: ", "");
            } else {
                rows[i].subsector_tidy = rows[i].subsector;
            }
        }

        return rows;
    }