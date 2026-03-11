export  function getSectors (data) {
        return Object.keys(data)
        .filter(x =>
            (x.includes(" total") || x.includes(" net emissions")) &&
            x !== "Grand total" &&
            !x.includes("Public sector")
        )
        .sort((a, b) => a.localeCompare(b, 'en-GB'));
     }