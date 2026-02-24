import { insertHeader, insertFooter, insertHead, insertNavButtons } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { insertValue } from "./utils/insert-value.js";
import { latest_year, updateYearSpans, first_year } from "./utils/update-years.js";
import { toTitleCase } from "./utils/to-title-case.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Home");
    insertHeader();
    insertNavButtons()

    // Insert values into homepage cards
    const GHGALL = await readData("GHGALL");
    const GHGALL_stat = "Total GHG";
    updateYearSpans(GHGALL, GHGALL_stat);

    // Change in Emissions
    const ghg_value = GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"]["GRAND TOTAL"] / 1000;

    insertValue("total-ghg", ghg_value.toFixed(2));

    const ghg_value_last = GHGALL.data[GHGALL_stat][latest_year - 1]["Northern Ireland"]["GRAND TOTAL"] / 1000;
    const ghg_change_value = ghg_value_last - ghg_value;
    const ghg_pct_change = Math.abs(ghg_change_value / ghg_value_last * 100).toFixed(0);
    let ghg_change_string;

    if (ghg_change_value < 0) {
        ghg_change_string = `↑ up ${ghg_pct_change}% since ${latest_year - 1}`
    } else {
        ghg_change_string = `↓ down ${ghg_pct_change}% since ${latest_year - 1}`
    }

    insertValue("ghg-change", ghg_change_string);

    const ghg_value_base = GHGALL.data[GHGALL_stat][first_year]["Northern Ireland"]["GRAND TOTAL"] / 1000;
    const ghg_change_base_value = ghg_value_base - ghg_value;
    const ghg_pct_change_base = Math.abs(ghg_change_base_value / ghg_value_base * 100).toFixed(0);
    let ghg_change_base_string;

     if (ghg_change_base_value < 0) {
        ghg_change_base_string = `↑ up ${ghg_pct_change_base}% since base year`
    } else {
        ghg_change_base_string = `↓ down ${ghg_pct_change_base}% since base year`
    }

    insertValue("ghg-base-change", ghg_change_base_string);

    // Sectors
    let sectors = Object.keys(GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"]);
    sectors = sectors.filter((x) => x.indexOf("TOTAL") > -1 & x != "GRAND TOTAL");

    let sector_totals = {}

    for (let i = 0; i < sectors.length; i ++) {
        sector_totals[sectors[i]] = GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"][sectors[i]]
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
        base_sector_totals[sectors[i]] = GHGALL.data[GHGALL_stat][first_year]["Northern Ireland"][sectors[i]];
        base_differences[sectors[i]] = (base_sector_totals[sectors[i]] - sector_totals[sectors[i]]) / base_sector_totals[sectors[i]] * 100;
    }

    const max_change_sector = Object.entries(base_differences)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((max, current) => current[1] > max[1] ? current : max)[0];

        console.log(max_change_sector)

    const max_change_sector_value = base_differences[max_change_sector].toFixed(0);
    const max_change_sector_name = toTitleCase(max_change_sector.replace(" TOTAL", ""));

    insertValue("max-change-sector-value", max_change_sector_value);
    insertValue("max-change-sector-name", max_change_sector_name);


    
    insertFooter();

})