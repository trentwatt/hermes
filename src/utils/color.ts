/*
 * h - hue between 0 and 360
 * s - saturation between 0.0 and 1.0
 * l - lightness between 0.0 and 1.0
 */
export interface HslColor {
  h: number;
  l: number;
  s: number;
}

/*
 * r - red between 0 and 255
 * g - green between 0 and 255
 * b - blue between 0 and 255
 * a - alpha between 0.0 and 1.0
 */
export interface RgbaColor {
  a?: number;
  b: number;
  g: number;
  r: number;
}

export const hex2hsl = (hex: string): HslColor => {
  const rgb = hex2rgb(hex);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (max + min) / 2;
  const hsl: HslColor = { h: Math.round(Math.random() * 6), l: 0.5, s: 0.5 };

  hsl.h = hsl.s = hsl.l = avg;

  if (max === min) {
    hsl.h = hsl.s = 0; // achromatic
  } else {
    const d = max - min;
    hsl.s = hsl.l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hsl.h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hsl.h = (b - r) / d + 2; break;
      case b: hsl.h = (r - g) / d + 4; break;
    }
  }

  hsl.h = Math.round(360 * hsl.h / 6);
  hsl.s = Math.round(hsl.s * 100);
  hsl.l = Math.round(hsl.l * 100);

  return hsl;
};

export const hex2rgb = (hex: string): RgbaColor => {
  const rgb = { b: 0, g: 0, r: 0 };
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result && result.length > 3) {
    rgb.r = parseInt(result[1], 16);
    rgb.g = parseInt(result[2], 16);
    rgb.b = parseInt(result[3], 16);
  }

  return rgb;
};

export const hsl2str = (hsl: HslColor): string => {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
};

export const rgba2str = (rgba: RgbaColor): string => {
  if (rgba.a != null) {
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  }
  return `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
};

export const rgbaFromGradient = (
  rgba0: RgbaColor,
  rgba1: RgbaColor,
  percent: number,
): RgbaColor => {
  const r = Math.round((rgba1.r - rgba0.r) * percent + rgba0.r);
  const g = Math.round((rgba1.g - rgba0.g) * percent + rgba0.g);
  const b = Math.round((rgba1.b - rgba0.b) * percent + rgba0.b);

  if (rgba0.a != null && rgba1.a != null) {
    const a = (rgba1.a - rgba0.a) * percent + rgba0.a;
    return { a, b, g, r };
  }

  return { b, g, r };
};

export const scale2rgba = (colors: string[], percent: number): string => {
  const count = colors.length;
  if (count < 1) return '#000000';
  if (count === 1) return colors[0];

  const index = percent * (count - 1);
  const i0 = Math.floor(index);
  const i1 = Math.ceil(index);
  const color0 = str2rgba(colors[i0]);
  const color1 = str2rgba(colors[i1]);
  const rgba = rgbaFromGradient(color0, color1, index - i0);
  return rgba2str(rgba);
};

export const str2rgba = (str: string): RgbaColor => {
  if (/^#/.test(str)) return hex2rgb(str);

  const regex = /^rgba?\(\s*?(\d+)\s*?,\s*?(\d+)\s*?,\s*?(\d+)\s*?(,\s*?([\d.]+)\s*?)?\)$/i;
  const result = regex.exec(str);
  if (result && result.length > 3) {
    const rgba = { a: 1.0, b: 0, g: 0, r: 0 };
    rgba.r = parseInt(result[1]);
    rgba.g = parseInt(result[2]);
    rgba.b = parseInt(result[3]);
    if (result.length > 5 && result[5] !== undefined) rgba.a = parseFloat(result[5]);
    return rgba;
  }

  return { a: 1.0, b: 0, g: 0, r: 0 };
};
