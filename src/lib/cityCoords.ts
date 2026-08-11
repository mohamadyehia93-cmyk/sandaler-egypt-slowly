// Approximate centre coordinates per city id. Kept in one place so both the
// region maps and the wizard's location picker can default a map view to a city.
export const EGYPT_CENTER: [number, number] = [26.8206, 30.8025];

export const cityCoords: Record<string, [number, number]> = {
  damietta: [31.4175, 31.8144],
  rosetta: [31.401, 30.4164],
  manzala: [31.16, 32.0],
  mansoura: [31.0409, 31.3785],
  tanta: [30.7865, 31.0004],
  "el-mahalla": [30.9697, 31.1667],
  fuwwah: [31.2, 30.55],
  desouk: [31.13, 30.65],
  bilbeis: [30.4214, 31.5614],
  edku: [31.3, 30.3],
  ismailia: [30.5965, 32.2715],
  "port-said": [31.2653, 32.3019],
  suez: [29.9668, 32.5498],
  luxor: [25.6872, 32.6396],
  aswan: [24.0889, 32.8998],
  minya: [28.1099, 30.7503],
  sohag: [26.5591, 31.6948],
  qena: [26.1551, 32.716],
  assiut: [27.1783, 31.1859],
  fayoum: [29.3084, 30.8428],
  edfu: [24.979, 32.8734],
  esna: [25.2919, 32.554],
  siwa: [29.2032, 25.5195],
  dahab: [28.5091, 34.5131],
  "el-arish": [31.1311, 33.7983],
  "marsa-matrouh": [31.3543, 27.2373],
  hurghada: [27.2579, 33.8116],
  "marsa-alam": [25.0693, 34.899],
  quseir: [26.0993, 34.281],
};

export const getCityCoords = (cityId?: string | null): [number, number] | null =>
  (cityId && cityCoords[cityId]) || null;

export const mapsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps?q=${lat},${lng}`;
