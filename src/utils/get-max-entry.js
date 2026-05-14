export const getMaxEntry = (obj) => {
    const entries = Object.entries(obj);
    const maxEntry = entries.reduce((max, current) => 
        current[1] > max[1] ? current : max
    );
    return { key: maxEntry[0], value: maxEntry[1] };
};
