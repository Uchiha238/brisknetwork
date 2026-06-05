export const calcVolumetricWt = (l, b, h) => {
  const length = parseFloat(l) || 0;
  const breadth = parseFloat(b) || 0;
  const height = parseFloat(h) || 0;
  return parseFloat(((length * breadth * height) / 5000).toFixed(2));
};

export const calcChargeableWt = (actual, vol) => {
  const actualWt = parseFloat(actual) || 0;
  const volWt = parseFloat(vol) || 0;
  return Math.max(actualWt, volWt);
};

export const roundToHalfKg = (wt) => {
  const weight = parseFloat(wt) || 0;
  return Math.ceil(weight * 2) / 2;
};

export const isDomesticCountry = (country) => {
  if (!country) return true;
  return country.trim().toUpperCase() === 'INDIA';
};
