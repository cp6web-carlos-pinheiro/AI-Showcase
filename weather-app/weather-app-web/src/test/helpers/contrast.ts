export function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '').trim();

  if (cleaned.length === 3) {
    return cleaned.split('').map((char) => Number.parseInt(`${char}${char}`, 16)) as [number, number, number];
  }

  if (cleaned.length !== 6) {
    throw new Error(`Cor inválida: ${hex}`);
  }

  return [
    Number.parseInt(cleaned.slice(0, 2), 16),
    Number.parseInt(cleaned.slice(2, 4), 16),
    Number.parseInt(cleaned.slice(4, 6), 16),
  ];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(colorA: string, colorB: string): number {
  const lighter = relativeLuminance(colorA);
  const darker = relativeLuminance(colorB);
  const [high, low] = [lighter, darker].sort((a, b) => b - a);

  return (high + 0.05) / (low + 0.05);
}
