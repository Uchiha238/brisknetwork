import { getCountryIso2 } from './countryData.js';

/**
 * Looks up international postal / zip code information using Zippopotam with OpenStreetMap Nominatim fallback.
 * @param {string} postalCode
 * @param {string} [countryName]
 * @returns {Promise<{ success: boolean, city?: string, state?: string, country?: string, countryCode?: string, postalCode?: string, error?: string }>}
 */
export async function lookupPostalCode(postalCode, countryName) {
  const cleanZip = (postalCode || '').toString().trim();
  if (!cleanZip || cleanZip.length < 2) {
    return { success: false, error: 'Postal code too short' };
  }

  const iso2 = getCountryIso2(countryName);

  // 1. Try Zippopotam if ISO2 is known
  if (iso2) {
    try {
      // First attempt: exact postal code
      let res = await fetch(`https://api.zippopotam.us/${iso2}/${encodeURIComponent(cleanZip.toLowerCase())}`);

      // Second attempt: outcode/prefix if it contains spaces or dashes (e.g. UK "SW1A 1AA", Canada "M5V 2T6")
      if (!res.ok && /[\s-]/.test(cleanZip)) {
        const prefix = cleanZip.split(/[\s-]+/)[0];
        if (prefix && prefix.length >= 2) {
          res = await fetch(`https://api.zippopotam.us/${iso2}/${encodeURIComponent(prefix.toLowerCase())}`);
        }
      }

      if (res.ok) {
        const data = await res.json();
        if (data && data.places && data.places.length > 0) {
          const place = data.places[0];
          return {
            success: true,
            city: (place['place name'] || '').toUpperCase(),
            state: (place['state'] || place['state abbreviation'] || '').toUpperCase(),
            country: (countryName || data.country || '').toUpperCase(),
            countryCode: (data['country abbreviation'] || iso2).toUpperCase(),
            postalCode: cleanZip
          };
        }
      }
    } catch (err) {
      console.warn('Zippopotam lookup failed, trying fallback:', err);
    }
  }

  // 2. Try Nominatim OpenStreetMap fallback (covers all worldwide countries and addresses)
  try {
    let url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(cleanZip)}&format=json&addressdetails=1`;
    if (countryName && countryName.trim()) {
      url += `&country=${encodeURIComponent(countryName.trim())}`;
    } else if (iso2) {
      url += `&countrycodes=${encodeURIComponent(iso2)}`;
    }

    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' }
    });

    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        const addr = results[0].address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || addr.county || '';
        const state = addr.state || addr.province || addr.region || addr['ISO3166-2-lvl4'] || '';
        const country = countryName || addr.country || '';
        const code = (addr.country_code || iso2 || '').toUpperCase();

        if (city || state) {
          return {
            success: true,
            city: city.toUpperCase(),
            state: state.toUpperCase(),
            country: country.toUpperCase(),
            countryCode: code,
            postalCode: cleanZip
          };
        }
      }
    }
  } catch (err) {
    console.warn('Nominatim lookup failed:', err);
  }

  // 3. Fallback: if country is empty, try US 5-digit zip as last resort
  if (!countryName && /^\d{5}$/.test(cleanZip)) {
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.places && data.places.length > 0) {
          const place = data.places[0];
          return {
            success: true,
            city: (place['place name'] || '').toUpperCase(),
            state: (place['state'] || place['state abbreviation'] || '').toUpperCase(),
            country: 'UNITED STATES',
            countryCode: 'US',
            postalCode: cleanZip
          };
        }
      }
    } catch (err) {
      // ignore
    }
  }

  return { success: false, error: 'Location not found for postal code' };
}
