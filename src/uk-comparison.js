import { insertHeader, insertFooter, insertNavButtons, insertHead } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js"
import { chart_colours } from "./utils/charts.js";
import { latest_year, first_year, last_year, updateYearSpans } from "./utils/update-years.js";
import { insertValue } from "./utils/insert-value.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { downloadButton } from "./utils/download-button.js";

import { insertExpandButtons } from "./utils/expand-buttons.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("UK Comparison");
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

    // Total Emissions box

    const regions = Object.keys(GHGEMSSNS.data[stat][latest_year]);
    
    let ghg_uk = 0;
    let ghg_uk_last = 0;
    let ghg_uk_base = 0;
    let region_totals = {};

    for (let i = 0; i < regions.length; i ++) {
        let region_value = GHGEMSSNS.data[stat][latest_year][regions[i]]["Grand total"]["All pollutants"] / 1000;
        let region_value_last = GHGEMSSNS.data[stat][last_year][regions[i]]["Grand total"]["All pollutants"] / 1000;
        let region_value_base = GHGEMSSNS.data[stat][first_year][regions[i]]["Grand total"]["All pollutants"] / 1000;
        region_totals[regions[i]] = region_value;
        ghg_uk += region_value;
        ghg_uk_last += region_value_last;
        ghg_uk_base += region_value_base;
    }


    insertValue("ghg-uk", ghg_uk.toFixed(2));

    const ghg_change_value = ghg_uk_last - ghg_uk;
    const ghg_pct_change = Math.abs(ghg_change_value / ghg_uk_last * 100).toFixed(0);
    let ghg_change_string;

    if (ghg_change_value < 0) {
        ghg_change_string = `↑ up ${ghg_pct_change}`
    } else {
        ghg_change_string = `↓ down ${ghg_pct_change}`
    }

    insertValue("ghg-change", ghg_change_string);

    const ghg_change_value_base = ghg_uk_base - ghg_uk;
    const ghg_pct_change_base = Math.abs(ghg_change_value_base / ghg_uk_base * 100).toFixed(0);
    let ghg_change_string_base;

    if (ghg_change_value_base < 0) {
        ghg_change_string_base = `↑ up ${ghg_pct_change_base}`
    } else {
        ghg_change_string_base = `↓ down ${ghg_pct_change_base}`
    }

    insertValue("ghg-change-base", ghg_change_string_base);
    


    // Gas bar
    const bar_regions = ["Northern Ireland", "UK"];
    const bar_gases = ["Carbon Dioxide", "Methane", "Nitrous Oxide", "Fluourinated and other gases"];
    const gases = Object.keys(GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]["Grand total"])
        .filter(x => x != "All pollutants");

    let grouped_gas_data = {
        "Northern Ireland": {},
        "UK": {}
    };   
 
    let other_value = 0;
    let other_value_uk = 0;
    for (let i = 0; i < gases.length; i ++) {
        let gas = gases[i];
        if (gas == "CO2") {
            let co2_uk = 0;
            for (let j = 0; j < regions.length; j ++) {
                co2_uk += GHGEMSSNS.data[stat][latest_year][regions[j]]["Grand total"][gas] / 1000;
            }
            grouped_gas_data["Northern Ireland"]["Carbon Dioxide"] = GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]["Grand total"][gas] / 1000 / region_totals["Northern Ireland"] * 100;
            grouped_gas_data["UK"]["Carbon Dioxide"] = co2_uk / ghg_uk * 100;
        } else if (gas == "CH4") {
            let ch4_uk = 0;
            for (let j = 0; j < regions.length; j ++) {
                ch4_uk += GHGEMSSNS.data[stat][latest_year][regions[j]]["Grand total"][gas] / 1000;
            }
            grouped_gas_data["Northern Ireland"]["Methane"] = GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]["Grand total"][gas] / 1000 / region_totals["Northern Ireland"] * 100;
            grouped_gas_data["UK"]["Methane"] = ch4_uk / ghg_uk * 100;
        } else if (gas == "N2O") {
            let n2o_uk = 0;
            for (let j = 0; j < regions.length; j ++) {
                n2o_uk += GHGEMSSNS.data[stat][latest_year][regions[j]]["Grand total"][gas] / 1000;
            }
            grouped_gas_data["Northern Ireland"]["Nitrous Oxide"] = GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]["Grand total"][gas] / 1000 / region_totals["Northern Ireland"] * 100;
            grouped_gas_data["UK"]["Nitrous Oxide"] = n2o_uk / ghg_uk * 100;
        } else {
            let other_uk = 0;
            for (let j = 0; j < regions.length; j ++) {
                other_uk += GHGEMSSNS.data[stat][latest_year][regions[j]]["Grand total"][gas] / 1000;
            }
            other_value += GHGEMSSNS.data[stat][latest_year]["Northern Ireland"]["Grand total"][gas] / 1000;
            other_value_uk += other_uk;
        }
    }

    grouped_gas_data["Northern Ireland"]["Fluourinated and other gases"] = other_value / region_totals["Northern Ireland"] * 100;
    grouped_gas_data["UK"]["Fluourinated and other gases"] = other_value_uk / ghg_uk * 100;

    insertValue("co2-uk",grouped_gas_data["UK"]["Carbon Dioxide"].toFixed(0));

    let bar_datasets = []
    for (let i = 0; i < bar_gases.length; i ++) {
        bar_datasets[i] = {
            label: bar_gases[i],
            data: [grouped_gas_data["Northern Ireland"][bar_gases[i]], grouped_gas_data["UK"][bar_gases[i]]],
            backgroundColor: chart_colours[i]
        }
    }

    const bar_canvas = document.getElementById("gas-bar");
    const bar_canvas_expanded = document.getElementById("gas-bar-expanded");

    const bar_data = {
        labels: bar_regions,
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
            },
            tooltip: {
        callbacks: {
          label: function(context) {
            let value = context.raw;
            let label = context.dataset.label;
            return label + ": " +value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })  + "%";
          }
        }
      }
        },
        scales: {
            x: { stacked: true,
                grid: {
              display: false
            }
             },
            y: { stacked: true,
                max: 100
             }
        }
        }
    };

    new Chart(bar_canvas, bar_config);
    new Chart(bar_canvas_expanded, bar_config);

    const gas_bar_query = {
        "TLIST(A1)": latest_year,
        "TES_SUBSECTOR": "ALL"
    };

    downloadButton("gas-bar-capture", "GHGEMSSNS", update_date, gas_bar_query);
    
    // Historic comparison
    const bar_years = [first_year, last_year, latest_year];
    const bar_year_labels = ["Base Year", last_year, latest_year]

    let historic_bar_datasets = [];

    for (let i = 0; i < regions.length; i ++) {
        let region_data = [];
        for (let j = 0; j < bar_years.length; j ++) {
            let year = bar_years[j];
            region_data.push(GHGEMSSNS.data[stat][year][regions[i]]["Grand total"]["All pollutants"] / 1000);
        }
        historic_bar_datasets[i] = {
            label: regions[i],
            data: region_data,
            backgroundColor: chart_colours[i]
        };
    }

    

    const historic_bar_canvas = document.getElementById("historic-bar");
    const historic_bar_canvas_expanded = document.getElementById("historic-bar-expanded");

    const historic_bar_data = {
        labels: bar_year_labels,
        datasets: historic_bar_datasets
    };

    const historic_bar_config = {
        type: "bar",
        data: historic_bar_data,
        options: {
        maintainAspectRatio: false,
        plugins: {
            title: {
            display: false
            },
            tooltip: {
        callbacks: {
          label: function(context) {
            let value = context.raw;
            let label = context.dataset.label;
            return label + ": " +value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
          }
        }
      }
            
        },
        scales: {
            x: { stacked: true,
                grid: {
              display: false
            }
             },
            y: { stacked: true
               
             }
        }
        }
    };

    new Chart(historic_bar_canvas, historic_bar_config);
    new Chart(historic_bar_canvas_expanded, historic_bar_config);

    const historic_bar_query = {
        "TLIST(A1)": [first_year, last_year, latest_year],
        "TES_SUBSECTOR": "ALL",
        "POLLUTANTS": "ALL"
    };

    downloadButton("historic-bar-capture", "GHGEMSSNS", update_date, historic_bar_query);
    
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