# DAERA Greenhouse Gas Dashboard

An exemplar static dashboard presenting greenhouse gas emissions data. Built with HTML, modular JavaScript, and R for data preparation.

---

## 1. Overview
This dashboard provides interactive charts, maps, and summary statistics to monitor greenhouse gas emissions in Northern Ireland. Data is sourced from official datasets and preprocessed using R.

---

## 2. Folder Structure
```
repo-root/
├── assets/                # CSS, images, icons
├── public/                # Data and map styles
│   ├── data/data.json     # Preprocessed data for charts
│   └── map/               # GeoJSON and map style
├── src/                   # JavaScript source
│   ├── utils/             # Reusable helper functions
│   ├── *.js               # Page-specific scripts
│   └── r/                 # R scripts for data preparation
│       ├── data.R
│       └── pivot_long.R
├── *.html                 # Dashboard pages
└── dashboard-template.Rproj # RStudio project file
```

---

## 3. How Modularisation Works
Each HTML page loads a **corresponding JS module**:
```html
<script type="module" src="src/sector-emissions.js"></script>
```
The JS module:
- Imports shared helpers from `src/utils/`
- Fetches data from `public/data/data.json`
- Builds charts/maps and wires up interactions

---

## 4. Worked Example: Sector Emissions Page

### HTML Highlights
- Dynamic header and footer placeholders:
```html
<banner id="banner"></banner>
<nav id="nav"></nav>
<footer id="footer"></footer>
```
- Main content includes:
  - Sector selection dropdown
  - Charts for emissions by sector and subsector
  - Info boxes for definitions and sources

### JS Highlights
Imports utilities:
```js
import { insertHeader, insertFooter, insertNavButtons, insertHead } from "./utils/page-layout.js";
import { readData } from "./utils/read-data.js";
import { createLineChart } from "./utils/charts.js";
import { updateYearSpans } from "./utils/update-years.js";
import { insertValue } from "./utils/insert-value.js";
import { populateInfoBoxes } from "./utils/info-boxes.js";
import { downloadButton } from "./utils/download-button.js";
import { sectorNameTidy } from "./utils/to-title-case.js";
import { insertExpandButtons } from "./utils/expand-buttons.js";
import { reshapeForTreemap } from "./utils/reshape-for-treemap.js";
import { getSectors } from "./utils/get-sectors.js";
```

Fetches data and updates DOM:
```js
let GHGEMSSNS = await readData("GHGEMSSNS");
const stat = "CO2 equivalent emissions";
updateYearSpans(GHGEMSSNS, stat);
```

Creates charts:
```js
createLineChart({ years, lines: [line_data], labels: ["Emissions"], unit: "kt CO2e", canvas_id: "emissions-line" });
```

Populates info boxes:
```js
populateInfoBoxes(["Definitions", "Source", "What does the data mean?"], [htmlContent1, htmlContent2, htmlContent3]);
```

---

## 5. Getting Started (Recommended Workflow)

### Install VS Code
Download and install from _Visual Studio Code_ from the ITAssist Store.

### Clone the Repo in VS Code
- Open VS Code → `View > Command Palette` → `Git: Clone`
- Paste the repo URL:
```
https://github.com/NISRA-Tech-Lab/dashboard-template
```

### Install Live Server Extension
- In VS Code, go to Extensions → Search for **Live Server** → Install.

### Run the Dashboard
- Open `index.html` in VS Code.
- Click **Go Live** (bottom-right corner).
- The site will open in your browser with auto-refresh on changes.

---

## 6. Data Preparation (`src/r/`)
Run in RStudio:
```r
source("src/r/data.R")
source("src/r/pivot_long.R")
```
This regenerates `public/data/data.json` from the data sources.

---

## 7. Adding a New Page
1. Duplicate an existing HTML file.
2. Create a matching JS module in `src/`.
3. Import utilities and fetch data:
```js
import { readData } from './utils/read-data.js';
import { createBarChart } from './utils/charts.js';
```
4. Link the JS in your HTML:
```html
<script type="module" src="src/new-page.js"></script>
```

---

## 8. Utilities Reference (`src/utils/`)
Each file in `src/utils/` provides reusable helpers:
- **charts.js**: Chart creation functions (`createLineChart`, `createBarChart`).
- **read-data.js**: Loads preprocessed JSON data.
- **update-years.js**: Updates year spans in DOM.
- **insert-value.js**: Inserts values into elements.
- **info-boxes.js**: Builds accordion-style info boxes.
- **page-layout.js**: Inserts header, footer, and navigation.
- **plot-map.js**: Renders interactive maps.
- **load-shapes.js**: Fetches GeoJSON shapes.
- **download-button.js**: Adds download functionality.
- **expand-buttons.js**: Inserts expand/collapse buttons.
- **get-sectors.js**: Retrieves sector data.
- **reshape-for-treemap.js**: Reshapes data for treemap charts.
- **to-title-case.js**: Converts strings to title case.
- **wrap-label.js**: Wraps long chart labels.
- **get-nested.js**: Safely accesses nested object properties.
- **get-selected-gender.js**: Reads selected gender from radio buttons.

---

## 9. Accessibility & Best Practices
- Use **high-contrast colours**.
- Add **ARIA roles** for interactive elements.
- Ensure charts have **text alternatives** for screen readers.
- Test responsiveness on mobile and desktop.

---

## 10. How to Add a New Chart or Info Box

### Adding a New Chart
1. Identify the HTML page where you want the chart.
2. Add a `<canvas>` element inside the appropriate section:
```html
<canvas id="my-new-chart" class="chart-canvas"></canvas>
```
3. In the corresponding JS file:
   - Import chart utilities:
```js
import { createBarChart, createBarChartData } from "./utils/charts.js";
```
   - Fetch data and prepare chart data:
```js
const data = await readData("GHGEMSSNS");
const chart_data = createBarChartData({ data, stat: "CO2 equivalent emissions", year: latest_year, categories: ["Category1", "Category2"] });
```
   - Render the chart:
```js
createBarChart({ chart_data, categories: ["Category1", "Category2"], canvas_id: "my-new-chart", label_format: "%" });
```

### Adding a New Info Box
1. In the HTML page, ensure there is a container for info boxes:
```html
<div id="info-boxes"></div>
```
2. In the JS file, use `populateInfoBoxes`:
```js
populateInfoBoxes([
  "Title 1", "Title 2"
], [
  "<p>Content for box 1</p>",
  "<p>Content for box 2</p>"
]);
```
This will dynamically create accordion-style info boxes with your content.

### Adding a New Value Using `insertValue`
1. In the HTML page, create a `<span>` element with a unique ID:
```html
<p><span id="my-new-value"></span> new statistic</p>
```
2. In the JS file, after fetching data, call `insertValue`:
```js
import { insertValue } from "./utils/insert-value.js";
insertValue("my-new-value", data.data["CO2 equivalent emissions"][latest_year]["Northern Ireland"]);
```
This will insert the value dynamically into the span.

---
