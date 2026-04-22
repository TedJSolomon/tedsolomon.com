const CONDITION_EMOJI = {
  Clear:        '☀️',
  Clouds:       '☁️',
  Rain:         '🌧️',
  Drizzle:      '🌦️',
  Thunderstorm: '⛈️',
  Snow:         '❄️',
  Mist:         '🌫️',
  Fog:          '🌫️',
  Haze:         '🌫️',
  Smoke:        '🌫️',
  Dust:         '🌬️',
  Sand:         '🌬️',
  Ash:          '🌋',
  Squall:       '💨',
  Tornado:      '🌪️',
};

export async function fetchWeather() {
  const key  = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const city = 'Farmingdale,NY,US';

  if (!key) return { error: 'NEXT_PUBLIC_OPENWEATHER_API_KEY not set' };

  try {
    const [curRes, fcRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=imperial`,
        { next: { revalidate: 600 } }
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=imperial&cnt=8`,
        { next: { revalidate: 600 } }
      ),
    ]);

    if (!curRes.ok) {
      const body = await curRes.json().catch(() => ({}));
      return { error: body.message || `OpenWeatherMap error ${curRes.status}` };
    }

    const cur = await curRes.json();
    let high = Math.round(cur.main.temp_max);
    let low  = Math.round(cur.main.temp_min);

    // Improve daily high/low using 24-hour forecast
    if (fcRes.ok) {
      const fc = await fcRes.json();
      const temps = (fc.list || []).map((f) => f.main.temp);
      if (temps.length) {
        high = Math.round(Math.max(high, ...temps));
        low  = Math.round(Math.min(low,  ...temps));
      }
    }

    const main = cur.weather[0]?.main || 'Clear';

    return {
      temp:        Math.round(cur.main.temp),
      feelsLike:   Math.round(cur.main.feels_like),
      high,
      low,
      condition:   main,
      description: cur.weather[0]?.description ?? main.toLowerCase(),
      emoji:       CONDITION_EMOJI[main] ?? '🌤️',
      humidity:    cur.main.humidity,
      windSpeed:   Math.round(cur.wind?.speed ?? 0),
      city:        cur.name,
    };
  } catch (err) {
    return { error: err.message };
  }
}
