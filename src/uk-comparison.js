import { insertHeader, insertFooter, insertNavButtons, insertHead } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js"
import { chart_colours,  createLineChart } from "./utils/charts.js";
import { latest_year, first_year, last_year, updateYearSpans, years } from "./utils/update-years.js";
import { insertValue } from "./utils/insert-value.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { downloadButton } from "./utils/download-button.js";
import { sectorNameTidy } from "./utils/to-title-case.js";
import { insertExpandButtons } from "./utils/expand-buttons.js";
import { reshapeForTreemap } from "./utils/reshape-for-treemap.js";
import { getSectors } from "./utils/get-sectors.js";

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("UK Comparison");
    insertHeader();
    insertNavButtons();
    insertExpandButtons();
    
    let GHGINVENTORY = await readData("GHGINVENTORY");
    const GHGINVENTORY_stat = "CO2 equivalent emissions";

    const update_date = new Date(GHGINVENTORY.updated).toLocaleDateString("en-GB",
        {
            day: "2-digit", 
            month: "long",
            year: "numeric"
        });

    updateYearSpans(GHGINVENTORY, GHGINVENTORY_stat);

    // Total Emissions box
    const ghg_ni = GHGINVENTORY.data[GHGINVENTORY_stat][latest_year]["Grand Total"] / 1000;

    insertValue("ghg-ni", ghg_ni.toFixed(2));


    // Gas bar
    const regions = ["NI", "UK"];

    const bar_datasets = [
        {
            label: "Carbon Dioxide",
            data: [61, 79],
            backgroundColor: chart_colours[0]
        },
        {
            label: "Methane",
            data: [30, 15],
            backgroundColor: chart_colours[1]
        },
        {
            label: "Nitrous Oxide",
            data: [7, 5],
            backgroundColor: chart_colours[2]
        },
        {
            label: "Fluourinated and other gases",
            data: [1, 2],
            backgroundColor: chart_colours[3]
        }
    ]

    const bar_canvas = document.getElementById("gas-bar");
    const bar_canvas_expanded = document.getElementById("gas-bar-expanded");

    const bar_data = {
        labels: regions,
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
            y: { stacked: true,
                max: 100
             }
        }
        }
    };

    new Chart(bar_canvas, bar_config);
    new Chart(bar_canvas_expanded, bar_config);
    downloadButton("gas-bar-capture", "GHGINVENTORY", update_date);
    

    // Historic comparison

    const bar_years = ["Base Year", last_year, latest_year];

    const historic_bar_datasets = [
        {
            label: "England",
            data: [634, 299, 285],
            backgroundColor: chart_colours[0]
        },
        {
            label: "Scotland",
            data: [80, 39, 38],
            backgroundColor: chart_colours[1]
        },
        {
            label: "Wales",
            data: [55, 36, 34],
            backgroundColor: chart_colours[2]
        },
        {
            label: "Northern Ireland",
            data: [27, 20, 18],
            backgroundColor: chart_colours[3]
        }
    ]

    const historic_bar_canvas = document.getElementById("historic-bar");
    const historic_bar_canvas_expanded = document.getElementById("historic-bar-expanded");

    const historic_bar_data = {
        labels: bar_years,
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
            
            }
            // keep legend defaults (you didn't disable it before)
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
    downloadButton("historic-bar-capture", "GHGINVENTORY", update_date);

    



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