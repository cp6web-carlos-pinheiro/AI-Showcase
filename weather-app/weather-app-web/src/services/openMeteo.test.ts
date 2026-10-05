import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GeocodingResponse } from '../types/openMeteo';
import geocodingRio from '../test/fixtures/geocoding-rio.json';
import forecastRio from '../test/fixtures/forecast-rio.json';
import { mockFetch } from '../test/helpers/mockFetch';
import { getCurrentWeather, searchCity } from './openMeteo';

describe('RF-03: searchCity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('retorna um City válido para Rio de Janeiro', async () => {
    const mocked = mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?name=Rio%20de%20Janeiro&count=1&language=pt&format=json/,
        response: geocodingRio,
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    const city = await searchCity('Rio de Janeiro');

    expect(city).toEqual({
      name: 'Rio de Janeiro',
      latitude: -22.90642,
      longitude: -43.18223,
      countryCode: 'BR',
      timezone: 'America/Sao_Paulo',
    });
  });

  it('codifica o nome com acentos e espaços corretamente', async () => {
    const mocked = mockFetch([
      {
        url: /name=S%C3%A3o%20Paulo&count=1&language=pt&format=json/,
        response: geocodingRio,
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    await searchCity('São Paulo');

    expect(mocked.calls[0]?.url).toContain('name=S%C3%A3o%20Paulo');
  });

  it('retorna null para entradas vazias, só com espaços, null ou undefined', async () => {
    const mocked = mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        response: geocodingRio,
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    await expect(searchCity('')).resolves.toBeNull();
    await expect(searchCity('   ')).resolves.toBeNull();
    await expect(searchCity(null)).resolves.toBeNull();
    await expect(searchCity(undefined)).resolves.toBeNull();

    expect(mocked.calls).toHaveLength(0);
  });

  it('retorna null quando não há resultados', async () => {
    const mocked = mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        response: { results: [] } satisfies Partial<GeocodingResponse>,
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    await expect(searchCity('Cidade inexistente')).resolves.toBeNull();
  });

  it('retorna null quando results[0] não tem campo obrigatório', async () => {
    const mocked = mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        response: { results: [{ name: 'X' }] },
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    await expect(searchCity('Cidade incompleta')).resolves.toBeNull();
  });

  it('retorna null para erro de rede, HTTP não-2xx, JSON inválido e timeout', async () => {
    vi.stubGlobal('fetch', mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        error: new Error('network'),
      },
    ]).fetch);
    await expect(searchCity('Rio')).resolves.toBeNull();

    vi.stubGlobal('fetch', mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        status: 500,
        ok: false,
        response: { message: 'HTTP 500' },
      },
    ]).fetch);
    await expect(searchCity('Rio')).resolves.toBeNull();

    vi.stubGlobal('fetch', mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        response: '{bad json',
      },
    ]).fetch);
    await expect(searchCity('Rio')).resolves.toBeNull();

    vi.useFakeTimers();
    const deferred = mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        delay: 20000,
        response: geocodingRio,
      },
    ]);
    vi.stubGlobal('fetch', deferred.fetch);
    const promise = searchCity('Rio');
    vi.advanceTimersByTime(10000);
    await expect(promise).resolves.toBeNull();
    vi.useRealTimers();
  });
});

