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
      // cnt=40 = 5 days × 8 three-hour slots
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}&units=imperial&cnt=40`,
        { next: { revalidate: 600 } }
      ),
    ]);

    if (!curRes.ok) {
      const body = await curRes.json().catch(() => ({}));
      return { error: body.message || `OpenWeatherMap error ${curRes.status}` };
    }

    const cur       = await curRes.json();
    const todayDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    let high = Math.round(cur.main.temp_max);
    let low  = Math.round(cur.main.temp_min);

    let forecast = [];

    if (fcRes.ok) {
      const fc = await fcRes.json();

      // Improve today high/low from forecast entries
      for (const entry of fc.list ?? []) {
        const entryDate = new Date(entry.dt * 1000).toLocaleDateString('en-CA');
        if (entryDate !== todayDate) continue;
        high = Math.round(Math.max(high, entry.main.temp));
        low  = Math.round(Math.min(low,  entry.main.temp));
      }

      // Group remaining entries by day (skip today)
      const byDay = {};
      for (const entry of fc.list ?? []) {
        const date    = new Date(entry.dt * 1000);
        const dateKey = date.toLocaleDateString('en-CA');
        if (dateKey === todayDate) continue;

        if (!byDay[dateKey]) {
          byDay[dateKey] = {
            day:   date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' }),
            temps: [],
            conds: [],
          };
        }
        byDay[dateKey].temps.push(entry.main.temp);
        byDay[dateKey].conds.push(entry.weather[0]?.main ?? 'Clear');
      }

      // Build 5-day array — pick most common condition per day
      forecast = Object.values(byDay).slice(0, 5).map(({ day, temps, conds }) => {
        const counts = {};
        for (const c of conds) counts[c] = (counts[c] || 0) + 1;
        const topCond = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Clear';
        return {
          day,
          high:  Math.round(Math.max(...temps)),
          low:   Math.round(Math.min(...temps)),
          emoji: CONDITION_EMOJI[topCond] ?? '🌤️',
        };
      });
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
      forecast,
    };
  } catch (err) {
    return { error: err.message };
  }
}
