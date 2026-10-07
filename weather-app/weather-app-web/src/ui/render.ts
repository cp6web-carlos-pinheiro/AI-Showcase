import type { City, CurrentWeather } from '../types/openMeteo';
import { formatDate, formatValueWithUnit, formatWind } from '../utils/format';
import { getWeatherCode } from '../utils/weatherCode';
import { getIcon } from './icons';

export type RenderState = 'empty-inicial' | 'empty-nao-encontrado' | 'loading' | 'resultado';

export interface RenderControls {
  setDisabled: (disabled: boolean) => void;
}

export interface RenderController {
  setState: (state: RenderState, message?: string) => void;
  setDisabled: (disabled: boolean) => void;
}

function makeInfoCard(id: string, label: string, value: string): HTMLElement {
  const card = document.createElement('article');
  card.className = 'info-card';
  card.dataset.testid = id;

  const labelNode = document.createElement('div');
  labelNode.className = 'info-label';
  labelNode.textContent = label;

  const valueNode = document.createElement('div');
  valueNode.className = 'info-value';
  valueNode.textContent = value;

  card.append(labelNode, valueNode);

  return card;
}

export function renderWeatherResult(card: HTMLElement, city: City, weather: CurrentWeather): void {
  const sidebar = card.querySelector<HTMLElement>('[data-testid="sidebar"]') ?? card.querySelector<HTMLElement>('.sidebar') ?? document.createElement('aside');
  const mainArea = card.querySelector<HTMLElement>('[data-testid="main-area"]') ?? card.querySelector<HTMLElement>('.main-area') ?? document.createElement('section');

  if (!sidebar.hasAttribute('data-testid')) {
    sidebar.setAttribute('data-testid', 'sidebar');
  }

  if (!mainArea.hasAttribute('data-testid')) {
    mainArea.setAttribute('data-testid', 'main-area');
  }

  sidebar.dataset.period = weather.isDay ? 'day' : 'night';
  sidebar.innerHTML = '';

  const temperature = document.createElement('div');
  temperature.className = 'weather-temperature';
  temperature.dataset.testid = 'temperature';
  temperature.textContent = `${formatValueWithUnit(weather.temperature, weather.units.temperature)}`;

  const cityName = document.createElement('div');
  cityName.className = 'weather-city';
  cityName.dataset.testid = 'city';
  cityName.textContent = `${city.name}, ${city.countryCode}`;

  const day = document.createElement('div');
  day.className = 'weather-day';
  day.dataset.testid = 'day';
  day.textContent = formatDate(weather.time);

  const period = document.createElement('div');
  period.className = 'weather-period';
  period.dataset.testid = 'period';

  const periodIcon = document.createElement('span');
  periodIcon.className = 'weather-icon';
  periodIcon.innerHTML = getIcon(weather.isDay ? 'clear-day' : 'clear-night');

  const periodText = document.createElement('span');
  periodText.textContent = weather.isDay ? 'Dia' : 'Noite';
  period.append(periodIcon, periodText);

  const description = getWeatherCode(weather.weatherCode, weather.isDay);
  const descriptionWrap = document.createElement('div');
  descriptionWrap.className = 'weather-description-wrap';
  descriptionWrap.dataset.testid = 'weather-description';

  const descriptionIcon = document.createElement('span');
  descriptionIcon.className = 'weather-icon';
  descriptionIcon.innerHTML = getIcon(description.iconKey);

  const descriptionText = document.createElement('span');
  descriptionText.textContent = description.description;
  descriptionWrap.append(descriptionIcon, descriptionText);

  sidebar.append(temperature, cityName, day, period, descriptionWrap);

  mainArea.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'info-grid';

  grid.append(
    makeInfoCard('humidity', 'Umidade', formatValueWithUnit(weather.humidity, weather.units.humidity)),
    makeInfoCard('apparent-temperature', 'Temperatura aparente', formatValueWithUnit(weather.apparentTemperature, weather.units.apparentTemperature)),
    makeInfoCard('precipitation-probability', 'Probabilidade de precipitação', formatValueWithUnit(weather.precipitationProbability, weather.units.precipitationProbability)),
    makeInfoCard('wind', 'Vento', formatWind(weather.windSpeed, weather.windDirection, weather.units.windSpeed)),
  );

  mainArea.append(grid);
  card.dataset.state = 'resultado';
}

export function createRender(card: HTMLElement, controls?: RenderControls): RenderController {
  const statusRegion = document.createElement('div');
  statusRegion.setAttribute('aria-live', 'polite');
  statusRegion.className = 'status-region';

  const stateMap: Record<RenderState, HTMLElement> = {
    'empty-inicial': document.createElement('div'),
    'empty-nao-encontrado': document.createElement('div'),
    loading: document.createElement('div'),
    resultado: document.createElement('div'),
  };

  const stateMessages: Record<RenderState, string> = {
    'empty-inicial': 'Busque por uma cidade para ver o clima.',
    'empty-nao-encontrado': 'Não encontramos informações para essa busca.',
    loading: 'Carregando clima...',
    resultado: 'Resultado carregado.',
  };

  Object.entries(stateMap).forEach(([key, element]) => {
    const stateKey = key as RenderState;
    element.className = `state-panel ${stateKey}`;
    element.hidden = true;
    element.textContent = stateMessages[stateKey];
    element.setAttribute('data-state', stateKey);
    card.appendChild(element);
  });

  card.insertBefore(statusRegion, card.firstChild);
  card.dataset.state = 'empty-inicial';

  const setState = (state: RenderState, message = stateMessages[state]) => {
    card.dataset.state = state;
    statusRegion.textContent = message;

    Object.entries(stateMap).forEach(([key, element]) => {
      const stateKey = key as RenderState;
      element.hidden = stateKey !== state;
    });

    if (controls) {
      controls.setDisabled(state === 'loading');
    }
  };

  const setDisabled = (disabled: boolean) => {
    if (controls) {
      controls.setDisabled(disabled);
    }
  };

  setState('empty-inicial');

  return { setState, setDisabled };
}
