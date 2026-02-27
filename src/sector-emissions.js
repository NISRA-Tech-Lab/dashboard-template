import { insertHeader, insertFooter, insertNavButtons, insertHead } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js"
import { chart_colours,  createLineChart } from "./utils/charts.js";
import { latest_year, first_year, updateYearSpans, years } from "./utils/update-years.js";
import { insertValue } from "./utils/insert-value.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { downloadButton } from "./utils/download-button.js";
import { sectorNameTidy } from "./utils/to-title-case.js";
import { insertExpandButtons } from "./utils/expand-buttons.js";
import { reshapeForTreemap } from "./utils/reshape-for-treemap.js";
import { getSectors } from "./utils/get-sectors.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("Sector Emissions");
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

    // Choose sector box
    const sector_select = document.getElementById("select-sector");  

    const sectors = getSectors(GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"]);

    for (let i = 0; i < sectors.length; i ++) {
      let option = document.createElement("option");
      option.value = sectors[i];
      option.textContent = sectorNameTidy(sectors[i]);
      sector_select.appendChild(option);
    }

    const subsector_data = reshapeForTreemap(GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"]);
    const subsector_base_data = reshapeForTreemap(GHGALL.data[GHGALL_stat][first_year]["Northern Ireland"]);

    let subsector_chart;
    let subsector_expand;    
    let gas_chart;
    let gas_expand;

    function update_cards () {

      const sector = sector_select.value;
      const sector_name_els = document.getElementsByClassName("sector-name");
      for (let i = 0; i < sector_name_els.length; i++) {
          sector_name_els[i].textContent = sectorNameTidy(sector);
      }

      const ghg_value = GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"][sector] / 1000;
      insertValue("total-ghg", ghg_value.toFixed(2));

      const ghg_value_last = GHGALL.data[GHGALL_stat][latest_year - 1]["Northern Ireland"][sector] / 1000;
      const ghg_change_value = ghg_value_last - ghg_value;
      const ghg_pct_change = Math.abs(ghg_change_value / ghg_value_last * 100).toFixed(0);
      let ghg_change_string;

      if (ghg_change_value < 0) {
          ghg_change_string = `↑ up ${ghg_pct_change}% since ${latest_year - 1}`
      } else {
          ghg_change_string = `↓ down ${ghg_pct_change}% since ${latest_year - 1}`
      }

      insertValue("ghg-change", ghg_change_string);

      const ghg_value_base = GHGALL.data[GHGALL_stat][first_year]["Northern Ireland"][sector] / 1000;
      const ghg_change_base_value = ghg_value_base - ghg_value;
      const ghg_pct_change_base = Math.abs(ghg_change_base_value / ghg_value_base * 100).toFixed(0);
      let ghg_change_base_string;

      if (ghg_change_base_value < 0) {
        ghg_change_base_string = `↑ up ${ghg_pct_change_base}% since base year`
      } else {
        ghg_change_base_string = `↓ down ${ghg_pct_change_base}% since base year`
      }

      insertValue("ghg-base-change", ghg_change_base_string);

      const ghg_ni = GHGALL.data[GHGALL_stat][latest_year]["Northern Ireland"]["GRAND TOTAL"] / 1000;
      const sector_pct = (ghg_value / ghg_ni * 100).toFixed(0);

      insertValue("sector-pct", sector_pct);

      const co2_value = GHGALL.data["Carbon Dioxide"][latest_year]["Northern Ireland"][sector] / 1000;
      insertValue("total-co2", co2_value.toFixed(2));

      const co2_value_last = GHGALL.data["Carbon Dioxide"][latest_year - 1]["Northern Ireland"][sector] / 1000;
      const co2_change_value = co2_value_last - co2_value;
      const co2_pct_change = Math.abs(co2_change_value / co2_value_last * 100).toFixed(0);
      let co2_change_string;

      if (co2_change_value < 0) {
          co2_change_string = `↑ up ${co2_pct_change}% since ${latest_year - 1}`
      } else {
          co2_change_string = `↓ down ${co2_pct_change}% since ${latest_year - 1}`
      }

      insertValue("co2-change", co2_change_string);

      const co2_value_base = GHGALL.data["Carbon Dioxide"][first_year]["Northern Ireland"][sector] / 1000;
      const co2_change_base_value = co2_value_base - co2_value;
      const co2_pct_change_base = Math.abs(co2_change_base_value / co2_value_base * 100).toFixed(0);
      let co2_change_base_string;

      if (co2_change_base_value < 0) {
          co2_change_base_string = `↑ up ${co2_pct_change_base}% since base year`
      } else {
          co2_change_base_string = `↓ down ${co2_pct_change_base}% since base year`
      }

      insertValue("co2-base-change", co2_change_base_string);

      const subsector_data_filtered = subsector_data.filter(x => x.sector === sectorNameTidy(sector));
      const subsector_base_data_filtered = subsector_base_data.filter(x => x.sector === sectorNameTidy(sector));

      let subsector_lines = [];
      let subsector_labels = [];

      for (let i = 0; i < subsector_data_filtered.length; i ++) {

        const subsector = subsector_data_filtered[i].subsector;

        subsector_data_filtered[i].change = subsector_base_data_filtered.find(x => x.subsector === subsector)?.value - subsector_data_filtered[i].value || 0;
        subsector_data_filtered[i].pct_change = subsector_base_data_filtered.find(x => x.subsector === subsector)?.value ? Math.abs(subsector_data_filtered[i].change / subsector_base_data_filtered.find(x => x.subsector === subsector)?.value * 100) : 0;

        let subsector_line_values = [];

        for (let j = 0; j < years.length; j++) {
          const year = years[j];
          const value = GHGALL.data[GHGALL_stat][year]["Northern Ireland"][subsector] ? GHGALL.data[GHGALL_stat][year]["Northern Ireland"][subsector] / 1000 : 0;
          subsector_line_values.push(value);
        }

        subsector_lines.push(subsector_line_values);
        let subsector_tidy;
        if (subsector.indexOf(sectorNameTidy(sector)) == 0) {
            subsector_tidy = subsector.replace(`${sectorNameTidy(sector)} `, "")
        } else if (subsector.indexOf("Net Emissions: ") == 0) {
            subsector_tidy = subsector.replace("Net Emissions: ", "")
        } else {
            subsector_tidy = subsector;
        }


        subsector_labels.push(subsector_tidy);
      }


      const greatest_increase = subsector_data_filtered.reduce((max, item) => item.change > max.change ? item : max, subsector_data_filtered[0]);
      const greatest_decrease = subsector_data_filtered.reduce((min, item) => item.change < min.change ? item : min, subsector_data_filtered[0]);

      insertValue("most-worsened-pct", greatest_increase.pct_change.toFixed(0));
      insertValue("most-worsened-name", greatest_increase.subsector);
      insertValue("most-improved-pct", greatest_decrease.pct_change.toFixed(0));
      insertValue("most-improved-name", greatest_decrease.subsector);

      if (subsector_chart) {
        subsector_chart.destroy();
        subsector_expand.destroy();
      }

    subsector_chart = createLineChart({
        years,
        lines: subsector_lines,
        labels: subsector_labels,
        unit: "MtCO2e",
        canvas_id: "subsector-line"
    })

    subsector_expand = createLineChart({
        years,
        lines: subsector_lines,
        labels: subsector_labels,
        unit: "MtCO2e",
        canvas_id: "subsector-line-expanded"
    })

    const gases = Object.keys(GHGALL.data)
        .filter((x) => x != "Total GHG");

    const bar_years = [first_year, latest_year];

    const bar_datasets = gases.map((gas, i) => ({
        label: gas,
        data: bar_years.map((yr) => {
            const v = GHGALL.data[gas][yr]?.["Northern Ireland"]?.[sector];
            return Number.isFinite(v) ? v : null; // null -> gaps if missing
        }),
        backgroundColor: chart_colours[i % chart_colours.length]
    }));

    let bar_years_display = [];
    for (let i = 0; i < bar_years.length; i ++) {
        if (bar_years[i] == first_year) {
            bar_years_display[i] = "Base Year"
        } else {
            bar_years_display[i] = bar_years[i]
        }
    }

    // Bar chart (stacked over time: one bar per year, stacks = sectors)

    if (gas_chart) {
        gas_chart.destroy();
        gas_expand.destroy();
    }
    
    const bar_canvas = document.getElementById("gas-bar");
    const bar_canvas_expanded = document.getElementById("gas-bar-expanded");

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
            // keep legend defaults (you didn't disable it before)
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

    gas_chart = new Chart(bar_canvas, bar_config);
    gas_expand = new Chart(bar_canvas_expanded, bar_config);


    }

    

    
    update_cards();
    sector_select.onchange = update_cards;

    downloadButton("subsector-line-capture", "GHGALL", update_date);
    downloadButton("gas-bar-capture", "GHGALL", update_date);

    



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