// computes the pixel value of a rem size
export function getComputedFontSizePx(remValue: string): number {
  const rootFontSize =
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return Number.parseFloat(remValue) * rootFontSize;
}
