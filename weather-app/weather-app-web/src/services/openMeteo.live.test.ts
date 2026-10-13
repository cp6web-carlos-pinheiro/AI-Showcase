import { describe, expect, it } from 'vitest';
import { getCurrentWeather, searchCity } from './openMeteo';

describe('contrato real da API Open-Meteo', () => {
  it('retorna geocoding e forecast válidos para Rio de Janeiro', async () => {
    const city = await searchCity('Rio de Janeiro');

    expect(city).not.toBeNull();
    expect(city).toMatchObject({
      name: 'Rio de Janeiro',
      countryCode: 'BR',
    });
    expect(city?.latitude).toEqual(expect.any(Number));
    expect(city?.longitude).toEqual(expect.any(Number));
    expect(city?.timezone).toEqual(expect.any(String));

    const weather = await getCurrentWeather({
      latitude: city!.latitude,
      longitude: city!.longitude,
      timezone: city!.timezone,
    });

    expect(weather).not.toBeNull();
    expect(weather).toMatchObject({
      time: expect.any(String),
      weatherCode: expect.any(Number),
      isDay: expect.any(Boolean),
      units: {
        temperature: expect.any(String),
        apparentTemperature: expect.any(String),
        humidity: expect.any(String),
        precipitationProbability: expect.any(String),
        windSpeed: expect.any(String),
        windDirection: expect.any(String),
      },
    });
    expect(weather!.precipitationProbability).toEqual(expect.any(Number));
    expect(weather!.humidity).toEqual(expect.any(Number));
  });
});