describe('RF-03: getCurrentWeather', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('retorna um CurrentWeather completo para coordenadas válidas', async () => {
    const mocked = mockFetch([
      {
        url: /latitude=-22\.90642&longitude=-43\.18223&current=precipitation_probability,temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,precipitation,weather_code&timezone=America%2FSao_Paulo/,
        response: forecastRio,
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    const weather = await getCurrentWeather({
      latitude: -22.90642,
      longitude: -43.18223,
      timezone: 'America/Sao_Paulo',
    });

    expect(weather).toMatchObject({
      time: '2026-10-02T09:15',
      temperature: 23,
      apparentTemperature: 26.4,
      humidity: 86,
      precipitationProbability: 61,
      windSpeed: 5,
      windDirection: 272,
      isDay: true,
      weatherCode: 3,
      units: {
        temperature: '°C',
        apparentTemperature: '°C',
        humidity: '%',
        precipitationProbability: '%',
        windSpeed: 'km/h',
        windDirection: '°',
      },
    });
  });

  it('envia timezone com encoding e aceita coordenadas zero', async () => {
    const mocked = mockFetch([
      {
        url: /timezone=America%2FSao_Paulo/,
        response: forecastRio,
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    const weather = await getCurrentWeather({ latitude: 0, longitude: 0, timezone: 'America/Sao_Paulo' });

    expect(weather).not.toBeNull();
    expect(mocked.calls[0]?.url).toContain('timezone=America%2FSao_Paulo');
  });

  it('retorna null quando parâmetros são inválidos e não dispara fetch', async () => {
    const mocked = mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        response: forecastRio,
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    await expect(getCurrentWeather({ latitude: NaN, longitude: -43.18223, timezone: 'America/Sao_Paulo' })).resolves.toBeNull();
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: Number.NaN, timezone: 'America/Sao_Paulo' })).resolves.toBeNull();
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: '' })).resolves.toBeNull();
    await expect(getCurrentWeather({ latitude: 0, longitude: 0, timezone: 'America/Sao_Paulo' })).resolves.not.toBeNull();

    expect(mocked.calls).toHaveLength(1);
  });

  it.each([
    'time',
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'wind_speed_10m',
    'wind_direction_10m',
    'weather_code',
  ])('retorna null quando a propriedade %s está ausente', async (field) => {
    const badResponse = structuredClone(forecastRio) as Record<string, unknown>;
    delete (badResponse.current as Record<string, unknown>)[field];

    const mocked = mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        response: badResponse,
      },
    ]);
    vi.stubGlobal('fetch', mocked.fetch);

    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' })).resolves.toBeNull();
  });

  it('retorna null sem current_units ou unidade ausente, mas aceita ausência de precipitation', async () => {
    const withoutUnits = structuredClone(forecastRio) as Record<string, unknown>;
    delete (withoutUnits as Record<string, unknown>).current_units;

    vi.stubGlobal('fetch', mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        response: withoutUnits,
      },
    ]).fetch);
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' })).resolves.toBeNull();

    const withMissingUnit = structuredClone(forecastRio) as Record<string, unknown>;
    delete (withMissingUnit.current_units as Record<string, unknown>).temperature_2m;

    vi.stubGlobal('fetch', mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        response: withMissingUnit,
      },
    ]).fetch);
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' })).resolves.toBeNull();

    const withoutPrecipitation = structuredClone(forecastRio) as Record<string, unknown>;
    delete (withoutPrecipitation.current as Record<string, unknown>).precipitation;

    vi.stubGlobal('fetch', mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        response: withoutPrecipitation,
      },
    ]).fetch);
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' })).resolves.not.toBeNull();
  });

  it('retorna null para rede, HTTP 500, JSON inválido e timeout', async () => {
    vi.stubGlobal('fetch', mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        error: new Error('network'),
      },
    ]).fetch);
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' })).resolves.toBeNull();

    vi.stubGlobal('fetch', mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        status: 500,
        ok: false,
        response: { message: 'failure' },
      },
    ]).fetch);
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' })).resolves.toBeNull();

    vi.stubGlobal('fetch', mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        response: '{bad json',
      },
    ]).fetch);
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' })).resolves.toBeNull();

    vi.useFakeTimers();
    vi.stubGlobal('fetch', mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        delay: 20000,
        response: forecastRio,
      },
    ]).fetch);
    const promise = getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' });
    vi.advanceTimersByTime(10000);
    await expect(promise).resolves.toBeNull();
    vi.useRealTimers();
  });
});

describe('RF-03: cancelamento de requisições', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('aborta searchCity e getCurrentWeather sem logar erro e limpa timers', async () => {
    vi.useFakeTimers();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const searchMock = mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        delay: 20000,
        response: geocodingRio,
      },
    ]);
    vi.stubGlobal('fetch', searchMock.fetch);

    const searchController = new AbortController();
    const searchPromise = searchCity('Rio de Janeiro', searchController.signal);
    searchController.abort();
    await expect(searchPromise).resolves.toBeNull();

    const weatherMock = mockFetch([
      {
        url: /api\.open-meteo\.com\/v1\/forecast/,
        delay: 20000,
        response: forecastRio,
      },
    ]);
    vi.stubGlobal('fetch', weatherMock.fetch);

    const weatherController = new AbortController();
    const weatherPromise = getCurrentWeather(
      { latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' },
      weatherController.signal,
    );
    weatherController.abort();
    await expect(weatherPromise).resolves.toBeNull();

    expect(errorSpy).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retorna null e não chama fetch quando o sinal já está abortado', async () => {
    const fetchMock = mockFetch([
      {
        url: /geocoding-api\.open-meteo\.com\/v1\/search\?/,
        response: geocodingRio,
      },
    ]);
    vi.stubGlobal('fetch', fetchMock.fetch);

    const alreadyAborted = new AbortController();
    alreadyAborted.abort();

    await expect(searchCity('Rio de Janeiro', alreadyAborted.signal)).resolves.toBeNull();
    await expect(getCurrentWeather({ latitude: -22.90642, longitude: -43.18223, timezone: 'America/Sao_Paulo' }, alreadyAborted.signal)).resolves.toBeNull();
    expect(fetchMock.calls).toHaveLength(0);
  });
});
