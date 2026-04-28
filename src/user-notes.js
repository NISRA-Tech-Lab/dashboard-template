import { insertHeader, insertFooter, insertNavButtons, insertHead } from "./utils/page-layout.js";
import { updateYearSpans } from "./utils/update-years.js";
import { readData } from "./utils/read-data.js"

window.addEventListener("DOMContentLoaded", async () => {

    await insertHead("UK Comparison");
    insertHeader();
    insertNavButtons();
    insertFooter();

    const GHGEMSSNS = await readData("GHGEMSSNS");
    updateYearSpans(GHGEMSSNS, "CO2 equivalent emissions");

});