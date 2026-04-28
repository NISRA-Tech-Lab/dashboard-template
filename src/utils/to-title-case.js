export function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

export function sectorNameTidy (sector) {
  // if (sector.indexOf("LULUCF") > -1) {
  //   return "LULUCF";
  // } else {
    return sector.replace(" total", "");
  // }
}
