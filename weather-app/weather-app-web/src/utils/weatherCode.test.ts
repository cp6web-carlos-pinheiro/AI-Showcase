import { describe, expect, it } from 'vitest';
import { getWeatherCode } from './weatherCode';

describe('RF-06: weatherCode', () => {
  it.each([
    [0, true, 'Céu limpo'],
    [1, true, 'Predominantemente limpo'],
    [2, true, 'Parcialmente nublado'],
    [3, false, 'Nublado'],
    [45, false, 'Neblina'],
    [48, true, 'Neblina com geada'],
    [51, true, 'Garoa fraca'],
    [53, true, 'Garoa moderada'],
    [55, false, 'Garoa intensa'],
    [56, true, 'Garoa congelante fraca'],
    [57, false, 'Garoa congelante intensa'],
    [61, true, 'Chuva fraca'],
    [63, true, 'Chuva moderada'],
    [65, false, 'Chuva forte'],
    [66, true, 'Chuva congelante fraca'],
    [67, false, 'Chuva congelante forte'],
    [71, true, 'Neve fraca'],
    [73, true, 'Neve moderada'],
    [75, false, 'Neve forte'],
    [77, true, 'Grãos de neve'],
    [80, true, 'Pancadas de chuva fracas'],
    [81, false, 'Pancadas de chuva moderadas'],
    [82, true, 'Pancadas de chuva violentas'],
    [85, false, 'Pancadas de neve fracas'],
    [86, true, 'Pancadas de neve fortes'],
    [95, true, 'Tempestade'],
    [96, false, 'Tempestade com granizo fraco'],
    [99, true, 'Tempestade com granizo forte'],
  ])('retorna a descrição correta para o código %i em dia/noite', (code, isDay, expected) => {
    const result = getWeatherCode(code, isDay);
    expect(result.description).toBe(expected);
    expect(result.iconKey).toBeTypeOf('string');
    expect(result.iconKey.length).toBeGreaterThan(0);
  });

  it.each([1234, -1, 1.5, Number.NaN])('retorna fallback para código inválido %p', (code) => {
    const result = getWeatherCode(code as number, true);
    expect(result.description).toBe('Condição desconhecida');
    expect(result.iconKey).toBe('neutral');
  });

  it('diferencia céu limpo e parcialmente nublado por dia/noite', () => {
    const clearDay = getWeatherCode(0, true);
    const clearNight = getWeatherCode(0, false);
    const partlyDay = getWeatherCode(2, true);
    const partlyNight = getWeatherCode(2, false);

    expect(clearDay.iconKey).not.toBe(clearNight.iconKey);
    expect(partlyDay.iconKey).not.toBe(partlyNight.iconKey);
    expect(clearDay.iconKey).not.toBe(partlyDay.iconKey);
  });
});
