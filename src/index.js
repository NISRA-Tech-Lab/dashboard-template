import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { insertValue } from "./utils/insert-value.js";
import { latest_year, updateYearSpans, first_year, last_year } from "./utils/update-years.js";
import { toTitleCase } from "./utils/to-title-case.js";
import { getSectors } from "./utils/get-sectors.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Home");
    insertHeader();
    insertNavButtons()

    // Insert values into homepage cards
    const GHGINVENTORY = await readData("GHGINVENTORY");
    const GHGINVENTORY_stat = "CO2 equivalent emissions"
    updateYearSpans(GHGINVENTORY, GHGINVENTORY_stat);

    // Change in Emissions
    const ghg_value = GHGINVENTORY.data[GHGINVENTORY_stat][latest_year]["All"] / 1000;

    insertValue("total-ghg", ghg_value.toFixed(2));

    // Sectors
    const sectors = Object.keys(GHGINVENTORY.data[GHGINVENTORY_stat][latest_year])
        .filter((x) => x != "All");

    let sector_totals = {}

    for (let i = 0; i < sectors.length; i ++) {
        sector_totals[sectors[i]] = GHGINVENTORY.data[GHGINVENTORY_stat][latest_year][sectors[i]]
    }

    const max_sector = Object.entries(sector_totals)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((max, current) => current[1] > max[1] ? current : max)[0];

    const max_sector_value = sector_totals[max_sector] / 1000;
    const max_sector_pct = (max_sector_value / ghg_value * 100).toFixed(0);

    const max_sector_name = toTitleCase(max_sector.replace(" TOTAL", ""));
    
    insertValue("max-sector-pct", max_sector_pct);
    insertValue("max-sector-name", max_sector_name);
    
    // Sector Comparisons
    let base_sector_totals = {};
    let base_differences = {};

    for (let i = 0; i < sectors.length; i ++) {
        base_sector_totals[sectors[i]] = GHGINVENTORY.data[GHGINVENTORY_stat][first_year][sectors[i]];
        base_differences[sectors[i]] = (base_sector_totals[sectors[i]] - sector_totals[sectors[i]]) / base_sector_totals[sectors[i]] * 100;
    }

    const max_change_sector = Object.entries(base_differences)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((max, current) => current[1] > max[1] ? current : max)[0];

    const max_change_sector_value = base_differences[max_change_sector].toFixed(0);
    const max_change_sector_name = toTitleCase(max_change_sector.replace(" TOTAL", ""));

    insertValue("max-change-sector-value", max_change_sector_value);
    insertValue("max-change-sector-name", max_change_sector_name);


    const pfg_value = GHGINVENTORY.data[GHGINVENTORY_stat]["2019"]["All"] / 1000;
    insertValue("pfg-value", pfg_value.toFixed(1));
    
    insertFooter();

})