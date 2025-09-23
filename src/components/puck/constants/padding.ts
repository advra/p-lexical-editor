// src/constants/padding.ts
export type Option = { label: string; value: string };

// Tailwind default spacing scale (subset). Remove/add as you like.
// ⚠️ p-18 / p-22 / p-26 are NOT in the default scale.
export const PAD_VALUES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16, 18, 20, 22, 24, 26, 28, 30,
] as const;

export type PaddingClass = `p-${(typeof PAD_VALUES)[number]}`;

// Build options for Puck <select>
export const PADDING_OPTIONS: Option[] = PAD_VALUES.map((n) => ({
  label: String(n),
  value: `p-${n}`,
}));

// Handy lookups
export const PADDING_VALUE_TO_LABEL = Object.fromEntries(
  PADDING_OPTIONS.map((o) => [o.value, o.label]),
) as Record<PaddingClass, string>;

export const PADDING_LABEL_TO_VALUE = Object.fromEntries(
  PADDING_OPTIONS.map((o) => [o.label, o.value]),
) as Record<string, PaddingClass>;

// If you ever need to construct a class from a number:
export const paddingClass = (n: (typeof PAD_VALUES)[number]): PaddingClass =>
  `p-${n}`;
