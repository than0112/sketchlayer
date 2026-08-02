export type HslColor = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function hslToHex({ h, s, l }: HslColor): string {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const part = hue / 60;
  const x = chroma * (1 - Math.abs((part % 2) - 1));
  const [red, green, blue] =
    part < 1 ? [chroma, x, 0]
      : part < 2 ? [x, chroma, 0]
        : part < 3 ? [0, chroma, x]
          : part < 4 ? [0, x, chroma]
            : part < 5 ? [x, 0, chroma]
              : [chroma, 0, x];
  const match = lightness - chroma / 2;
  return `#${[red, green, blue]
    .map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function hexToHsl(hex: string): HslColor {
  const normalized = hex.replace("#", "");
  if (!/^[\da-f]{6}$/i.test(normalized)) throw new Error(`Invalid hex color: ${hex}`);
  const [red, green, blue] = [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;
  let hue = 0;
  if (delta !== 0) {
    if (max === red) hue = 60 * (((green - blue) / delta) % 6);
    else if (max === green) hue = 60 * ((blue - red) / delta + 2);
    else hue = 60 * ((red - green) / delta + 4);
  }
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return { h: (hue + 360) % 360, s: saturation * 100, l: lightness * 100 };
}
