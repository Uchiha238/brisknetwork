/**
 * countryAutocomplete.js — Utility for smart country matching and tab-completion.
 */

export const COUNTRY_ALIASES = {
  'USA': 'UNITED STATES',
  'US': 'UNITED STATES',
  'AMERICA': 'UNITED STATES',
  'UK': 'UNITED KINGDOM',
  'GB': 'UNITED KINGDOM',
  'ENGLAND': 'UNITED KINGDOM',
  'GREAT BRITAIN': 'UNITED KINGDOM',
  'UAE': 'UNITED ARAB EMIRATES',
  'DUBAI': 'UNITED ARAB EMIRATES',
  'NZ': 'NEW ZEALAND',
  'KSA': 'SAUDI ARABIA',
};

export const WORLD_COUNTRIES = [
  "AFGHANISTAN", "ALBANIA", "ALGERIA", "AMERICAN SAMOA", "ANDORRA", "ANGOLA", "ANGUILLA",
  "ANTIGUA", "ARGENTINA", "ARMENIA", "ARUBA", "AUSTRALIA", "AUSTRIA", "AZERBAIJAN",
  "BAHAMAS", "BAHRAIN", "BANGLADESH", "BARBADOS", "BELARUS", "BELGIUM", "BELIZE", "BENIN",
  "BERMUDA", "BHUTAN", "BOLIVIA", "BONAIRE", "BOSNIA-HERZEGOVINA", "BOTSWANA", "BRAZIL",
  "BRITISH VIRGIN ISLANDS", "BRUNEI", "BULGARIA", "BURKINA FASO", "BURUNDI", "CAMBODIA",
  "CAMEROON", "CANADA", "CAPE VERDE", "CAYMAN ISLANDS", "CENTRAL AFRICAN REPUBLIC", "CHAD",
  "CHILE", "CHINA", "COLOMBIA", "COMOROS", "CONGO", "COOK ISLANDS", "COSTA RICA",
  "COTE D IVOIRE", "CROATIA", "CUBA", "CURACAO", "CYPRUS", "CZECH REPUBLIC", "DENMARK",
  "DJIBOUTI", "DOMINICA", "DOMINICAN REPUBLIC", "EAST TIMOR", "ECUADOR", "EGYPT",
  "EL SALVADOR", "EQUATORIAL GUINEA", "ERITREA", "ESTONIA", "ESWATINI", "ETHIOPIA",
  "FAROE ISLANDS", "FIJI", "FINLAND", "FRANCE", "FRENCH GUIANA", "FRENCH POLYNESIA",
  "GABON", "GAMBIA", "GEORGIA", "GERMANY", "GHANA", "GIBRALTAR", "GREECE", "GREENLAND",
  "GRENADA", "GUADELOUPE", "GUAM", "GUATEMALA", "GUERNSEY", "GUINEA", "GUINEA-BISSAU",
  "GUYANA", "HAITI", "HONDURAS", "HONG KONG", "HUNGARY", "ICELAND", "INDIA", "INDONESIA",
  "IRAN", "IRAQ", "IRELAND", "ISRAEL", "ITALY", "JAMAICA", "JAPAN", "JERSEY", "JORDAN",
  "KAZAKHSTAN", "KENYA", "KIRIBATI", "KOREA SOUTH", "KOSOVO", "KUWAIT", "KYRGYZSTAN",
  "LAOS", "LATVIA", "LEBANON", "LESOTHO", "LIBERIA", "LIBYA", "LIECHTENSTEIN", "LITHUANIA",
  "LUXEMBOURG", "MACAU", "MACEDONIA", "MADAGASCAR", "MALAWI", "MALAYSIA", "MALDIVES",
  "MALI", "MALTA", "MARSHALL ISLANDS", "MARTINIQUE", "MAURITANIA", "MAURITIUS", "MAYOTTE",
  "MEXICO", "MICRONESIA", "MOLDOVA", "MONACO", "MONGOLIA", "MONTENEGRO", "MONTSERRAT",
  "MOROCCO", "MOZAMBIQUE", "MYANMAR", "NAMIBIA", "NAURU", "NEPAL", "NETHERLANDS",
  "NEW CALEDONIA", "NEW ZEALAND", "NICARAGUA", "NIGER", "NIGERIA", "NIUE",
  "NORTH MACEDONIA", "NORWAY", "OMAN", "PAKISTAN", "PALAU", "PANAMA", "PAPUA NEW GUINEA",
  "PARAGUAY", "PERU", "PHILIPPINES", "POLAND", "PORTUGAL", "PUERTO RICO", "QATAR",
  "REUNION ISLAND", "ROMANIA", "RUSSIA", "RWANDA", "SAINT HELENA", "SAINT LUCIA", "SAMOA",
  "SAN MARINO", "SAO TOME AND PRINCIPE", "SAUDI ARABIA", "SENEGAL", "SERBIA", "SEYCHELLES",
  "SIERRA LEONE", "SINGAPORE", "SLOVAKIA", "SLOVENIA", "SOLOMON ISLANDS", "SOMALIA",
  "SOUTH AFRICA", "SOUTH KOREA", "SOUTH SUDAN", "SPAIN", "SRI LANKA", "SUDAN", "SURINAME",
  "SWEDEN", "SWITZERLAND", "SYRIA", "TAIWAN", "TAJIKISTAN", "TANZANIA", "THAILAND",
  "TIMOR-LESTE", "TOGO", "TONGA", "TRINIDAD AND TOBAGO", "TUNISIA", "TURKEY",
  "TURKMENISTAN", "TUVALU", "UGANDA", "UKRAINE", "UNITED ARAB EMIRATES", "UNITED KINGDOM",
  "UNITED STATES", "URUGUAY", "UZBEKISTAN", "VANUATU", "VATICAN CITY", "VENEZUELA",
  "VIETNAM", "VIRGIN ISLANDS-BRITISH", "VIRGIN ISLANDS-US", "YEMEN", "ZAMBIA", "ZIMBABWE"
];

