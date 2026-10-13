import { beforeEach, describe, expect, it, vi } from 'vitest';
import geocodingFixture from './test/fixtures/geocoding-rio.json';
import forecastFixture from './test/fixtures/forecast-rio.json';
import { mockFetch } from './test/helpers/mockFetch';

describe('T12: estrutura base da interface', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    document.documentElement.lang = 'pt-BR';
    document.title = 'Clima';
  });

  it('renderiza a estrutura do card com sidebar e área principal', async () => {
    await import('./main');

    const card = document.querySelector('[data-testid="card"]');
    const sidebar = document.querySelector('[data-testid="sidebar"]');
    const mainArea = document.querySelector('[data-testid="main-area"]');

    expect(document.documentElement.lang).toBe('pt-BR');
    expect(document.title).toBe('Clima');
    expect(card).not.toBeNull();
    expect(sidebar).not.toBeNull();
    expect(mainArea).not.toBeNull();
    expect(card?.contains(sidebar)).toBe(true);
    expect(card?.contains(mainArea)).toBe(true);
    expect(document.body.innerHTML).not.toContain('Get started');
    expect(document.body.innerHTML).not.toContain('vite.svg');
  });

  it('executa o fluxo de busca completo com loading e resultado', async () => {
    vi.resetModules();
    vi.stubGlobal(
      'fetch',
      mockFetch([
        {
          url: 'https://geocoding-api.open-meteo.com/v1/search?name=Rio%20de%20Janeiro&count=1&language=pt&format=json',
          response: geocodingFixture,
        },
        {
          url: (value: string) => value.startsWith('https://api.open-meteo.com/v1/forecast?'),
          response: forecastFixture,
        },
      ]).fetch,
    );

    await import('./main');

    const form = document.querySelector<HTMLFormElement>('[data-testid="search-form"]');
    const input = document.querySelector<HTMLInputElement>('[data-testid="search-input"]');

    expect(form).not.toBeNull();
    expect(input).not.toBeNull();

    input!.value = 'Rio de Janeiro';
    form!.requestSubmit();

    await vi.waitFor(() => {
      expect(document.querySelector('[data-testid="city"]')).not.toBeNull();
      expect(document.querySelector('[data-testid="temperature"]')).not.toBeNull();
    });

    expect(document.querySelector('[data-testid="city"]')?.textContent).toContain('Rio de Janeiro, BR');
    expect(document.querySelector('[data-testid="temperature"]')?.textContent).toContain('23');
  });
});
