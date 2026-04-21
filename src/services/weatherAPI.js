// Open-Meteo — free, no API key, no CORS issues.
// Docs: https://open-meteo.com/en/docs

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CACHE = new Map();

export async function fetchWeatherForCity(city) {
  if (!city) return null;
  if (CACHE.has(city)) return CACHE.get(city);

  try {
    const geoRes = await fetch(`${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1`);
    const geo = await geoRes.json();
    const place = geo?.results?.[0];
    if (!place) return null;

    const { latitude, longitude } = place;
    const forecastRes = await fetch(
      `${FORECAST_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&hourly=temperature_2m,weather_code&forecast_days=1&timezone=auto`
    );
    const f = await forecastRes.json();
    const result = shapeHourly(f);
    CACHE.set(city, result);
    return result;
  } catch (e) {
    console.error('Weather fetch failed:', e);
    return null;
  }
}

function shapeHourly(f) {
  const times = f?.hourly?.time || [];
  const temps = f?.hourly?.temperature_2m || [];
  const codes = f?.hourly?.weather_code || [];

  const byHour = {};
  times.forEach((t, i) => {
    const hour = new Date(t).getHours();
    byHour[hour] = {
      temp: Math.round(temps[i]),
      code: codes[i],
      icon: wmoIcon(codes[i])
    };
  });
  return byHour;
}

// WMO weather interpretation → emoji
// https://open-meteo.com/en/docs (see weather variable docs)
function wmoIcon(code) {
  if (code === 0) return '☀️';
  if ([1, 2].includes(code)) return '🌤️';
  if (code === 3) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '🌨️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '🌡️';
}
