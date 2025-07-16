
export const ESTABLISHMENT_TYPE_LABELS = {
  Hotel: 0,
  Hostel: 1,
  Villa: 2,
  Apartment: 3,
  Cottage: 4
};

export const ESTABLISHMENT_FEATURE_LABELS = {
  Parking: 0,
  Pool: 1,
  Beach: 2,
  Fishing: 3,
  Sauna: 4,
  Restaurant: 5,
  Smoking: 6,
  AccessibleForDisabled: 7,
  ElectricCarCharging: 8,
  Elevator: 9
};

export const APARTMENT_FEATURE_LABELS = {
  FreeWifi: 0,
  AirConditioning: 1,
  Breakfast: 2,
  Kitchen: 3,
  TV: 4,
  Balcony: 5,
  Bathroom: 6,
  PetsAllowed: 7
};

export function decodeFlags(enumValue, LABELS) {
  const result = [];
  let flag = 1;
  for (const key in LABELS) {
    if ((enumValue & flag) !== 0) result.push(LABELS[key]);
    flag <<= 1;
  }
  return result.join(', ');
}

export function getEstablishmentTypeName(typeId) {
  const entry = Object.entries(ESTABLISHMENT_TYPE_LABELS)
    .find(([key, value]) => value === typeId);
  return entry ? entry[0] : "";
}
