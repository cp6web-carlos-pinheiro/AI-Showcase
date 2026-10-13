import type { Page } from '@playwright/test';
import geocodingFixture from '../src/test/fixtures/geocoding-rio.json' with { type: 'json' };
import forecastFixture from '../src/test/fixtures/forecast-rio.json' with { type: 'json' };

export type MockOpenMeteoOptions = {
  geocoding?: unknown;
  forecast?: unknown;
  geocodingStatus?: number;
  forecastStatus?: number;
  geocodingDelayMs?: number;
  forecastDelayMs?: number;
  geocodingMode?: 'ok' | 'network-error' | 'invalid-json' | 'abort';
  forecastMode?: 'ok' | 'network-error' | 'invalid-json' | 'abort';
  failUnmocked?: boolean;
};

export async function mockOpenMeteo(page: Page, options: MockOpenMeteoOptions = {}) {
  const {
    geocoding = geocodingFixture,
    forecast = forecastFixture,
    geocodingStatus = 200,
    forecastStatus = 200,
    geocodingDelayMs = 0,
    forecastDelayMs = 0,
    geocodingMode = 'ok',
    forecastMode = 'ok',
    failUnmocked = true,
  } = options;

  let geocodingCalls = 0;
  let forecastCalls = 0;

  const buildJsonResponse = (payload: unknown, status: number) => ({
    status,
    contentType: 'application/json',
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });

  page.route('**/*', async (route) => {
    const url = route.request().url();

    if (!url.includes('open-meteo.com')) {
      await route.continue();
      return;
    }

    if (url.includes('geocoding-api.open-meteo.com/v1/search')) {
      geocodingCalls += 1;

      if (geocodingMode === 'abort') {
        await route.abort();
        return;
      }

      if (geocodingMode === 'network-error') {
        await route.abort('failed');
        return;
      }

      if (geocodingMode === 'invalid-json') {
        await route.fulfill({
          status: geocodingStatus,
          contentType: 'application/json',
          body: '{invalid',
        });
        return;
      }

      if (geocodingDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, geocodingDelayMs));
      }

      await route.fulfill(buildJsonResponse(geocoding, geocodingStatus));
      return;
    }

    if (url.includes('api.open-meteo.com/v1/forecast')) {
      forecastCalls += 1;

      if (forecastMode === 'abort') {
        await route.abort();
        return;
      }

      if (forecastMode === 'network-error') {
        await route.abort('failed');
        return;
      }

      if (forecastMode === 'invalid-json') {
        await route.fulfill({
          status: forecastStatus,
          contentType: 'application/json',
          body: '{invalid',
        });
        return;
      }

      if (forecastDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, forecastDelayMs));
      }

      await route.fulfill(buildJsonResponse(forecast, forecastStatus));
      return;
    }

    if (failUnmocked) {
      throw new Error(`Open-Meteo request not mocked: ${url}`);
    }

    await route.continue();
  });

  return {
    geocodingCalls: () => geocodingCalls,
    forecastCalls: () => forecastCalls,
    reset: () => {
      geocodingCalls = 0;
      forecastCalls = 0;
    },
  };
}
