import type { City, CurrentWeather, ForecastResponse, GeocodingResponse } from '../types/openMeteo';

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_SEARCH_PARAMS = 'count=1&language=pt&format=json';
const FORECAST_VARIABLES = 'precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code';
const DEFAULT_TIMEOUT_MS = 10_000;

function createRequestController(signal?: AbortSignal) {
  if (signal?.aborted) {
    return { controller: null, cleanup: () => {} };
  }

  const controller = new AbortController();
  const handleAbort = () => controller.abort();

  if (signal) {
    signal.addEventListener('abort', handleAbort, { once: true });
  }

  const cleanup = () => {
    if (signal) {
      signal.removeEventListener('abort', handleAbort);
    }
  };

  return { controller, cleanup };
}

export async function searchCity(
  name: string | null | undefined,
  signal?: AbortSignal,
): Promise<City | null> {
  const normalizedName = typeof name === 'string' ? name.trim() : '';

  if (!normalizedName || signal?.aborted) {
    return null;
  }

  const { controller, cleanup } = createRequestController(signal);
  if (!controller) {
    return null;
  }

  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(normalizedName)}&${GEOCODING_SEARCH_PARAMS}`;

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GeocodingResponse;
    const result = payload.results?.[0];

    if (!result) {
      return null;
    }

    const { name: cityName, latitude, longitude, country_code, timezone } = result;

    if (
      typeof cityName !== 'string' || !cityName.trim() ||
      typeof latitude !== 'number' || !Number.isFinite(latitude) ||
      typeof longitude !== 'number' || !Number.isFinite(longitude) ||
      typeof country_code !== 'string' || !country_code.trim() ||
      typeof timezone !== 'string' || !timezone.trim()
    ) {
      return null;
    }

    return {
      name: cityName,
      latitude,
      longitude,
      countryCode: country_code,
      timezone,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null;
    }

    return null;
  } finally {
    clearTimeout(timeoutId);
    cleanup();
  }
}

export async function getCurrentWeather(
  params: {
    latitude: number | null | undefined;
    longitude: number | null | undefined;
    timezone: string | null | undefined;
  },
  signal?: AbortSignal,
): Promise<CurrentWeather | null> {
  const { latitude, longitude, timezone } = params;

  if (
    typeof latitude !== 'number' || !Number.isFinite(latitude) ||
    typeof longitude !== 'number' || !Number.isFinite(longitude) ||
    typeof timezone !== 'string' || !timezone.trim() ||
    signal?.aborted
  ) {
    return null;
  }

  const { controller, cleanup } = createRequestController(signal);
  if (!controller) {
    return null;
  }

  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const url = `${FORECAST_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=${FORECAST_VARIABLES}&timezone=${encodeURIComponent(timezone.trim())}`;

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ForecastResponse;
    const current = payload.current;
    const currentUnits = payload.current_units;

    if (!current || !currentUnits) {
      return null;
    }

    const requiredCurrentKeys = [
      'time',
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'wind_speed_10m',
      'wind_direction_10m',
      'precipitation_probability',
      'weather_code',
    ] as const;

    const requiredUnits = [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation_probability',
      'wind_speed_10m',
      'wind_direction_10m',
    ] as const;

    if (
      requiredCurrentKeys.some((key) => !(key in current) || current[key] === undefined || current[key] === null) ||
      requiredUnits.some((key) => !(key in currentUnits) || typeof currentUnits[key] !== 'string' || !currentUnits[key].trim())
    ) {
      return null;
    }

    const numericValues = [
      current.temperature_2m,
      current.relative_humidity_2m,
      current.apparent_temperature,
      current.precipitation_probability,
      current.wind_speed_10m,
      current.wind_direction_10m,
      current.weather_code,
    ];

    if (
      typeof current.time !== 'string' || !current.time.trim() ||
      typeof current.is_day !== 'number' || ![0, 1].includes(current.is_day) ||
      numericValues.some((value) => typeof value !== 'number' || !Number.isFinite(value))
    ) {
      return null;
    }

    return {
      time: current.time,
      temperature: Number(current.temperature_2m),
      apparentTemperature: Number(current.apparent_temperature),
      humidity: Number(current.relative_humidity_2m),
      precipitationProbability: Number(current.precipitation_probability),
      windSpeed: Number(current.wind_speed_10m),
      windDirection: Number(current.wind_direction_10m),
      isDay: current.is_day === 1,
      weatherCode: Number(current.weather_code),
      units: {
        temperature: currentUnits.temperature_2m,
        apparentTemperature: currentUnits.apparent_temperature,
        humidity: currentUnits.relative_humidity_2m,
        precipitationProbability: currentUnits.precipitation_probability,
        windSpeed: currentUnits.wind_speed_10m,
        windDirection: currentUnits.wind_direction_10m,
      },
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null;
    }

    return null;
  } finally {
    clearTimeout(timeoutId);
    cleanup();
  }
}
