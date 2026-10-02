import { describe, expect, it } from 'vitest';
import { createDeferredResponse, mockFetch } from './mockFetch';

describe('RF-03: mockFetch', () => {
  it('retorna JSON quando a rota combina com a URL', async () => {
    const { fetch } = mockFetch([
      {
        url: 'https://example.com/weather',
        response: { ok: true },
      },
    ]);

    const response = await fetch('https://example.com/weather');
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('respeita status e ok', async () => {
    const { fetch } = mockFetch([
      {
        url: 'https://example.com/error',
        response: { message: 'Bad' },
        status: 500,
        ok: false,
      },
    ]);

    const response = await fetch('https://example.com/error');
    expect(response.status).toBe(500);
    expect(response.ok).toBe(false);
  });

  it('rejeita erro de rede', async () => {
    const { fetch } = mockFetch([
      {
        url: 'https://example.com/network-error',
        error: new Error('network down'),
      },
    ]);

    await expect(fetch('https://example.com/network-error')).rejects.toThrow('network down');
  });

  it('rejeita JSON inválido', async () => {
    const { fetch } = mockFetch([
      {
        url: 'https://example.com/invalid-json',
        response: '{bad json',
        headers: { 'Content-Type': 'application/json' },
      },
    ]);

    const response = await fetch('https://example.com/invalid-json');
    await expect(response.json()).rejects.toThrow();
  });

  it('suporta resposta deferred resolvida manualmente', async () => {
    const deferred = createDeferredResponse();
    const { fetch } = mockFetch([
      {
        url: 'https://example.com/deferred',
        response: deferred.promise,
      },
    ]);

    const responsePromise = fetch('https://example.com/deferred');
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 });
    deferred.resolve(response);

    await expect(responsePromise).resolves.toMatchObject({ ok: true });
  });

  it('rejeita quando o AbortSignal é abortado', async () => {
    const controller = new AbortController();
    const { fetch } = mockFetch([
      {
        url: 'https://example.com/abort',
        response: { ok: true },
      },
    ]);

    const promise = fetch('https://example.com/abort', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow('aborted');
  });

  it('registra as chamadas da requisição', async () => {
    const { fetch, calls } = mockFetch([
      {
        url: 'https://example.com/calls',
        response: { count: 1 },
      },
    ]);

    await fetch('https://example.com/calls', { method: 'POST', headers: { 'x-test': 'yes' } });

    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      url: 'https://example.com/calls',
      init: expect.objectContaining({ method: 'POST' }),
    });
  });
});
