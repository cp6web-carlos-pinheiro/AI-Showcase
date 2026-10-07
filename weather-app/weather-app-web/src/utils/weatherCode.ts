type WeatherCodeInfo = {
  description: string;
  iconKey: string;
};

const WEATHER_CODE_MAP: Record<number, WeatherCodeInfo> = {
  0: { description: 'Céu limpo', iconKey: 'clear-day' },
  1: { description: 'Predominantemente limpo', iconKey: 'clear-day' },
  2: { description: 'Parcialmente nublado', iconKey: 'partly-cloudy-day' },
  3: { description: 'Nublado', iconKey: 'cloudy' },
  45: { description: 'Neblina', iconKey: 'fog' },
  48: { description: 'Neblina com geada', iconKey: 'fog' },
  51: { description: 'Garoa fraca', iconKey: 'drizzle' },
  53: { description: 'Garoa moderada', iconKey: 'drizzle' },
  55: { description: 'Garoa intensa', iconKey: 'drizzle' },
  56: { description: 'Garoa congelante fraca', iconKey: 'drizzle' },
  57: { description: 'Garoa congelante intensa', iconKey: 'drizzle' },
  61: { description: 'Chuva fraca', iconKey: 'rain' },
  63: { description: 'Chuva moderada', iconKey: 'rain' },
  65: { description: 'Chuva forte', iconKey: 'rain' },
  66: { description: 'Chuva congelante fraca', iconKey: 'rain' },
  67: { description: 'Chuva congelante forte', iconKey: 'rain' },
  71: { description: 'Neve fraca', iconKey: 'snow' },
  73: { description: 'Neve moderada', iconKey: 'snow' },
  75: { description: 'Neve forte', iconKey: 'snow' },
  77: { description: 'Grãos de neve', iconKey: 'snow' },
  80: { description: 'Pancadas de chuva fracas', iconKey: 'showers' },
  81: { description: 'Pancadas de chuva moderadas', iconKey: 'showers' },
  82: { description: 'Pancadas de chuva violentas', iconKey: 'showers' },
  85: { description: 'Pancadas de neve fracas', iconKey: 'snow' },
  86: { description: 'Pancadas de neve fortes', iconKey: 'snow' },
  95: { description: 'Tempestade', iconKey: 'storm' },
  96: { description: 'Tempestade com granizo fraco', iconKey: 'storm' },
  99: { description: 'Tempestade com granizo forte', iconKey: 'storm' },
};

export function getWeatherCode(weatherCode: number, isDay: boolean): WeatherCodeInfo {
  const normalizedCode = Number(weatherCode);
  const entry = WEATHER_CODE_MAP[normalizedCode];

  if (!Number.isFinite(normalizedCode) || !entry) {
    return { description: 'Condição desconhecida', iconKey: 'neutral' };
  }

  if (normalizedCode === 0) {
    return {
      description: entry.description,
      iconKey: isDay ? 'clear-day' : 'clear-night',
    };
  }

  if (normalizedCode === 2) {
    return {
      description: entry.description,
      iconKey: isDay ? 'partly-cloudy-day' : 'partly-cloudy-night',
    };
  }

  return entry;
}
