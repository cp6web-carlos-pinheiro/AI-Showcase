import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import geocodingFixture from '../src/test/fixtures/geocoding-rio.json' with { type: 'json' };
import forecastFixture from '../src/test/fixtures/forecast-rio.json' with { type: 'json' };

const saopauloGeocoding = {
  results: [
    {
      ...geocodingFixture.results[0],
      name: 'São Paulo',
      latitude: -23.55052,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo',
      country_code: 'BR',
    },
  ],
};

const nightForecast = {
  ...forecastFixture,
  current: {
    ...forecastFixture.current,
    is_day: 0,
    weather_code: 95,
  },
};

async function searchBy(page: Page, value: string, useEnter = true) {
  const input = page.getByLabel('Buscar cidade');
  await input.fill(value);

  if (useEnter) {
    await input.press('Enter');
  } else {
    await page.getByTestId('search-button').click();
  }
}

async function mockSearchFlow(
  page: Page,
  overrides: Partial<{
    cityName: string;
    geocodingDelay: number;
    forecastDelay: number;
    geocodingStatus: number;
    forecastStatus: number;
    geocodingBody: unknown;
    forecastBody: unknown;
    forecastMode: 'ok' | 'network-error' | 'invalid-json' | 'abort';
  }> = {},
) {
  const {
    cityName = 'Rio de Janeiro',
    geocodingDelay = 0,
    forecastDelay = 0,
    geocodingStatus = 200,
    forecastStatus = 200,
    geocodingBody = geocodingFixture,
    forecastBody = forecastFixture,
    forecastMode = 'ok',
  } = overrides;

  await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
    if (geocodingDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, geocodingDelay));
    }

    if (geocodingStatus >= 400) {
      await route.fulfill({ status: geocodingStatus, contentType: 'application/json', body: JSON.stringify({}) });
      return;
    }

    await route.fulfill({
      status: geocodingStatus,
      contentType: 'application/json',
      body: JSON.stringify(cityName === 'São Paulo' ? saopauloGeocoding : geocodingBody),
    });
  });

  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    if (forecastDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, forecastDelay));
    }

    if (forecastMode === 'network-error') {
      await route.abort('failed');
      return;
    }

    if (forecastMode === 'invalid-json') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{invalid' });
      return;
    }

    if (forecastMode === 'abort') {
      await route.abort();
      return;
    }

    if (forecastStatus >= 400) {
      await route.fulfill({ status: forecastStatus, contentType: 'application/json', body: JSON.stringify({ error: true }) });
      return;
    }

    await route.fulfill({ status: forecastStatus, contentType: 'application/json', body: JSON.stringify(forecastBody) });
  });
}

