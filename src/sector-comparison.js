import { insertHeader, insertFooter, insertNavButtons, insertHead } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js"
import { chart_colours,  get_tree_data } from "./utils/charts.js";
import { latest_year, first_year, last_year, updateYearSpans, years } from "./utils/update-years.js";
import { insertValue } from "./utils/insert-value.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { downloadButton } from "./utils/download-button.js";
import { toTitleCase, sectorNameTidy } from "./utils/to-title-case.js";
import { insertExpandButtons } from "./utils/expand-buttons.js";
import { reshapeForTreemap } from "./utils/reshape-for-treemap.js";
import { getSectors } from "./utils/get-sectors.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Sector Comparison");
    insertHeader();
    insertNavButtons();
    insertExpandButtons();

    const GHGEMSSNS = await readData("GHGEMSSNS");

    const stat = "CO2 equivalent emissions";
    updateYearSpans(GHGEMSSNS, stat);

    const update_date = new Date(GHGEMSSNS.updated).toLocaleDateString("en-GB",
        {
            day: "2-digit", 
            month: "long",
            year: "numeric"
        });

    // Update values
    //// Biggest sector
    const ghg_value = GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]["Grand total"]["All pollutants"]  / 1000;

    const sectors = getSectors(GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]);

    let sector_totals = {}

    for (let i = 0; i < sectors.length; i ++) {
        sector_totals[sectors[i]] = GHGEMSSNS.data[stat][latest_year]["Northern Ireland"][sectors[i]]["All pollutants"];
    }

    const max_sector = Object.entries(sector_totals)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((max, current) => current[1] > max[1] ? current : max)[0];

    const max_sector_value = sector_totals[max_sector] / 1000;
    const max_sector_pct = (max_sector_value / ghg_value * 100).toFixed(0);

    const max_sector_name = sectorNameTidy(max_sector);
    
    insertValue("max-sector-pct", max_sector_pct);
    insertValue("max-sector-name", max_sector_name);

    //// Smallest sector
    const min_sector = Object.entries(sector_totals)
        .filter(([_, value]) => typeof value === "number" && !Number.isNaN(value))
        .reduce((min, current) => current[1] < min[1] ? current : min)[0];
    
    const min_sector_value = sector_totals[min_sector] / 1000;
    const min_sector_pct = min_sector_value / ghg_value * 100 < 1 ? (min_sector_value / ghg_value * 100).toFixed(2) : (min_sector_value / ghg_value * 100).toFixed(0);
    const min_sector_name = sectorNameTidy(min_sector);  

    insertValue("min-sector-pct", min_sector_pct);
    insertValue("min-sector-name", min_sector_name);

    //// Greatest increase / decrease
    
    let base_sector_totals = {};
    let base_differences = {};

    for (let i = 0; i < sectors.length; i ++) {
        base_sector_totals[sectors[i]] = GHGEMSSNS.data[stat][first_year]["Northern Ireland"][sectors[i]]["All pollutants"];
        if (base_sector_totals[sectors[i]] != 0) {
            base_differences[sectors[i]] = (base_sector_totals[sectors[i]] - sector_totals[sectors[i]]) / base_sector_totals[sectors[i]] * 100;
        } else {
            base_differences[sectors[i]] = null;
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

    insertValue("other-decrease-sector-1", sectorNameTidy(other_decrease_1[0]));
    insertValue("other-decrease-pct-1", Math.abs(other_decrease_1[1]).toFixed(0));
    insertValue("other-decrease-sector-2", sectorNameTidy(other_decrease_2[0]));
    insertValue("other-decrease-pct-2", Math.abs(other_decrease_2[1]).toFixed(0));

    // Sector treemap  
    const treemap_data = reshapeForTreemap(GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]); 

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

      const newData = get_tree_data("subsector_tidy", sectorClicked, sectorTotals, sectorIndex, treemap_data);

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
    document.getElementById("reset-modal").classList.add("d-none");
    reset_modal.classList.add("d-none");
  };

  let reset_modal_div = document.createElement("div");
  reset_modal_div.classList.add("mb-5");

  let reset_modal = document.createElement("button");
  reset_modal.id = "reset-modal";
  reset_modal.className = "btn btn-primary d-none";
  reset_modal.textContent = "Reset";
  reset_modal_div.appendChild(reset_modal)

  document.getElementById("sector-treemap-expanded").parentElement.appendChild(reset_modal_div);

  document.getElementById("reset-modal").onclick = () => {
    const data = get_tree_data("sector", null, sectorTotals, sectorIndex, treemap_data);

    tree_chart.config.data = data;
    tree_chart.update();

    tree_chart_expanded.config.data = data;
    tree_chart_expanded.update();

    document.getElementById("treemap-caption").textContent = "Click a sector to drill down";
    document.getElementById("reset-treemap").classList.add("d-none");
    document.getElementById("reset-modal").classList.add("d-none");
    reset_modal.classList.add("d-none");
  };

  document.getElementById("sector-treemap-modal").addEventListener("shown.bs.modal", () => {
    tree_chart_expanded.resize();
    tree_chart_expanded.update();
  });

  

  downloadButton("sector-treemap-capture", "GHGALL", update_date);

  // Bar chart (stacked over time: one bar per year, stacks = sectors)
  const bar_canvas = document.getElementById("sector-bar");
  const bar_canvas_expanded = document.getElementById("sector-bar-expanded");
  
  const bar_years = [first_year, last_year, latest_year];

  const sorted_sectors = [...sectors].sort((a, b) => {
    const valA = sector_totals?.[a] ?? -Infinity;
    const valB = sector_totals?.[b] ?? -Infinity;
    return valB - valA;
  });


  // Datasets: one dataset per sector (so each sector is a stack segment across years)
  const bar_datasets = sorted_sectors.map((sector, i) => ({
    label: sectorNameTidy(sector),
    data: bar_years.map((yr) => {
      const v = GHGEMSSNS.data[stat][yr]["Northern Ireland"]?.[sector]["All pollutants"];
      return Number.isFinite(v) ? v : null; // null -> gaps if missing
    }),
    backgroundColor: chart_colours[i % chart_colours.length]
  }));

  let bar_years_display = [];
  for (let i = 0; i < bar_years.length; i ++) {
    bar_years_display[i] = bar_years[i] == first_year ? "Base Year" : bar_years[i]
  }

  const bar_data = {
    labels: bar_years_display,
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
      },
      scales: {
        x: { stacked: true,
          grid: {
              display: false
            }
         },
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