'use server';

export interface LocationResult {
  flag: string;
  city: string;
  country: string;
  formatted: string; // "{countryFlag} city, country"
}

let cachedData: { country: string; flag: string; cities: string[] }[] | null = null;

// Fetch and combine countries, flags, and cities once (cached server-side)
async function getAllLocationData() {
  if (cachedData) return cachedData;

  try {
    const [countriesRes, flagsRes] = await Promise.all([
      fetch("https://countriesnow.space/api/v0.1/countries", { next: { revalidate: 86400 } }), // Cache for 1 day
      fetch("https://countriesnow.space/api/v0.1/countries/flag/images", { next: { revalidate: 86400 } })
    ]);

    const countriesData = await countriesRes.json();
    const flagsData = await flagsRes.json();

    const flagsMap = new Map<string, string>();
    if (!flagsData.error && Array.isArray(flagsData.data)) {
      flagsData.data.forEach((item: { name: string; flag: string }) => {
        flagsMap.set(item.name.toLowerCase(), item.flag);
      });
    }

    if (!countriesData.error && Array.isArray(countriesData.data)) {
      cachedData = countriesData.data.map((item: { country: string; cities: string[] }) => ({
        country: item.country,
        flag: flagsMap.get(item.country.toLowerCase()) || "🏳️",
        cities: item.cities || []
      }));
      return cachedData;
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
  }
  return [];
}

export async function searchLocations(query: string): Promise<LocationResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const data = await getAllLocationData();
  if (!data) {
    return [];
  }
  const results: LocationResult[] = [];

  for (const item of data) {
    const isCountryMatch = item.country.toLowerCase().includes(q);

    for (const city of item.cities) {
      const isCityMatch = city.toLowerCase().includes(q);

      if (isCityMatch || isCountryMatch) {
        results.push({
          flag: item.flag,
          city: city,
          country: item.country,
          formatted: `${city}, ${item.country}`
        });

        // Limit results to top 30 matches for snappy response
        if (results.length >= 30) return results;
      }
    }
  }

  return results;
}