
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

export const PAYMENT_TYPE = {
  Cash: 0,
  Mono: 1,
  BankTransfer: 2,
};

export const PAYMENT_STATUS = {
  Pending: 0,
  Completed: 1,
  Failed: 2,
  Cancelled: 3,
};

export const USER_ROLE = {
  Admin: 0,
  Landlord: 1,
  Tenant: 2,
};

export const VIBE_TYPE = {
  None: 0,
  Beach: 1,
  Nature: 2,
  City: 3,
  Relax: 4,
  Mountains: 5,
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

export function decodeFlagsUser(mask, LABELS) {
  if (typeof mask !== "number") return [];
  const names = [];
  for (const [key, bitIndex] of Object.entries(LABELS)) {
    if ((mask & (1 << bitIndex)) !== 0) names.push(key);
  }
  return names;
}


export function getEstablishmentTypeName(typeId) {
  const entry = Object.entries(ESTABLISHMENT_TYPE_LABELS)
    .find(([key, value]) => value === typeId);
  return entry ? entry[0] : "";
}

export function normalizeFeaturesForCheckboxes(backendFeatures, LABELS) {
  const result = {};
  Object.keys(LABELS).forEach(enumKey => {
    const backendKey = enumKey.charAt(0).toLowerCase() + enumKey.slice(1);
    result[enumKey] = backendFeatures ? !!backendFeatures[backendKey] : false;
  });
  return result;
}

export function featuresObjectToBitmask(featuresObj, featureLabels) {
  return Object.entries(featureLabels)
    .filter(([key]) => featuresObj[key])
    .reduce((sum, [, value]) => sum + value, 0);
}

export const displayableVibe = (vibeId) => {
    const vibes = {
    0: "None",
    1: "Beach",
    2: "Nature",
    3: "City",
    4: "Relax",
    5: "Mountains",
    };
    return vibes[vibeId] || "None";
}

export const displayableEstablishmentType = (typeId) => {
    const types = {
    0: "Hotel",
    1: "Hostel",
    2: "Villa",
    3: "Apartment",
    4: "Cottage",
    };
    return types[typeId] || "Unknown Type";
}

