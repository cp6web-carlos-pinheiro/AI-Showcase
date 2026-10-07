import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../test/helpers/contrast';

const css = readFileSync(resolve(process.cwd(), 'src/styles/main.css'), 'utf8');

describe('RF-07: contraste da sidebar', () => {
  it('mantém contraste adequado em dia e noite', () => {
    const tokens = Object.fromEntries(
      [...css.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, name, value]) => [name, value]),
    );

    const dayText = tokens['day-text'];
    const dayFrom = tokens['day-bg-from'];
    const dayTo = tokens['day-bg-to'];
    const nightText = tokens['night-text'];
    const nightFrom = tokens['night-bg-from'];
    const nightTo = tokens['night-bg-to'];

    expect(dayText).toBeTruthy();
    expect(dayFrom).toBeTruthy();
    expect(dayTo).toBeTruthy();
    expect(nightText).toBeTruthy();
    expect(nightFrom).toBeTruthy();
    expect(nightTo).toBeTruthy();

    if (!dayText || !dayFrom || !dayTo || !nightText || !nightFrom || !nightTo) {
      return;
    }

    expect(contrastRatio(dayText, dayFrom)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(dayText, dayTo)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(nightText, nightFrom)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(nightText, nightTo)).toBeGreaterThanOrEqual(4.5);
  });
});
