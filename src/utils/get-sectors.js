export  function getSectors (data) {
        return Object.keys(data)
        .filter(x =>
            (x.includes(" total")) &&
            x !== "Grand total"
        )
        .sort((a, b) => a.localeCompare(b, 'en-GB'));
     }