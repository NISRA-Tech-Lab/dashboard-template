library(tidyverse)

wide <- read_csv(
  "private/data/GHGEMSSNS.csv",
  show_col_types = FALSE
)

# Missing:
# Grand Total rows for all pollutants and subsectors
# Gas values for sector totals
# All pollutants values for sub-sectors

gas_grand_totals <- wide %>% 
  filter(!grepl("Total", TES_Subsector)) %>% 
  mutate(TES_Subsector = "Grand Total") %>% 
  group_by(RegionName, TES_Subsector, Pollutant) %>% 
  summarise(across(where(is.numeric), sum, na.rm = TRUE), .groups = "drop")

grand_totals <- gas_grand_totals %>% 
  mutate(Pollutant = "ALL") %>% 
  group_by(RegionName, TES_Subsector, Pollutant) %>% 
  summarise(across(where(is.numeric), sum, na.rm = TRUE), .groups = "drop")

sector_gas_totals <- wide %>% 
  filter(!grepl("Total", TES_Subsector),
         TES_Subsector != "Waste") %>% 
  mutate(TES_Subsector = case_when(
    TES_Subsector %in% c("Agricultural combustion", "Agricultural soils", "Livestock", "Other agriculture") ~ "Agriculture Total",
    TES_Subsector %in% c("Commercial buildings", "Other buildings and product uses", "Public sector buildings", "Residential buildings") ~ "Buildings and product uses Total",
    TES_Subsector %in% c("Civil aviation", "Other domestic transport", "Railways", "Road", "Waterborne") ~ "Domestic transport Total",
    TES_Subsector %in% c("Power stations") ~ "Electricity supply Total",
    TES_Subsector %in% c("Oil and gas supply", "Solid fuel supply") ~ "Fuel supply Total",
    TES_Subsector %in% c("Industrial processes", "Industrial fuel combustion", "Other industry") ~ "Industry Total",
    TES_Subsector %in% c("Bioengergy crops", "Cropland mineral soils change", "Forestry", "Grassland mineral soils change", "Other LULUCF", "Peatland", "Settlement") ~ "LULUCF Total",
    TRUE ~ TES_Subsector)) %>% 
  group_by(RegionName, TES_Subsector, Pollutant) %>% 
  summarise(across(where(is.numeric), sum, na.rm = TRUE), .groups = "drop")

subsector_gas_totals <- wide %>% 
  filter(!grepl("Total", TES_Subsector),
         TES_Subsector != "Waste") %>% 
  mutate(Pollutant = "ALL") %>% 
  group_by(RegionName, TES_Subsector, Pollutant) %>% 
  summarise(across(where(is.numeric), sum, na.rm = TRUE), .groups = "drop")

wide_fixed <- bind_rows(
  wide,
  gas_grand_totals,
  grand_totals,
  sector_gas_totals,
  subsector_gas_totals
)

long <- wide_fixed %>%
  pivot_longer(
    cols = matches("^(19|20)\\d{2}$"),
    names_to = "YEAR",
    values_to = "VALUE"
  )


write_csv(
  long,
  "private/data/GHGEMSSNS_long.csv",
  na = ""
)


# rename table

long <- read_csv(
  "private/data/GHGEMSSNS_long.csv",
  show_col_types = FALSE
)

long <- long %>%
  mutate(
    CTRY24CD = case_when(
      RegionName == "England" ~ "E92000001",
      RegionName == "Wales" ~ "W92000004",
      RegionName == "Scotland" ~ "S92000003",
      RegionName == "Northern Ireland" ~ "N92000002",
      TRUE ~ NA_character_
    )
  )

tes_lookup <- tribble(
  ~TES_Subsector, ~TES_CODE,
  
  # Agriculture
  "Agricultural combustion", "1",
  "Agricultural combustion Total", "1",
  "Agricultural soils", "2",
  "Agricultural soils Total", "2",
  "Livestock", "3",
  "Livestock Total", "3",
  "Other agriculture", "4",
  "Other agriculture Total", "4",
  "Agriculture Total", "5",
  
  # Waste
  "Waste", "6",
  "Waste Total", "6",
  
  # Buildings
  "Commercial buildings", "7",
  "Public sector buildings", "9",
  "Residential buildings", "10",
  "Buildings and product uses Total", "11",
  "Other buildings and product uses", "35",
  
  
  # Transport
  "Civil aviation", "12",
  "Other domestic transport", "13",
  "Railways", "14",
  "Road", "15",
  "Waterborne", "16",
  "Domestic transport Total", "17",
  
  # Energy supply
  "Power stations", "18",
  "Electricity supply Total", "19",
  "Oil and gas supply", "20",
  "Solid fuel supply", "21",
  "Fuel supply Total", "22",
  
  # Industry
  "Industrial processes", "23",
  "Industrial fuel combustion", "24",
  "Other industry", "25",
  "Industry Total", "26",
  
  # LULUCF
  "Bioenergy crops", "27",
  "Cropland mineral soils change", "28",
  "Forestry", "29",
  "Grassland mineral soils change", "30",
  "Other LULUCF", "31",
  "Peatland", "32",
  "Settlement", "33",
  "LULUCF Total", "34",
  
  # Grand Total
  "Grand Total", "ALL"
  
)

long <- long %>%
  left_join(tes_lookup, by = "TES_Subsector")

table(long$TES_CODE, useNA = "ifany")

write_csv(
  long,
  "private/data/GHGEMSSNS_long_coded.csv",
  na = ""
)


anti_join(
  long %>% distinct(TES_Subsector),
  tes_lookup,
  by = "TES_Subsector"
)



