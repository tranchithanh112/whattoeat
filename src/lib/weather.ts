import type { Tag } from './dishes';
import type { City } from './cafes';

// Open-Meteo needs no key and sets no cookies. Only a fixed city-centre
// coordinate is sent — never the user's own location — so this adds no
// tracking surface. The host must stay listed in connect-src in vercel.json.
const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export const CITY_COORDS: Record<City, { lat: number; lon: number }> = {
  hp: { lat: 20.86, lon: 106.68 },
  hn: { lat: 21.03, lon: 105.85 },
  hcm: { lat: 10.78, lon: 106.7 },
};

export type WeatherBias = { kind: 'rain' | 'hot' | 'mild'; tempC: number };

/** Which dish tags each kind of weather argues for. */
export const BIAS_TAGS: Record<WeatherBias['kind'], Tag[]> = {
  rain: ['soup'],
  hot: ['light'],
  mild: [],
};

/** WMO codes for drizzle, rain, showers and thunderstorms. */
function isRainCode(code: number | undefined): boolean {
  if (typeof code !== 'number') return false;
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
}

export async function weatherBias(city: City, signal?: AbortSignal): Promise<WeatherBias | null> {
  const { lat, lon } = CITY_COORDS[city];
  const url = `${ENDPOINT}?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code`;
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      current?: { temperature_2m?: number; precipitation?: number; weather_code?: number };
    };
    const current = data.current;
    if (!current || typeof current.temperature_2m !== 'number') return null;

    const tempC = current.temperature_2m;
    const raining = (current.precipitation ?? 0) > 0 || isRainCode(current.weather_code);
    // Rain wins over heat: a downpour changes what you feel like eating more
    // than 33°C does in a city where 33°C is simply Tuesday.
    if (raining) return { kind: 'rain', tempC };
    if (tempC >= 32) return { kind: 'hot', tempC };
    return { kind: 'mild', tempC };
  } catch {
    // Offline, blocked, or the request was aborted. The app works without it.
    return null;
  }
}
