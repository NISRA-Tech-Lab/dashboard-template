export function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export function sectorNameTidy (sector) {
  if (sector == "LULUCF NET EMISSIONS") {
    return "LULUCF";
  } else {
    return toTitleCase(sector.replace(" TOTAL", ""));
  }
}
