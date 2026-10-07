import './styles/main.css';
import { createRender } from './ui/render';
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

  const topbar = app.querySelector<HTMLDivElement>('.topbar');
  const card = app.querySelector<HTMLElement>('[data-testid="card"]');

  if (topbar && card) {
    const { setDisabled } = createSearchForm(topbar, () => undefined);
    createRender(card, { setDisabled });
  }
}
