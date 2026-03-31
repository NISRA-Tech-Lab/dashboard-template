import { insertHeader, insertFooter, insertNavButtons, insertHead } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js"
import { createLineChart, createBarChartData, createBarChart } from "./utils/charts.js";
import { latest_year, first_year, updateYearSpans, years, last_year } from "./utils/update-years.js";
import { insertValue } from "./utils/insert-value.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { downloadButton } from "./utils/download-button.js";
import { sectorNameTidy, toTitleCase } from "./utils/to-title-case.js";
import { insertExpandButtons } from "./utils/expand-buttons.js";
import { getSectors } from "./utils/get-sectors.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Change in Emissions");
    insertHeader();
    insertNavButtons();
    insertExpandButtons();

    const GHGEMSSNS = await readData("GHGEMSSNS");
    const stat = "CO2 equivalent emissions";

    const update_date = new Date(GHGEMSSNS.updated).toLocaleDateString("en-GB",
        {
            day: "2-digit", 
            month: "long",
            year: "numeric"
        });

    updateYearSpans(GHGEMSSNS, stat);

    // Update values
    //// Total Greenhouse Gas Emissions
    const ghg_value = GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]["Grand total"]["All pollutants"] / 1000;

    insertValue("total-ghg", ghg_value.toFixed(2));

    const ghg_value_last = GHGEMSSNS.data[stat][last_year]["Northern Ireland"]["Grand total"]["All pollutants"] / 1000;
    const ghg_change_value = ghg_value_last - ghg_value;
    const ghg_pct_change = Math.abs(ghg_change_value / ghg_value_last * 100).toFixed(0);
    let ghg_change_string;

    if (ghg_change_value < 0) {
        ghg_change_string = `↑ up ${ghg_pct_change}% since ${latest_year - 1}`
    } else {
        ghg_change_string = `↓ down ${ghg_pct_change}% since ${latest_year - 1}`
    }

    insertValue("ghg-change", ghg_change_string);

    const ghg_value_base = GHGEMSSNS.data[stat][first_year]["Northern Ireland"]["Grand total"]["All pollutants"] / 1000;
    const ghg_change_base_value = ghg_value_base - ghg_value;
    const ghg_pct_change_base = Math.abs(ghg_change_base_value / ghg_value_base * 100).toFixed(0);
    let ghg_change_base_string;

    if (ghg_change_base_value < 0) {
        ghg_change_base_string = `↑ up ${ghg_pct_change_base}% since base year`
    } else {
        ghg_change_base_string = `↓ down ${ghg_pct_change_base}% since base year`
    }

    insertValue("ghg-base-change", ghg_change_base_string);

    //// Carbon Dioxide Emissions
    const co2_value = GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]["Grand total"]["CO2"] / 1000;
    insertValue("total-co2", co2_value.toFixed(2));

    const co2_value_last = GHGEMSSNS.data[stat][last_year]["Northern Ireland"]["Grand total"]["CO2"] / 1000;
    const co2_change_value = co2_value_last - co2_value;
    const co2_pct_change = Math.abs(co2_change_value / co2_value_last * 100).toFixed(0);
    let co2_change_string;

    if (co2_change_value < 0) {
        co2_change_string = `↑ up ${co2_pct_change}% since ${latest_year - 1}`
    } else {
        co2_change_string = `↓ down ${co2_pct_change}% since ${latest_year - 1}`
    }

    insertValue("co2-change", co2_change_string);

    const co2_value_base = GHGEMSSNS.data[stat][first_year]["Northern Ireland"]["Grand total"]["CO2"] / 1000;
    const co2_change_base_value = co2_value_base - co2_value;
    const co2_pct_change_base = Math.abs(co2_change_base_value / co2_value_base * 100).toFixed(0);
    let co2_change_base_string;

    if (co2_change_base_value < 0) {
        co2_change_base_string = `↑ up ${co2_pct_change_base}% since base year`
    } else {
        co2_change_base_string = `↓ down ${co2_pct_change_base}% since base year`
    }

    insertValue("co2-base-change", co2_change_base_string);

    //// Pfg Wellbeing Framework
    const pfg_base_year = "2019"
    const pfg_base_value = GHGEMSSNS.data[stat][pfg_base_year]["Northern Ireland"]["Grand total"]["All pollutants"] / 1000;
    const pfg_change_value = pfg_base_value - ghg_value;
    let pfg_change_string;

    if (pfg_change_value < 0) {
        pfg_change_string = `↑ ${Math.abs(pfg_change_value).toFixed(1)}`
    } else {
        pfg_change_string = `↓ ${Math.abs(pfg_change_value).toFixed(1)}`
    }

    insertValue("pfg-change", pfg_change_string);
    insertValue("pfg-change-type", pfg_change_value < 0 ? "increase" : "reduction");
    insertValue("pfg-base-value", pfg_base_value.toFixed(1));
    insertValue("pfg-base-year", pfg_base_year);

    //// Greatest increase / decrease
    const sectors = getSectors(GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]);

    let sector_totals = {};
    let base_sector_totals = {}
    let base_differences = {};

    for (let i = 0; i < sectors.length; i ++) {
        let sector_value = GHGEMSSNS.data[stat][latest_year]["Northern Ireland"][sectors[i]]["All pollutants"]
        let base_value = GHGEMSSNS.data[stat][first_year]["Northern Ireland"][sectors[i]]["All pollutants"];
        
        
        sector_totals[sectors[i]] = sector_value;
        base_sector_totals[sectors[i]] = base_value;
        if (base_value !== 0) {
            base_differences[sectors[i]] = (base_value - sector_value) / base_value * 100;
        }
    }

    const max_change_sector = Object.entries(base_differences)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((max, current) => current[1] > max[1] ? current : max)[0];

    const min_change_sector = Object.entries(base_differences)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((min, current) => current[1] < min[1] ? current : min)[0];


    const max_change_sector_value = base_differences[max_change_sector].toFixed(0);
    const max_change_sector_name = sectorNameTidy(max_change_sector);
    const min_change_sector_value = base_differences[min_change_sector].toFixed(0);
    const min_change_sector_name = sectorNameTidy(min_change_sector);

    insertValue("min-sector-pct", Math.abs(min_change_sector_value));
    insertValue("min-sector-name", min_change_sector_name);
    insertValue("max-sector-pct", Math.abs(max_change_sector_value));
    insertValue("max-sector-name", max_change_sector_name);

    // Historic Line Chart
    let line_years = [];
    for (let i = first_year; i <= latest_year; i ++) {
        line_years.push(i)
    }

    let ghg_values = [];
    let co2_values = [];
    let methane_values = [];
    
    for (let i = 0; i < line_years.length; i ++) {
        ghg_values[i] = GHGEMSSNS.data[stat][line_years[i]] ? GHGEMSSNS.data[stat][line_years[i]]["Northern Ireland"]["Grand total"]["All pollutants"] / 1000 : null;       
        co2_values[i] = GHGEMSSNS.data[stat][line_years[i]] ? GHGEMSSNS.data[stat][line_years[i]]["Northern Ireland"]["Grand total"]["CO2"] / 1000 : null;
        methane_values[i] = GHGEMSSNS.data[stat][line_years[i]] ? GHGEMSSNS.data[stat][line_years[i]]["Northern Ireland"]["Grand total"]["CH4"] / 1000 : null;        
    }


    createLineChart({
        years: line_years,
        lines: [ghg_values, co2_values, methane_values],
        labels: ["Total GHG", "Carbon Dioxide", "Methane"],
        unit: "MtCO2e",
        canvas_id: "historic-line"
    })

    createLineChart({
        years,
        lines: [ghg_values, co2_values, methane_values],
        labels: ["Total GHG", "Carbon Dioxide", "Methane"],
        unit: "MtCO2e",
        canvas_id: "historic-line-expanded"
    })

    downloadButton("historic-line-capture", "GHGALL", update_date);

    // Table
    const table = document.getElementById("emissions-table");
    const thead = table.createTHead();
    const tbody = table.createTBody();

    thead.innerHTML = `
    <tr>
        <th>Sector</th>
        <th style="text-align: right;">Base Year Emissions (MtCO&#8322;e)</th>
        <th style="text-align: right;">${latest_year} Emissions (MtCO&#8322;e)</th>
        <th style="text-align: right;">Change (%)</th>
    </tr>
    `;

    for (let i = 0; i < sectors.length; i ++) {
        const sector = sectors[i];
        const base_value = base_sector_totals[sector] / 1000;
        const latest_value = sector_totals[sector] / 1000;

        const value = base_differences[sector] == null ? null : base_differences[sector].toFixed(0);
        const pct_change = value == null
            ? `<strong style="color: #000">n/a</strong>`
            : `<strong style="color: ${value < 0 ? '#ff0000' : value > 0 ? '#008000' : '#000'}">
                ${value < 0 ? '+' : value > 0 ? '-' : ''} 
                ${Math.abs(value)}% 
                ${value < 0 ? '↑' : value > 0 ? '↓' : ''} 
                </strong>`;

        const row = tbody.insertRow();
        const sectorCell = row.insertCell(0);
        const baseCell = row.insertCell(1);
        const latestCell = row.insertCell(2);
        const changeCell = row.insertCell(3);

        sectorCell.innerHTML = sectorNameTidy(sector);
        baseCell.innerHTML = base_value.toFixed(2);
        latestCell.innerHTML = latest_value.toFixed(2);
        changeCell.innerHTML = `${pct_change}`;

        baseCell.style.textAlign = "right";
        latestCell.style.textAlign = "right";
        changeCell.style.textAlign = "right";
        changeCell.style.paddingRight = value == null || value == 0 ? "1em" : "";

        baseCell.style.verticalAlign = "middle";
        latestCell.style.verticalAlign = "middle";
        changeCell.style.verticalAlign = "middle";
    }

    downloadButton("emissions-table-capture", "GHGINVENTORY", update_date, "table");

    // Populate info boxes
    populateInfoBoxes(
        ["Definitions", "Source", "What does the data mean?"],
        [
        `<p><strong>CO&#8322; Equivalent</strong>: The values in this dashboard are presented in CO&#8322; equivalent units (CO&#8322;e). This is the emissions value, weighted using the appropriate GWP for the gas type. This standardises emissions from different gases, allowing comparison. More information on GWPs is available at: UK greenhouse gas emissions: other technical reports.</p>`,

        `<strong>MetaData</strong>
        <p>The data in this dashboard come from <a href="https://naei.energysecurity.gov.uk/reports/greenhouse-gas-inventories-england-scotland-wales-northern-ireland-1990-2023" target="_blank" rel="noopener">Greenhouse Gas Inventories for England Scotland, Wales and Northern Ireland</a></p>
        <p>The GHG inventory data are produced annually by Ricardo Energy and Environment, on behalf of the Department for Energy Security & Net Zero, the Scottish Government, the Welsh Assembly Government and the Northern Ireland Department of Agriculture, Environment and Rural Affairs. Each year the GHG inventory is extended and updated. The entire historical data series, from 1990 to the latest year, is revised to incorporate methodological improvements and new data. This takes into account revisions to the datasets used in its compilation.</p>
        <p>The GHG emission estimates are based on a wide range of data sources and sources of uncertainty include statistical differences, assumptions, proxy datasets and expert judgement. In addition, the natural variability in the processes that are being modelled introduce uncertainty. For example, carbon content of fuels and farming practices under different climatic conditions and soil types. Uncertainty estimates for Northern Ireland emissions are available for the base year, the latest year (2023) and for the percentage change between the two years. For the base year, a close approximation of the 95% confidence interval is ±9%, and for 2023 it is ±6%. For the percentage reduction between the base year and 2023, the 95% confidence interval ranges from 24% to 41%.</p>
        <p>There remains greater uncertainty around emissions in Northern Ireland compared to other parts of the United Kingdom due to the relative importance of methane and nitrous oxide emissions in the agriculture sector. Emissions of this gas are more difficult to estimate than carbon dioxide, and the agriculture sector makes up a larger share of Northern Irelan'’s emissions than in other parts of the UK. More information is available in <a href="https://www.gov.uk/government/publications/uk-greenhouse-gas-emissions-statistics-user-guidance" target="_blank" rel="noopener">An introduction to the UK's greenhouse gas inventory</a> and <a href="https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/996190/uk-emissions-statistics-frequently-asked-questions.pdf" target="_blank" rel="noopener">UK Greenhouse Gas Emissions Statistics: FAQs</a>.</p>
        <strong>Contact Details</strong>
        <p>DAERA Statistics & Analytical Services Branch is keen to hear your feedback.</p>
        <p>Please e-mail comments to <a href="mailto:env.stats@daera-ni.gov.uk">env.stats@daera-ni.gov.uk</a></p>
        <p>Further information can be found on the <a href="https://www.daera-ni.gov.uk/landing-pages/statistics" target="_blank" rel="noopener">DAERA Statistics website</a>.</p>
        <p>Date of Publication:</p>
        <p>Published: Annually</p>
        <p>Time period covered - Greenhouse Gas Inventory: 1990-${latest_year}</p>`,

        `<p>This dashboard presents data for Northern Ireland, from the Greenhouse Gas (GHG) Inventory. The GHG inventory provides the official estimates of emissions for the UK and each DA from 1990 to the latest available year. The inventory fulfils the United Nations Framework Convention on Climate Change (UNFCCC) reporting requirements under the Kyoto Protocol. The GHG inventory helps in understanding the amount of GHGs emitted and what sectors they originate from. The Inventory covers the emissions of the following seven gases which contribute to global warming:</p>
        <ul>
            <li>Carbon dioxide (CO&#8322;)</li>
            <li>Methane (CH&#8324;)</li>
            <li>Nitrous oxide (N&#8322;O)</li>
            <li>Hydrofluorocarbons (HFCs)</li>
            <li>Perfluorocarbons (PFCs)</li>
            <li>Sulphur hexafluoride (SF&#8326;)</li>
            <li>Nitrogen trifluoride (NF&#8323;)</li>
        </ul>
        <p>The last four of these gases are the Fluorinated, or F-gases.</p>`
        
        ]
    );

    insertFooter();

});