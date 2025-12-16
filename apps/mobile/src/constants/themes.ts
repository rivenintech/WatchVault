import { type Theme } from "@react-navigation/native";
import { fonts } from "@react-navigation/native/src/theming/fonts";

// Extends the default theme for native elements
export interface ThemeType extends Theme {
  colors: Theme["colors"] & {
    textSecondary: string;
    textHeading: string;
    error: string;
  };
}

export const Themes: { [key: string]: ThemeType } = {
  Dark: {
    dark: true,
    colors: {
      primary: "#bb86fc", // Main brand color (lighter for contrast on dark backgrounds)
      background: "#121212", // Dark app background
      card: "#1e1e1e", // Darker cards, modal backgrounds
      text: "#ffffff", // Default light text color
      border: "#2c2c2c", // Low-contrast borders
      notification: "#cf6679", // Notifications/badges (adjusted for dark mode contrast)
      // primaryVariant: "#3700b3", // Darker variant of primary (used for pressed states)
      secondary: "#03dac6", // Secondary color (works well on dark)
      textSecondary: "#bbbbbb", // Less prominent text
      textHeading: "#ffffff", // Heading text (typically same as default text, just bold)
      success: "#00e676", // Positive messages
      warning: "#ffc400", // Warnings
      error: "#cf6679", // Errors (adjusted for dark background)
      disabled: "#666666", // Disabled text/buttons
      divider: "#2c2c2c", // Dividers/separators
    },
    fonts,
  },
  Light: {
    dark: false,
    colors: {
      primary: "#6200ee", // Main brand color for buttons, links, etc.
      background: "#ffffff", // App background (screens, base layout)
      card: "#f5f5f5", // Background for cards, headers, tab bars
      text: "#000000", // Default text color
      border: "#e0e0e0", // Borders around cards, list items, etc.
      notification: "#ff3b30", // Used for badge alerts or in-app notifications
      // primaryVariant: "#3700b3", // A darker version of primary for pressed/hover states
      secondary: "#03dac6", // Secondary accent color (e.g. secondary buttons, highlights)
      textSecondary: "#666666", // Subdued text (e.g. captions, metadata)
      textHeading: "#333333", // Heading/title text (slightly bolder)
      success: "#00c853", // Positive messages, confirmations, success toasts
      warning: "#ffab00", // Warnings, caution messages
      error: "#b00020", // Errors, validation, failed actions
      disabled: "#cccccc", // For disabled buttons, text, etc.
      divider: "#e0e0e0", // Horizontal rules, list separators
    },
    fonts,
  },
};

export function ChooseTheme(theme: string): ThemeType {
  if (!Themes[theme]) {
    return Themes.Dark;
  }

  return Themes[theme];
}

export const ThemeList = () => Object.keys(Themes).map((key) => ({ label: key, value: key }));
