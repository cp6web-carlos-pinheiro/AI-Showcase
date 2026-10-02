import { describe, expect, it } from 'vitest';
import geocodingRio from '../test/fixtures/geocoding-rio.json';
import forecastRio from '../test/fixtures/forecast-rio.json';
import type { City, CurrentWeather, ForecastResponse, GeocodingResponse } from './openMeteo';

describe('RF-03: tipos da Open-Meteo', () => {
  it('atribui as fixtures reais às respostas brutas sem casting', () => {
    const geocodingFixture: GeocodingResponse = geocodingRio;
    const forecastFixture: ForecastResponse = forecastRio;

    expect(geocodingFixture.results?.[0]?.name).toBe('Rio de Janeiro');
    expect(forecastFixture.current.precipitation_probability).toBeGreaterThanOrEqual(0);
  });

  it('constrói modelos internos válidos', () => {
    const city: City = {
      name: 'Rio de Janeiro',
      latitude: -22.90642,
      longitude: -43.18223,
      countryCode: 'BR',
      timezone: 'America/Sao_Paulo',
    };

    const current: CurrentWeather = {
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
    };

    expect(city.countryCode).toBe('BR');
    expect(current.isDay).toBe(true);
    expect(current.units.precipitationProbability).toBe('%');
  });
});
