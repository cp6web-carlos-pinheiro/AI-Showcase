import { describe, expect, it } from 'vitest';
import { getIcon } from './icons';
import { getWeatherCode } from '../utils/weatherCode';

describe('RF-06: icons', () => {
  it('retorna SVG para a chave informada', () => {
    const svg = getIcon('clear-day');
    expect(svg).toContain('<svg');
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).not.toContain('#');
    expect(svg).not.toContain('rgb(');
    expect(svg).not.toContain('hsl(');
  });

  it('retorna o ícone neutro para chave inexistente', () => {
    expect(getIcon('chave-inexistente')).toContain('neutral');
  });

  it('cobre todo o mapeamento do weatherCode', () => {
    for (const code of [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]) {
      const { iconKey } = getWeatherCode(code, true);
      expect(getIcon(iconKey)).toContain('<svg');
      expect(getIcon(iconKey)).not.toContain('neutral');
    }

    expect(getIcon('neutral')).toContain('fallback');
  });
});
