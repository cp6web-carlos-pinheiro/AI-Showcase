import { describe, expect, it } from 'vitest';

const allSourceFiles = import.meta.glob('/src/**/*.ts', {
  query: '?raw',
  eager: true,
}) as Record<string, unknown>;

function toSourceText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'default' in value && typeof value.default === 'string') {
    return value.default;
  }

  return String(value ?? '');
}

export function getIsolationViolations(files: Record<string, unknown>) {
  return Object.entries(files)
    .map(([filePath, value]) => [filePath, toSourceText(value)] as const)
    .filter(([filePath]) => !filePath.endsWith('.test.ts') && !filePath.includes('/src/test/'))
    .filter(([, source]) => /fetch\s*\(/.test(source) || /open-meteo/i.test(source))
    .map(([filePath]) => filePath)
    .filter((filePath) => filePath !== '/src/services/openMeteo.ts');
}

describe('T08 — isolamento da API', () => {
  it('mantém fetch e o host da Open-Meteo apenas no serviço', () => {
    const violations = getIsolationViolations(allSourceFiles);

    expect(violations).toEqual([]);
  });

  it('detecta uma violação quando fetch aparece fora do serviço', () => {
    const sampleFiles: Record<string, string> = {
      '/src/services/openMeteo.ts': 'fetch("https://api.open-meteo.com/v1/forecast")',
      '/src/ui/weatherCard.ts': 'fetch("https://example.com")',
    };

    expect(getIsolationViolations(sampleFiles)).toEqual(['/src/ui/weatherCard.ts']);
  });
});
