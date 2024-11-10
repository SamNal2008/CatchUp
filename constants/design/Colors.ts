/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


export const Palette = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GREY_100: '#F3F2F8',
  GREY_200: '#E2E2E4',
  GREY_300: '#8A898E',
  RED: '#FF0000',
} as const;

export const Colors = {
  light: {
    text: Palette.BLACK,
    background: Palette.GREY_100,
    tint: Palette.BLACK,
    icon: Palette.GREY_300,
    tabIconDefault: Palette.GREY_200,
    tabIconSelected: Palette.GREY_200,
    borderColor: Palette.BLACK,
    buttonBackground: Palette.BLACK,
    buttonText: Palette.WHITE,
    buttonBackgroundDisabled: Palette.GREY_300,
    toastBackground: Palette.WHITE,
  },
  dark: {
    text: Palette.BLACK,
    background: Palette.GREY_100,
    tint: Palette.BLACK,
    icon: Palette.GREY_300,
    tabIconDefault: Palette.GREY_200,
    tabIconSelected: Palette.GREY_200,
    borderColor: Palette.BLACK,
    buttonBackground: Palette.BLACK,
    buttonText: Palette.WHITE,
    buttonBackgroundDisabled: Palette.GREY_300,
    toastBackground: Palette.WHITE,
  },
} as const;

/**
 * Old black :
 * text: '#ECEDEE',
    background: '#151718',
    tint: Palette.GREY_200,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: Palette.GREY_200,
    borderColor: Palette.WHITE,
    itemBackground: '#1C1C1E',
    itemAction: Palette.WHITE
 */
