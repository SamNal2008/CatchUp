export const Size = {
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
  full: "100%",
} as const;

export const BorderRadius = {
  small: 4,
  medium: 8,
  mediumLarge: 12,
  large: 16,
  extraLarge: 24,
  round: 100,
} as const;

export const Spacing = {
  verySmall: 6,
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
} as const;

export const Typography = {
  small: 12,
  medium: 14,
  large: 24,
  extraLarge: 32,
} as const;

export const LineHeight = {
  small: 16,
  medium: 21,
  large: 32,
  extraLarge: 42,
} as const;

export const FontWeight = {
  light: "light",
  regular: "regular",
  semibold: "semibold",
  bold: "bold",
  heavy: "heavy",
  medium: "400",
  sevenHundred: "700",
} as const;

export const LetterSpacing = {
  small: 0.25,
  medium: 0.5,
  large: 1,
} as const;

export const Typography2 = {
  caption: {
    police: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 21,
  },
  title2: {
    police: "Inter",
    fontWeight: "600",
    fontSize: 20,
    lineHeight: 24,
  },
  title1: {
    police: "Inter",
    fontWeight: "600",
    fontSize: 28,
    lineHeight: 32,
  },
  title: {
    police: "Inter",
    fontWeight: "700",
    fontSize: 40,
    lineHeight: 32,
  },
} as const;
