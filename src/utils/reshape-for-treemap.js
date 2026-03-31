import { sectorNameTidy } from "./to-title-case.js";

export function reshapeForTreemap(rawObj) {
        const rows = [];
        const keys = Object.keys(rawObj);

        // helpers
        const isSectorTotal = (s) =>
            s.indexOf(" total") > -1;
        const isGrandTotal = (s) => s.trim() === "Grand total";
        

        let pendingItems = []; // { name, value }

        for (const k of keys) {
            const v = rawObj[k]["All pollutants"];

            if (isGrandTotal(k)) {
            // ignore completely
            continue;
            }

            if (isSectorTotal(k)) {

                // we've hit the sector total: flush pending items under this sector
                const sector = sectorNameTidy(k);

                for (const item of pendingItems) {
                    // ignore non-numeric / missing values defensively
                    const num = Number(item.value);

                    if (Number.isFinite(num)) {
                        // const safeValue = Math.max(0, num); // negative values become 0
                        rows.push({ sector, subsector: item.name, value: num });
                    }
                }

                if (sector == "Waste") {
                    rows.push( {sector, subsector: "Waste", value: Number(v)})
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