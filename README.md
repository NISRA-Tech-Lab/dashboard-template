# NISRA Dashboard Template

> ### 💀 _Part of the [NISRA Dashboard Skeleton](https://datavis.nisra.gov.uk/techlab/drpvze/dashboard-skeleton.html)_

A reusable template for NISRA statisticians to build interactive static dashboards. Built with HTML, modular JavaScript, and R for data preparation.

---

## 1. Overview

This repository is a **template and toolkit** for creating data-driven dashboards. It provides:
- Reusable helper functions for charts, maps, and layouts
- A modular JavaScript architecture
- R scripts for data preprocessing
- Pre-configured styling and accessibility features

**Recommended workflow**: Fork this repository and build your dashboard in your fork. This allows you to receive updates to the template (new features, accessibility improvements, branding changes) and pull them into your fork as needed.

For a fully worked example, see the [dashboard-demo repository](https://github.com/NISRA-Tech-Lab/dashboard-demo).

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
│       └── data.R
├── *.html                 # Dashboard pages
└── dashboard-template.Rproj # RStudio project file
```

---

## 3. How Modularisation Works

Each HTML page loads a **corresponding JS module**:
```html
<script type="module" src="src/page.js"></script>
```

The JS module:
- Imports shared helpers from `src/utils/`
- Fetches data from `public/data/data.json`
- Builds charts, maps, and interactive elements
- Wires up event listeners and interactions

This modular approach keeps your code organised and reusable across multiple pages.

---

## 4. Worked Example

For a complete, fully-worked example with production-ready implementations, see the [dashboard-demo repository](https://github.com/NISRA-Tech-Lab/dashboard-demo). This demonstrates how to:
- Structure data for different chart types
- Implement interactive features
- Customise layouts and branding
- Apply accessibility standards

---

## 5. Getting Started 

### Option A - Forking the repository (Recommended option)

Using this option will allow your dashboard to keep up to date with function updates as new branding guidance and accessibility guidelines are implemented in the template.

If your dashboard repo must remain private then use Option B.

#### Step 1a: Fork This Repository
- Go to [NISRA-Tech-Lab/dashboard-template](https://github.com/NISRA-Tech-Lab/dashboard-template)
- Click the **Fork** button (top-right) to create your own copy
- This allows you to pull future updates from the template while maintaining your own customisations

### Option B - Using this repository as a template

This option creates a full copy of the template on your branch's Github organisation page, however functional changes made to the template will not be tracked and this may require more manual coding changes in future to ensure that your dashboard aligns with future branding and accessibility updates.

It is only recommended to use this option if your code must remain private. (eg, you are developing a product with not yet published data)

#### Step 1b: Use template
- Click the **Use this template** button in the top right of the page.
- Choose "Create a new repository" from the dropdown
- Change the owner to your branch's organisation and enter the name of the dashboard
- Click "Create repository"

---

#### Step 2: Clone Your repo in VS Code
- Open VS Code → Click on the Source Control panel → Click `Clone Repository`
- Paste your repo's URL, eg:
```
https://github.com/YOUR_ORGANISATION/dashboard-template
```

### Step 3: Install Live Server Extension
- In VS Code, go to Extensions → Search for **Live Server** → Install

### Step 4: Run the Dashboard
- Open `index.html` in VS Code
- Click **Go Live** (bottom-right corner)
- The site will open in your browser with auto-refresh on changes

### Reference Implementation
For detailed implementation examples and best practices, explore the [dashboard-demo repository](https://github.com/NISRA-Tech-Lab/dashboard-demo).

---

## 6. Data Preparation (`src/r/`)

Datasets from the [NISRA Data Portal](https://data.nisra.gov.uk) can be imported using onscreen the instructions in the [Dashboard BuildR](https://github.com/NISRA-Tech-Lab/dashboard-buildr). If you wish to manually import data follow these steps:

1. Open the `src/config/config.js` script.
2. Under the `matrix` key, remove the placeholder "EXAMPLETABLE1" and "EXAMPLETABLE2" values and replace those with the MATRIX codes for your desired Data Portal tables
3. Using the [R plugin for VSCode](https://marketplace.visualstudio.com/items?itemName=REditorSupport.r) (or alternatively in RStudio) open the `src/r/data.R` script and click the Source button at the top of the screen. This regenerates `public/data/data.json` from the data sources.
4. Re-run this R script when any new matrix codes are added to the config file or to refresh dashboard figures as source tables on the Data Portal are updated.

> [!TIP]
> If Github Actions are enabled on your organisation then the Data Portal figures will automatically refresh. If developing privately (using a template) it is recommended that you disable Github Actions as this can result in account charges.

---

## 7. Adding a New Page

Adding a new page to your dashboard is best done using onscreen the instructions in the [Dashboard BuildR](https://github.com/NISRA-Tech-Lab/dashboard-buildr) user interface. If you wish to manually add a new page follow these steps:

1. Take a copy of the page.html file and rename accordingly
3. Create a matching JS module in `src/` with the same name
4. Go to `src/config/config.js` and add the page link and name to the `navigation` array.
5. Import utilities as needed:
```js
import { readData } from './utils/read-data.js';
import { createBarChart } from './utils/charts.js';
import { populateInfoBoxes } from './utils/info-boxes.js';
```
4. Link the JS in your HTML:
```html
<script type="module" src="src/new-page.js"></script>
```

For complete page implementation examples, see the [dashboard-demo repository](https://github.com/NISRA-Tech-Lab/dashboard-demo).

---

## 8. Utilities Reference (`src/utils/`)

Each file in `src/utils/` provides reusable helper functions:

- **read-data.js**: Loads preprocessed JSON data
- **update-years.js**: Updates year spans in DOM
- **insert-value.js**: Inserts calculated values into elements
- **info-boxes.js**: Creates accordion-style info boxes
- **page-layout.js**: Inserts header, footer, and navigation
- **plot-map.js**: Renders interactive maps
- **load-shapes.js**: Fetches and loads GeoJSON shapes
- **download-button.js**: Adds CSV/data download functionality
- **expand-buttons.js**: Inserts expand/collapse controls
- **wrap-label.js**: Wraps long chart labels for readability

The `src/charts` folder provides functions for plotting charts.

For detailed function signatures and usage examples, see the [dashboard-demo repository](https://github.com/NISRA-Tech-Lab/dashboard-demo).

> [!WARNING]
> It is not recommended that you alter these function files as doing so may prohibit your fork from receiving future functionality, branding and accessibility updates.

## 9. How to Add a New Chart or Info Box

Adding chart and info box content to your dashboard is best done using onscreen the instructions in the [Dashboard BuildR](https://github.com/NISRA-Tech-Lab/dashboard-buildr) user interface. If you wish to manually insert a chart follow these steps:

### Adding a New Chart
1. Identify the HTML page where you want the chart
2. Add a `<canvas>` element inside the appropriate section:
```html
<canvas id="my-chart" class="chart-canvas"></canvas>
```
3. In the corresponding JS file:
   - Import chart utilities:
```js
import { barChart } from "./charts/bar-chart.js";
import { lineChart } from "./charts/line-chart.js";
import { readData } from "./utils/read-data.js";
```
   - Fetch data and prepare chart data:
```js
const data = await readData("YourDataKey");
const chartData = {/* formatted data for chart */};
```
   - Render the chart:
```js
barChart({ chart_data: chartData, canvas_id: "my-chart", .... });
```

For complete examples, see the [dashboard-demo repository](https://github.com/NISRA-Tech-Lab/dashboard-demo).

### Adding a New Info Box
1. In the HTML page, ensure there is a container for info boxes:
```html
<div id="info-boxes"></div>
```
2. In the JS file, use `populateInfoBoxes`:
```js
import { populateInfoBoxes } from "./utils/info-boxes.js";

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
<p><span id="my-value"></span> descriptive text</p>
```
2. In the JS file, after fetching data, call `insertValue`:
```js
import { insertValue } from "./utils/insert-value.js";
insertValue("my-value", calculatedValue);
```
This will insert the value dynamically into the span.

---

# 10. Further resources

- [Dashboard demo wireframe](https://datavis.nisra.gov.uk/techlab/drpvze/nisra-dashboard-demo-wireframe.pptx) - A Powerpoint presentation containing elements that can be used to in dashboard planning
- [NISRA Dashboard BuildR](https://github.com/NISRA-Tech-Lab/dashboard-buildr) - An R package that can be used to interact with this template to automate some basic dashboard buiilding tasks.