/**
 * Finds the best matching country name given user input.
 * Priority: Exact match -> Alias match -> Prefix startsWith -> Substring includes.
 */
export const getBestCountryMatch = (query, countryList = []) => {
  if (!query || typeof query !== 'string') return null;
  const q = query.trim().toUpperCase();
  if (!q) return null;

  // 1. Alias match (e.g. USA -> UNITED STATES, UK -> UNITED KINGDOM)
  if (COUNTRY_ALIASES[q]) {
    return COUNTRY_ALIASES[q];
  }

  // Combine passed master list and standard world list while preserving order
  const namesSet = new Set();
  const list = [];
  
  const add = (name) => {
    if (!name || typeof name !== 'string') return;
    const clean = name.trim().toUpperCase();
    if (clean && !namesSet.has(clean)) {
      namesSet.add(clean);
      list.push(clean);
    }
  };

  (countryList || []).forEach(c => add(typeof c === 'string' ? c : c?.name));
  WORLD_COUNTRIES.forEach(add);

  // 2. Exact match
  const exact = list.find(c => c === q);
  if (exact) return exact;

  // 3. Prefix match (e.g. "AUS" -> "AUSTRALIA")
  const startsWith = list.find(c => c.startsWith(q));
  if (startsWith) return startsWith;

  // 4. Substring match
  const contains = list.find(c => c.includes(q));
  if (contains) return contains;

  return null;
};

/**
 * Handles Enter or Tab key on country inputs to resolve known aliases (e.g. USA -> UNITED STATES).
 */
export const handleCountryKeyDown = (e, countries = [], handleChange) => {
  if (e.key === 'Tab' || e.key === 'Enter') {
    const query = (e.target.value || '').trim().toUpperCase();
    if (query && COUNTRY_ALIASES[query]) {
      const match = COUNTRY_ALIASES[query];
      e.target.value = match;
      if (handleChange) {
        handleChange({
          target: {
            name: e.target.name,
            value: match
          }
        });
      }
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    }
  }
};

/**
 * Handles blur on country inputs to resolve known aliases (e.g. USA -> UNITED STATES).
 * Leaves partial queries intact so suggestions can be freely browsed and selected.
 */
export const handleCountryBlur = (e, countries = [], handleChange) => {
  const query = (e.target.value || '').trim().toUpperCase();
  if (query && COUNTRY_ALIASES[query]) {
    const match = COUNTRY_ALIASES[query];
    e.target.value = match;
    if (handleChange) {
      handleChange({
        target: {
          name: e.target.name,
          value: match
        }
      });
    }
  }
};
