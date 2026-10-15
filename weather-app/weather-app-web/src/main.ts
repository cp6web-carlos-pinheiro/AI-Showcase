import './styles/main.css';
import { searchCity, getCurrentWeather } from './services/openMeteo';
import { createRender, renderWeatherResult } from './ui/render';
import { createSearchForm } from './ui/searchForm';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <div class="page-shell">
      <header class="topbar" aria-label="Busca do clima"></header>
      <main class="card" data-testid="card">
        <aside class="sidebar" data-testid="sidebar"></aside>
        <section class="main-area" data-testid="main-area"></section>
      </main>
    </div>
  `;

  const topbar = app.querySelector<HTMLElement>('.topbar');
  const card = app.querySelector<HTMLElement>('[data-testid="card"]');

  if (topbar && card) {
    let activeController: AbortController | null = null;
    let requestId = 0;
    let renderController!: ReturnType<typeof createRender>;

    const { setDisabled } = createSearchForm(topbar, async (value: string) => {
      const currentRequestId = ++requestId;
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      renderController.setState('loading', 'Buscando clima...');

      try {
        const city = await searchCity(value, controller.signal);

        if (currentRequestId !== requestId || controller.signal.aborted) {
          return;
        }

        if (!city) {
          renderController.setState('empty-nao-encontrado', 'Não encontramos informações para essa busca.');
          return;
        }

        const weather = await getCurrentWeather(
          {
            latitude: city.latitude,
            longitude: city.longitude,
            timezone: city.timezone,
          },
          controller.signal,
        );

        if (currentRequestId !== requestId || controller.signal.aborted) {
          return;
        }

        if (!weather) {
          renderController.setState('empty-nao-encontrado', 'Não encontramos informações para essa busca.');
          return;
        }

        renderWeatherResult(card, city, weather);
        renderController.setState('resultado');
      } catch {
        if (currentRequestId !== requestId || controller.signal.aborted) {
          return;
        }

        renderController.setState('empty-nao-encontrado', 'Não encontramos informações para essa busca.');
      }
    });

    renderController = createRender(card, { setDisabled });
    renderController.setState('empty-inicial');
  }
}
