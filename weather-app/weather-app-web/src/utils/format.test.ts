import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDate, formatNumber, formatValueWithUnit, formatWind, getCardinalDirection } from './format';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('RF-07: format', () => {
  it.each([
    ['UTC', '2026-06-17T09:45', 'quarta-feira, 17 de junho'],
    ['Pacific/Kiritimati', '2026-06-17T09:45', 'quarta-feira, 17 de junho'],
    ['Pacific/Pago_Pago', '2026-06-17T09:45', 'quarta-feira, 17 de junho'],
  ])('formata a data sem depender do fuso do navegador %s', (tz, value, expected) => {
    vi.stubEnv('TZ', tz);
    expect(formatDate(value)).toBe(expected);
  });

  it.each([
    ['2026-12-31T23:59', 'quinta-feira, 31 de dezembro'],
    ['2026-01-01T00:00', 'quinta-feira, 1 de janeiro'],
  ])('mantém a data correta em limites de data %s', (value, expected) => {
    vi.stubEnv('TZ', 'UTC');
    expect(formatDate(value)).toBe(expected);
  });

  it('formata números em pt-BR com até 1 decimal', () => {
    expect(formatNumber(19.3)).toBe('19,3');
    expect(formatNumber(19)).toBe('19');
    expect(formatNumber(1234.5)).toBe('1.234,5');
  });

  it('formata valores com unidade', () => {
    expect(formatValueWithUnit(19.3, '°C')).toBe('19,3 °C');
    expect(formatValueWithUnit(19, '°C')).toBe('19 °C');
  });

  it('normaliza a direção do vento em pontos cardeais', () => {
    expect(getCardinalDirection(277)).toBe('O');
    expect(getCardinalDirection(0)).toBe('N');
    expect(getCardinalDirection(360)).toBe('N');
    expect(getCardinalDirection(90)).toBe('L');
    expect(getCardinalDirection(180)).toBe('S');
    expect(getCardinalDirection(22.4)).toBe('N');
    expect(getCardinalDirection(22.5)).toBe('NE');
    expect(getCardinalDirection(337.5)).toBe('N');
    expect(getCardinalDirection(-10)).toBe('N');
    expect(getCardinalDirection(365)).toBe('N');
  });

  it('formata a velocidade e a direção do vento', () => {
    expect(formatWind(5.8, 277, 'km/h')).toBe('5,8 km/h · 277° (O)');
  });
});
