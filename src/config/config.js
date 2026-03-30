export const config = {
    // Dashboard title
    "title": `Northern Ireland Greenhouse Gas Inventory`,

    // Set order of page links and display text in navigation bar
    "navigation": [
        { href: "index.html", text: "Home" },
        { href: "change-in-emissions.html", text: "Change in Emissions" },
        { href: "sector-comparison.html", text: "Sector Comparison" },
        { href: "sector-emissions.html", text: "Sector Emissions" },
        { href: "uk-comparison.html", text: "UK Comparison" },
        // { href: "projections.html", text: "Projections" },        
        { href: "user-notes.html", text: "User Notes" }        
    ],
    
    "portal_url": "https://data.nisra.gov.uk/",

    "logo": "assets/img/logo/DAERA_Logo_NI_white.svg",

    "matrix": [
        "GHGALL",
        "GHGINVENTORY",
        "GHGINVGAS",
        "GHGINVENTTESSUB",
        "GHGINVDA",
        "GHGEMSSNS"
    ] 
    
}