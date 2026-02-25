import { insertHeader, insertFooter, insertNavButtons, insertHead } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js"
import { chart_colours, text_colours, splitLabel, formatValue, get_tree_data } from "./utils/charts.js";
import { latest_year, first_year, updateYearSpans, years } from "./utils/update-years.js";
import { insertValue } from "./utils/insert-value.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { downloadButton } from "./utils/download-button.js";
import { toTitleCase, sectorNameTidy } from "./utils/to-title-case.js";
import { insertExpandButtons } from "./utils/expand-buttons.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Change in Emissions");
    insertHeader();
    insertNavButtons();
    insertExpandButtons();
    
    let GHGALL = await readData("GHGALL");
    const GHGALL_stat = "Total GHG";

    const update_date = new Date(GHGALL.updated).toLocaleDateString("en-GB",
        {
            day: "2-digit", 
            month: "long",
            year: "numeric"
        });

    updateYearSpans(GHGALL, GHGALL_stat);

    // Update values
    //// Biggest sector
    const ghg_value = GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"]["GRAND TOTAL"] / 1000;

    let sectors = Object.keys(
        GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"]
        )
        .filter(x =>
            (x.includes("TOTAL") || x.includes("NET EMISSIONS")) &&
            x !== "GRAND TOTAL" &&
            !x.includes("PUBLIC SECTOR")
        )
        .sort((a, b) => a.localeCompare(b, 'en-GB'));

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

    //// Smallest sector
    const min_sector = Object.entries(sector_totals)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((min, current) => current[1] < min[1] ? current : min)[0];
    
    const min_sector_value = sector_totals[min_sector] / 1000;
    const min_sector_pct = (min_sector_value / ghg_value * 100).toFixed(0);
    const min_sector_name = toTitleCase(min_sector.replace(" TOTAL", ""));  

    insertValue("min-sector-pct", min_sector_pct);
    insertValue("min-sector-name", min_sector_name);

    //// Greatest increase / decrease
    
    let base_sector_totals = {};
    let base_differences = {};

    for (let i = 0; i < sectors.length; i ++) {
        base_sector_totals[sectors[i]] = GHGALL.data[GHGALL_stat][first_year]["Northern Ireland"][sectors[i]];
        base_differences[sectors[i]] = (base_sector_totals[sectors[i]] - sector_totals[sectors[i]]) / base_sector_totals[sectors[i]] * 100;
    }

    const max_change_sector = Object.entries(base_differences)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((max, current) => current[1] > max[1] ? current : max)[0];

    const min_change_sector = Object.entries(base_differences)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((min, current) => current[1] < min[1] ? current : min)[0];

    const max_change_sector_value = base_differences[max_change_sector].toFixed(0);
    const max_change_sector_name = toTitleCase(max_change_sector.replace(" TOTAL", ""));
    const min_change_sector_value = base_differences[min_change_sector].toFixed(0);
    const min_change_sector_name = toTitleCase(min_change_sector.replace(" TOTAL", ""));

    insertValue("most-worsened-pct", Math.abs(min_change_sector_value));
    insertValue("most-worsened-name", min_change_sector_name);
    insertValue("most-improved-pct", Math.abs(max_change_sector_value));
    insertValue("most-improved-name", max_change_sector_name);

    // Find other notable decreases
    const sorted_differences = Object.entries(base_differences)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .sort((a, b) => b[1] - a[1]);

    const other_decrease_1 = sorted_differences[1];
    const other_decrease_2 = sorted_differences[2];

    insertValue("other-decrease-sector-1", toTitleCase(other_decrease_1[0].replace(" TOTAL", "")));
    insertValue("other-decrease-pct-1", Math.abs(other_decrease_1[1]).toFixed(0));
    insertValue("other-decrease-sector-2", toTitleCase(other_decrease_2[0].replace(" TOTAL", "")));
    insertValue("other-decrease-pct-2", Math.abs(other_decrease_2[1]).toFixed(0));

    // Sector treemap

    function reshapeForTreemap(rawObj) {
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

    // usage:
    const treemap_data_raw = GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"];
    const treemap_data = reshapeForTreemap(treemap_data_raw);


// treemap_data = [{ sector, subsector, value }, ...]

  // ---- helpers ----
  

  // Compute totals for top level (unsorted first)
  const sectorTotalsUnsorted = Array.from(new Set(treemap_data.map(d => d.sector))).map(sector => ({
    sector,
    value: treemap_data
      .filter(d => d.sector === sector)
      .reduce((sum, d) => sum + (Number.isFinite(+d.value) ? +d.value : 0), 0)
  }));

  // Sort totals descending (largest first)
  const sectorTotals = sectorTotalsUnsorted
    .slice()
    .sort((a, b) => b.value - a.value);

  // Sector order now matches descending totals
  const sectorList = sectorTotals.map(d => d.sector);

  // Colour/text index is based on sorted order
  const sectorIndex = new Map(sectorList.map((s, i) => [s, i]));

  // ---- data builder ----
  
  // ---- chart ----
  const tree_canvas = document.getElementById("sector-treemap");
  const ctx = tree_canvas.getContext("2d");

  const tree_chart = new Chart(ctx, {
    type: "treemap",
    data: get_tree_data("sector", null, sectorTotals, sectorIndex, treemap_data),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          onClick: null,
          labels: { color: "#000", boxWidth: 0 }
        },
        tooltip: { enabled: false }
      }
    }
  });

  const tree_canvas_expanded = document.getElementById("sector-treemap-expanded");
  const ctx_expanded = tree_canvas_expanded.getContext("2d");

  const tree_chart_expanded = new Chart(ctx_expanded, {
    type: "treemap",
    data: get_tree_data("sector", null, sectorTotals, sectorIndex, treemap_data),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          onClick: null,
          labels: { color: "#000", boxWidth: 0 }
        },
        tooltip: { enabled: false }
      }
    }
  });

  // ---- click -> drill ----
  function clickHandler(evt, chart) {
    const points = chart.getElementsAtEventForMode(
      evt,
      "nearest",
      { intersect: true },
      true
    );
    if (!points.length) return;

    const currentLevel = chart.config.data.datasets[0].label2;

    if (currentLevel === "sector") {
      const sectorClicked = points[0].element?.$context?.raw?.g;
      if (!sectorClicked) return;

      const newData = get_tree_data("subsector", sectorClicked, sectorTotals, sectorIndex, treemap_data);

      // apply to BOTH
      tree_chart.config.data = newData;
      tree_chart.update();

      tree_chart_expanded.config.data = newData;
      tree_chart_expanded.update();

      document.getElementById("treemap-caption").textContent =
        `Emissions breakdown for ${sectorClicked} sector. Click Reset to go back.`;
      document.getElementById("reset-treemap").classList.remove("d-none");
      reset_modal.classList.remove("d-none");
    }
  }

  tree_canvas.onclick = (evt) => clickHandler(evt, tree_chart);
  tree_canvas_expanded.onclick = (evt) => clickHandler(evt, tree_chart_expanded);

  // ---- reset ----
  document.getElementById("reset-treemap").onclick = () => {
    const data = get_tree_data("sector", null, sectorTotals, sectorIndex, treemap_data);

    tree_chart.config.data = data;
    tree_chart.update();

    tree_chart_expanded.config.data = data;
    tree_chart_expanded.update();

    document.getElementById("treemap-caption").textContent = "Click a sector to drill down";
    document.getElementById("reset-treemap").classList.add("d-none");
    reset_modal.classList.add("d-none");
  };

  document.getElementById("sector-treemap-modal").addEventListener("shown.bs.modal", () => {
    tree_chart_expanded.resize();
    tree_chart_expanded.update();
  });

  let reset_modal = document.createElement("button");
  reset_modal.id = "reset-modal";
  reset_modal.className = "btn btn-secondary d-none";
  reset_modal.textContent = "Reset";
  document.getElementById("sector-treemap-modal").appendChild(reset_modal);

  downloadButton("sector-treemap-capture", "GHGALL", update_date);

  // Bar chart (stacked over time: one bar per year, stacks = sectors)
  const bar_canvas = document.getElementById("sector-bar");
  const bar_canvas_expanded = document.getElementById("sector-bar-expanded");

  // Datasets: one dataset per sector (so each sector is a stack segment across years)
  const bar_datasets = sectors.map((sector, i) => ({
    label: sectorNameTidy(sector),
    data: years.map((yr) => {
      const v = GHGALL.data[GHGALL_stat][yr]?.["Northern Ireland"]?.[sector];
      return Number.isFinite(v) ? v : null; // null -> gaps if missing
    }),
    backgroundColor: chart_colours[i % chart_colours.length]
  }));

  const bar_data = {
    labels: years,
    datasets: bar_datasets
  };

  const bar_config = {
    type: "bar",
    data: bar_data,
    options: {
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: false
          
        }
        // keep legend defaults (you didn't disable it before)
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }
  };

  new Chart(bar_canvas, bar_config);
  new Chart(bar_canvas_expanded, bar_config);

  downloadButton("sector-bar-capture", "GHGALL", update_date);



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