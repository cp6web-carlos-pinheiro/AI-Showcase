const iconEntries: Record<string, string> = {
  'clear-day': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <circle cx="32" cy="32" r="10" fill="currentColor" />
      <g stroke="currentColor" stroke-linecap="round" stroke-width="2.5">
        <path d="M32 6v8M32 50v8M10 32h8M46 32h8M15 15l5 5M44 44l5 5M15 49l5-5M44 20l5-5" />
      </g>
    </svg>
  `,
  'clear-night': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <path d="M42 10c-4.8 0-9.3 1.8-12.7 4.8A18 18 0 0 0 52 32.8c0 10.4-7.5 18.9-17.4 19.8A18.9 18.9 0 0 1 15 33.1 18.9 18.9 0 0 1 42 10Z" fill="currentColor" opacity="0.9"/>
    </svg>
  `,
  'partly-cloudy-day': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <circle cx="24" cy="24" r="8" fill="currentColor"/>
      <g stroke="currentColor" stroke-linecap="round" stroke-width="2.5">
        <path d="M24 10v5M24 39v5M10 24h5M39 24h5M14 14l4 4M34 34l4 4M14 34l4-4M34 14l4-4"/>
      </g>
      <path d="M20 40h22a8 8 0 1 1 0-16 10 10 0 0 1-19 4 6 6 0 1 1 0 12Z" fill="currentColor" opacity="0.8"/>
    </svg>
  `,
  'partly-cloudy-night': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <path d="M38 12c-3.8 0-7.4 1.2-10.2 3.4A16.5 16.5 0 0 0 45 36.2c.2-1 .3-2 .3-3 0-8.8-6.5-16-14.7-16.7A18.8 18.8 0 0 1 38 12Z" fill="currentColor" opacity="0.9"/>
      <path d="M20 42h22a8 8 0 1 1 0-16 10 10 0 0 1-19 4 6 6 0 0 1 0 12Z" fill="currentColor" opacity="0.8"/>
    </svg>
  `,
  cloudy: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <path d="M18 42h28a8 8 0 1 0 0-16 10 10 0 0 0-19-4 6 6 0 0 0-9 9 8 8 0 0 0 0 11Z" fill="currentColor"/>
    </svg>
  `,
  fog: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="3">
        <path d="M8 22h48M12 32h40M18 42h28M22 52h20"/>
      </g>
    </svg>
  `,
  drizzle: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <path d="M18 42h28a8 8 0 1 0 0-16 10 10 0 0 0-19-4 6 6 0 0 0-9 9 8 8 0 0 0 0 11Z" fill="currentColor" opacity="0.8"/>
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.5">
        <path d="M22 48v8M32 48v8M42 48v8"/>
      </g>
    </svg>
  `,
  rain: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <path d="M18 42h28a8 8 0 1 0 0-16 10 10 0 0 0-19-4 6 6 0 0 0-9 9 8 8 0 0 0 0 11Z" fill="currentColor" opacity="0.8"/>
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.5">
        <path d="M22 48v8M32 46v10M42 48v8"/>
      </g>
    </svg>
  `,
  showers: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <path d="M18 42h28a8 8 0 1 0 0-16 10 10 0 0 0-19-4 6 6 0 0 0-9 9 8 8 0 0 0 0 11Z" fill="currentColor" opacity="0.8"/>
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.5">
        <path d="M24 48v8M32 46v10M40 48v8"/>
      </g>
    </svg>
  `,
  snow: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <path d="M18 42h28a8 8 0 1 0 0-16 10 10 0 0 0-19-4 6 6 0 0 0-9 9 8 8 0 0 0 0 11Z" fill="currentColor" opacity="0.8"/>
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.5">
        <path d="M24 48v8M32 46v10M40 48v8"/>
        <path d="M28 52h8M24 56h16"/>
      </g>
    </svg>
  `,
  storm: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img">
      <path d="M18 42h28a8 8 0 1 0 0-16 10 10 0 0 0-19-4 6 6 0 0 0-9 9 8 8 0 0 0 0 11Z" fill="currentColor" opacity="0.8"/>
      <path d="M30 38l-6 12h8l-4 14 16-18h-8l4-8Z" fill="currentColor"/>
    </svg>
  `,
  neutral: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" role="img" data-icon="neutral fallback">
      <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="32" cy="32" r="8" fill="currentColor"/>
      <path d="M32 10v12M32 42v12M10 32h12M42 32h12" stroke="currentColor" stroke-linecap="round" stroke-width="3"/>
    </svg>
  `,
};

export function getIcon(iconKey: string): string {
  return iconEntries[iconKey] ?? iconEntries.neutral;
}

export const iconKeys = Object.keys(iconEntries);
