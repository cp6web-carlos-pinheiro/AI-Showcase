import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRender, renderWeatherResult } from './render';

describe('RF-04: render', () => {
  let card: HTMLDivElement;
  let setDisabled: (disabled: boolean) => void;

  beforeEach(() => {
    card = document.createElement('div');
    setDisabled = vi.fn() as (disabled: boolean) => void;
    document.body.innerHTML = '';
    document.body.appendChild(card);
  });

  it('mostra o empty state inicial e alterna mensagens', () => {
    const render = createRender(card, { setDisabled });
    const statusRegion = card.querySelector('[aria-live="polite"]');

    expect(card.dataset.state).toBe('empty-inicial');
    expect(statusRegion?.textContent).toBe('Busque por uma cidade para ver o clima.');

    render.setState('empty-nao-encontrado', 'Cidade não encontrada.');
    expect(card.dataset.state).toBe('empty-nao-encontrado');
    expect(statusRegion?.textContent).toBe('Cidade não encontrada.');
    expect((card.querySelector('[data-state="empty-inicial"]') as HTMLElement | null)?.hidden).toBe(true);
    expect((card.querySelector('[data-state="empty-nao-encontrado"]') as HTMLElement | null)?.hidden).toBe(false);
  });

  it('mostra apenas um estado visível por vez e desabilita o formulário no loading', () => {
    const render = createRender(card, { setDisabled });

    render.setState('loading');
    expect(card.dataset.state).toBe('loading');
    expect((card.querySelector('[data-state="loading"]') as HTMLElement | null)?.hidden).toBe(false);
    expect((card.querySelector('[data-state="empty-inicial"]') as HTMLElement | null)?.hidden).toBe(true);
    expect((card.querySelector('[data-state="empty-nao-encontrado"]') as HTMLElement | null)?.hidden).toBe(true);
    expect(setDisabled).toHaveBeenCalledWith(true);

    render.setState('empty-inicial');
    expect(setDisabled).toHaveBeenLastCalledWith(false);
  });

  it('renderiza a sidebar e o conteúdo principal com dados reais', () => {
    const sidebar = document.createElement('aside');
    sidebar.setAttribute('data-testid', 'sidebar');
    const mainArea = document.createElement('section');
    mainArea.setAttribute('data-testid', 'main-area');
    card.append(sidebar, mainArea);

    renderWeatherResult(card, {
      name: '<img src=x onerror=alert(1)>',
      latitude: -22.9068,
      longitude: -43.1729,
      countryCode: 'BR',
      timezone: 'America/Sao_Paulo',
    }, {
      time: '2026-06-17T09:45',
      temperature: 19.3,
      apparentTemperature: 18.7,
      humidity: 68,
      precipitationProbability: 32,
      windSpeed: 5.8,
      windDirection: 277,
      isDay: true,
      weatherCode: 0,
      units: {
        temperature: '°F',
        apparentTemperature: '°F',
        humidity: '%',
        precipitationProbability: '%',
        windSpeed: 'km/h',
        windDirection: '°',
      },
    });

    expect(card.dataset.state).toBe('resultado');
    expect(sidebar.getAttribute('data-period')).toBe('day');
    expect(sidebar.querySelector('[data-testid="temperature"]')?.textContent).toContain('19,3');
    expect(sidebar.querySelector('[data-testid="city"]')?.textContent).toBe('<img src=x onerror=alert(1)>, BR');
    expect(sidebar.querySelectorAll('img').length).toBe(0);
    expect(sidebar.querySelector('[data-testid="day"]')?.textContent).toContain('quarta-feira');
    expect(sidebar.querySelector('[data-testid="period"]')?.textContent).toContain('Dia');
    expect(sidebar.querySelector('[data-testid="weather-description"]')?.textContent).toContain('Céu limpo');

    expect(mainArea.querySelector('[data-testid="humidity"]')?.textContent).toContain('68');
    expect(mainArea.querySelector('[data-testid="apparent-temperature"]')?.textContent).toContain('18,7');
    expect(mainArea.querySelector('[data-testid="precipitation-probability"]')?.textContent).toContain('32');
    expect(mainArea.querySelector('[data-testid="wind"]')?.textContent).toContain('5,8 km/h · 277° (O)');
  });
});
