/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Palette de couleurs Hydroholic
const primary = '#1c5588'; // Bleu oscuro
const secondary = '#00bdc8'; // Cyan
const accent = '#7acfb0'; // Verde menta
const light = '#fbce9e'; // Naranja claro
const dark = '#f88f52'; // Naranja oscuro

const tintColorLight = primary;
const tintColorDark = secondary;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: primary,
    secondary: secondary,
    accent: accent,
    light: light,
    dark: dark,
    success: accent,
    warning: dark,
    info: secondary,
    lightGray: '#f5f5f5',
    border: '#e0e0e0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: primary,
    secondary: secondary,
    accent: accent,
    light: light,
    dark: dark,
    success: accent,
    warning: dark,
    info: secondary,
    lightGray: '#2a2a2a',
    border: '#333333',
  },
};

// Export palette for easy access
export const Palette = {
  primary,
  secondary,
  accent,
  light,
  dark,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
