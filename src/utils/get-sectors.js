export  function getSectors (data) {
        return Object.keys(data)
        .filter(x =>
            (x.includes("TOTAL") || x.includes("NET EMISSIONS")) &&
            x !== "GRAND TOTAL" &&
            !x.includes("PUBLIC SECTOR")
        )
        .sort((a, b) => a.localeCompare(b, 'en-GB'));
     }