import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const STATES_URL = 'https://countriesnow.space/api/v0.1/countries/states';
const CITIES_URL = 'https://countriesnow.space/api/v0.1/countries';

async function fetchJson(url, init = {}, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

function cleanText(value) {
  return String(value || '').trim();
}

async function run() {
  const startedAt = new Date().toISOString();
  console.log(`[sync-location-db] Starting sync at ${startedAt}`);

  const [statesPayload, citiesPayload] = await Promise.all([
    fetchJson(STATES_URL),
    fetchJson(CITIES_URL),
  ]);

  if (!statesPayload || !Array.isArray(statesPayload.data)) {
    throw new Error('Invalid states payload from countriesnow API');
  }
  if (!citiesPayload || !Array.isArray(citiesPayload.data)) {
    throw new Error('Invalid cities payload from countriesnow API');
  }

  const cityMapByCountryName = new Map();
  for (const country of citiesPayload.data) {
    const name = cleanText(country.country);
    if (!name) continue;
    const cities = Array.isArray(country.cities)
      ? Array.from(new Set(country.cities.map(cleanText).filter(Boolean))).sort((a, b) => a.localeCompare(b))
      : [];
    cityMapByCountryName.set(name, cities);
  }

  const countries = statesPayload.data
    .map((country) => {
      const name = cleanText(country.name);
      const states = Array.isArray(country.states)
        ? country.states
            .map((s) => ({
              name: cleanText(s.name),
              code: cleanText(s.state_code),
              cities: [],
            }))
            .filter((s) => s.name)
            .sort((a, b) => a.name.localeCompare(b.name))
        : [];

      return {
        name,
        iso2: cleanText(country.iso2),
        iso3: cleanText(country.iso3),
        states,
        cities: cityMapByCountryName.get(name) || [],
      };
    })
    .filter((c) => c.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  const db = {
    version: 1,
    syncedAt: new Date().toISOString(),
    source: {
      name: 'countriesnow.space',
      endpoints: [STATES_URL, CITIES_URL],
    },
    stats: {
      countryCount: countries.length,
      stateCount: countries.reduce((sum, c) => sum + c.states.length, 0),
      cityCount: countries.reduce((sum, c) => sum + c.cities.length, 0),
    },
    countries,
  };

  const outPath = resolve(process.cwd(), 'public', 'data', 'location-db.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(db), 'utf8');

  console.log(`[sync-location-db] Wrote ${outPath}`);
  console.log(`[sync-location-db] Countries=${db.stats.countryCount}, States=${db.stats.stateCount}, Cities=${db.stats.cityCount}`);
}

run().catch((err) => {
  console.error('[sync-location-db] Failed:', err.message);
  process.exitCode = 1;
});
