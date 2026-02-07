/**
 * Scottish Council Area URIs for statistics.gov.scot SPARQL queries
 * Maps admin district names (from Postcodes.io) to statistics.gov.scot URIs
 */

export interface CouncilArea {
  name: string;
  uri: string;
  population: number; // Approximate 2022 population for reference
}

/**
 * All 32 Scottish council areas with their statistics.gov.scot URIs
 * Admin district names match Postcodes.io admin_district field
 */
export const SCOTTISH_COUNCIL_AREAS: Record<string, CouncilArea> = {
  'Aberdeen City': {
    name: 'Aberdeen City',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000033',
    population: 227560,
  },
  'Aberdeenshire': {
    name: 'Aberdeenshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000034',
    population: 263960,
  },
  'Angus': {
    name: 'Angus',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000041',
    population: 116200,
  },
  'Argyll and Bute': {
    name: 'Argyll and Bute',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000035',
    population: 86260,
  },
  'City of Edinburgh': {
    name: 'City of Edinburgh',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000036',
    population: 527620,
  },
  'Clackmannanshire': {
    name: 'Clackmannanshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000005',
    population: 51540,
  },
  'Dumfries and Galloway': {
    name: 'Dumfries and Galloway',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000006',
    population: 148790,
  },
  'Dundee City': {
    name: 'Dundee City',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000042',
    population: 148820,
  },
  'East Ayrshire': {
    name: 'East Ayrshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000008',
    population: 122010,
  },
  'East Dunbartonshire': {
    name: 'East Dunbartonshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000045',
    population: 108750,
  },
  'East Lothian': {
    name: 'East Lothian',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000010',
    population: 108800,
  },
  'East Renfrewshire': {
    name: 'East Renfrewshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000011',
    population: 96060,
  },
  'Falkirk': {
    name: 'Falkirk',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000014',
    population: 160340,
  },
  'Fife': {
    name: 'Fife',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000047',
    population: 374130,
  },
  'Glasgow City': {
    name: 'Glasgow City',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000049',
    population: 635640,
  },
  'Highland': {
    name: 'Highland',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000017',
    population: 235540,
  },
  'Inverclyde': {
    name: 'Inverclyde',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000018',
    population: 77060,
  },
  'Midlothian': {
    name: 'Midlothian',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000019',
    population: 94680,
  },
  'Moray': {
    name: 'Moray',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000020',
    population: 95710,
  },
  'Na h-Eileanan Siar': {
    name: 'Na h-Eileanan Siar',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000013',
    population: 26500,
  },
  // Alternative name for Na h-Eileanan Siar
  'Comhairle nan Eilean Siar': {
    name: 'Na h-Eileanan Siar',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000013',
    population: 26500,
  },
  'North Ayrshire': {
    name: 'North Ayrshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000021',
    population: 134250,
  },
  'North Lanarkshire': {
    name: 'North Lanarkshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000050',
    population: 341370,
  },
  'Orkney Islands': {
    name: 'Orkney Islands',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000023',
    population: 22400,
  },
  'Perth and Kinross': {
    name: 'Perth and Kinross',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000048',
    population: 153810,
  },
  'Renfrewshire': {
    name: 'Renfrewshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000038',
    population: 179390,
  },
  'Scottish Borders': {
    name: 'Scottish Borders',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000026',
    population: 115510,
  },
  'Shetland Islands': {
    name: 'Shetland Islands',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000027',
    population: 23080,
  },
  'South Ayrshire': {
    name: 'South Ayrshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000028',
    population: 112610,
  },
  'South Lanarkshire': {
    name: 'South Lanarkshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000029',
    population: 320530,
  },
  'Stirling': {
    name: 'Stirling',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000030',
    population: 94210,
  },
  'West Dunbartonshire': {
    name: 'West Dunbartonshire',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000039',
    population: 89130,
  },
  'West Lothian': {
    name: 'West Lothian',
    uri: 'http://statistics.gov.scot/id/statistical-geography/S12000040',
    population: 185580,
  },
};

/**
 * Gets council area info from admin district name
 * Returns undefined if not found
 */
export function getCouncilAreaByName(
  adminDistrict: string
): CouncilArea | undefined {
  return SCOTTISH_COUNCIL_AREAS[adminDistrict];
}

/**
 * Gets all council area names for validation
 */
export function getAllCouncilAreaNames(): string[] {
  return Object.keys(SCOTTISH_COUNCIL_AREAS);
}
