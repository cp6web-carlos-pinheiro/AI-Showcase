import { beforeEach, describe, expect, it } from 'vitest';

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
});