test.describe('E2E - fluxo de busca', () => {
  test('busca por Enter e por clique', async ({ page }) => {
    await mockSearchFlow(page);
    await page.goto('/');

    await searchBy(page, 'Rio de Janeiro', true);
    await expect(page.getByTestId('city')).toContainText('Rio de Janeiro, BR');
    await expect(page.getByTestId('temperature')).toContainText('23');

    await searchBy(page, 'Rio de Janeiro', false);
    await expect(page.getByTestId('main-area')).toContainText('Umidade');
  });

  test('limpa os dados antigos e mostra somente a mensagem quando a nova busca falha', async ({ page }) => {
    await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
      const cityName = new URL(route.request().url()).searchParams.get('name');
      if (cityName === 'Cidade fantasma') {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [] }) });
        return;
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(geocodingFixture) });
    });

    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(forecastFixture) });
    });

    await page.goto('/');
    await searchBy(page, 'Rio de Janeiro');
    await expect(page.getByTestId('city')).toContainText('Rio de Janeiro, BR');

    await searchBy(page, 'Cidade fantasma');

    const loadingState = page.locator('.state-panel[data-state="loading"]');
    const notFoundState = page.locator('.state-panel[data-state="empty-nao-encontrado"]');
    await expect(loadingState).toBeVisible();
    await expect(page.getByTestId('sidebar')).toBeHidden();
    await expect(page.getByTestId('main-area')).toBeHidden();
    await expect(page.getByTestId('city')).toHaveCount(0);

    await expect(notFoundState).toBeVisible();
    await expect(notFoundState).toContainText('Não encontramos informações para essa busca.');
    await expect(loadingState).toBeHidden();
    await expect(page.getByTestId('sidebar')).toBeHidden();
    await expect(page.getByTestId('main-area')).toBeHidden();
  });

  test('campo vazio não dispara requisição', async ({ page }) => {
    let totalGeocodingCalls = 0;
    let totalForecastCalls = 0;

    await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
      totalGeocodingCalls += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(geocodingFixture) });
    });

    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      totalForecastCalls += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(forecastFixture) });
    });

    await page.goto('/');
    await page.getByLabel('Buscar cidade').press('Enter');
    await page.getByTestId('search-button').click();

    expect(totalGeocodingCalls).toBe(0);
    expect(totalForecastCalls).toBe(0);
  });

  test('cidade inexistente mostra empty state', async ({ page }) => {
    await mockSearchFlow(page, { geocodingBody: { results: [] } });

    await page.goto('/');
    await searchBy(page, 'Cidade fantasma', true);

    const emptyState = page.locator('.state-panel[data-state="empty-nao-encontrado"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('Não encontramos informações para essa busca.');
  });

  test('falhas do forecast mostram empty state', async ({ page }) => {
    const cases = [
      { name: 'http-500', forecastStatus: 500 },
      { name: 'network-error', forecastMode: 'network-error' as const },
      { name: 'invalid-json', forecastMode: 'invalid-json' as const },
    ];

    for (const currentCase of cases) {
      await mockSearchFlow(page, currentCase);
      await page.goto('/');
      await searchBy(page, 'Rio de Janeiro', true);
      const emptyState = page.locator('.state-panel[data-state="empty-nao-encontrado"]');
      await expect(emptyState).toBeVisible();
      await expect(page.getByTestId('city')).toHaveCount(0);
    }
  });

  test('corrida de buscas: a última resposta vence', async ({ page }) => {
    await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
      const url = route.request().url();
      if (url.includes('Rio%20de%20Janeiro')) {
        await new Promise((resolve) => setTimeout(resolve, 700));
      }

      if (url.includes('S%C3%A3o%20Paulo')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(saopauloGeocoding) });
        return;
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(geocodingFixture) });
    });

    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(forecastFixture) });
    });

    await page.goto('/');
    await searchBy(page, 'Rio de Janeiro', true);
    await searchBy(page, 'São Paulo', true);

    await expect(page.getByTestId('city')).toContainText('São Paulo, BR');
  });

  test('fluxo só por teclado e foco visível', async ({ page }) => {
    await mockSearchFlow(page);
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Buscar cidade')).toBeFocused();

    await page.getByLabel('Buscar cidade').fill('Rio de Janeiro');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('city')).toContainText('Rio de Janeiro, BR');
  });

  test('responsividade em larguras críticas', async ({ page }) => {
    await mockSearchFlow(page);
    await page.goto('/');

    for (const width of [320, 375, 639, 640, 800, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.reload();
      await searchBy(page, 'Rio de Janeiro', true);
      await expect(page.getByTestId('sidebar')).toBeVisible();
      await expect(page.getByTestId('main-area')).toBeVisible();

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        cardWidth: (document.querySelector('[data-testid="card"]') as HTMLElement)?.getBoundingClientRect().width ?? 0,
        sidebarY: (document.querySelector('[data-testid="sidebar"]') as HTMLElement)?.getBoundingClientRect().top ?? 0,
        mainY: (document.querySelector('[data-testid="main-area"]') as HTMLElement)?.getBoundingClientRect().top ?? 0,
      }));

      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
      if (width < 640) {
        expect(metrics.sidebarY).toBeLessThan(metrics.mainY);
      }
      if (width >= 800) {
        expect(metrics.cardWidth).toBeLessThanOrEqual(800);
      }
    }
  });

  test('timezone Kiritimati e dia/noite', async ({ page }) => {
    await page.route('**/geocoding-api.open-meteo.com/v1/search**', async (route) => {
      const city = { ...geocodingFixture.results[0], timezone: 'Pacific/Kiritimati' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [city] }) });
    });

    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(forecastFixture) });
    });

    await page.goto('/');
    await searchBy(page, 'Rio de Janeiro', true);
    await expect(page.getByTestId('day')).toContainText('sexta-feira, 2 de outubro');

    await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(nightForecast) });
    });
    await page.getByLabel('Buscar cidade').fill('Rio de Janeiro');
    await page.getByTestId('search-button').click();
    await expect(page.locator('[data-period="night"]')).toBeVisible();
  });

  test('acessibilidade inicial e após erro', async ({ page }) => {
    await mockSearchFlow(page, { geocodingBody: { results: [] } });
    await page.goto('/');

    const initial = await new AxeBuilder({ page }).analyze();
    expect(initial.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toHaveLength(0);

    await searchBy(page, 'Cidade fantasma', true);
    const notFound = await new AxeBuilder({ page }).analyze();
    expect(notFound.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toHaveLength(0);
  });
});
