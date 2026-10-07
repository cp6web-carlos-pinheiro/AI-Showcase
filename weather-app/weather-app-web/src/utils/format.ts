const PT_BR_LOCALE = 'pt-BR';

function parseDateFromApiValue(value: string): Date | null {
  const [datePart] = value.split('T');

  if (!datePart) {
    return null;
  }

  const [year, month, day] = datePart.split('-').map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(value: string): string {
  const date = parseDateFromApiValue(value);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(PT_BR_LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(PT_BR_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatValueWithUnit(value: number, unit: string): string {
  return `${formatNumber(value)} ${unit}`.trim();
}

export function normalizeAngle(angle: number): number {
  const normalized = ((angle % 360) + 360) % 360;
  return Number.isFinite(normalized) ? normalized : 0;
}

export function getCardinalDirection(angle: number): string {
  const normalized = normalizeAngle(angle);

  if (normalized >= 337.5 || normalized < 22.5) {
    return 'N';
  }

  if (normalized < 67.5) {
    return 'NE';
  }

  if (normalized < 112.5) {
    return 'L';
  }

  if (normalized < 157.5) {
    return 'SE';
  }

  if (normalized < 202.5) {
    return 'S';
  }

  if (normalized < 247.5) {
    return 'SO';
  }

  if (normalized < 292.5) {
    return 'O';
  }

  return 'NO';
}

export function formatWind(speed: number, angle: number, unit = 'km/h'): string {
  const roundedDegrees = Math.round(normalizeAngle(angle));
  return `${formatNumber(speed)} ${unit} · ${roundedDegrees}° (${getCardinalDirection(angle)})`;
}
