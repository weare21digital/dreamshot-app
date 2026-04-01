/**
 * Theme Helper Utilities
 *
 * Provides theme-related constants and utilities derived from APP_THEME.
 * To rebrand the app, edit src/config/theme.ts — not this file.
 */

import { ThemeMode } from '../types/settings';
import { APP_THEME } from '../config/theme';

/**
 * Brand color — re-exported from APP_THEME for backward compatibility.
 * Prefer importing APP_THEME directly in new code.
 */
export const BRAND_COLOR = APP_THEME.brand.primary;

/**
 * Status colors — re-exported from APP_THEME for backward compatibility.
 */
export const STATUS_COLORS = APP_THEME.status;

/**
 * Get gradient colors for backgrounds based on theme
 */
export function getGradientColors(themeMode: ThemeMode): [string, string] {
  return themeMode === 'dark' ? [...APP_THEME.dark.gradient] : [...APP_THEME.light.gradient];
}

/**
 * Get input field background color based on theme
 */
export function getInputBackgroundColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.inputBackground : APP_THEME.light.inputBackground;
}

/**
 * Get card/container background color based on theme
 */
export function getCardBackgroundColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.cardBackground : APP_THEME.light.cardBackground;
}

/**
 * Get icon color — returns brand primary
 */
export function getIconColor(): string {
  return APP_THEME.brand.primary;
}

/**
 * Get primary text color based on theme
 */
export function getPrimaryTextColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.text : APP_THEME.light.text;
}

/**
 * Get secondary/dimmed text color based on theme
 */
export function getSecondaryTextColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.textSecondary : APP_THEME.light.textSecondary;
}

/**
 * Get error container background based on theme
 */
export function getErrorContainerColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.errorContainer : APP_THEME.light.errorContainer;
}

/**
 * Get success container background based on theme
 */
export function getSuccessContainerColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.successContainer : APP_THEME.light.successContainer;
}

/**
 * Get info container background based on theme
 */
export function getInfoContainerColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.infoContainer : APP_THEME.light.infoContainer;
}

/**
 * Get warning container background based on theme
 */
export function getWarningContainerColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.warningContainer : APP_THEME.light.warningContainer;
}

/**
 * Get text color for error containers based on theme
 */
export function getOnErrorContainerColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.onErrorContainer : APP_THEME.light.onErrorContainer;
}

/**
 * Get text color for success containers based on theme
 */
export function getOnSuccessContainerColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.onSuccessContainer : APP_THEME.light.onSuccessContainer;
}

/**
 * Get text color for info containers based on theme
 */
export function getOnInfoContainerColor(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? APP_THEME.dark.onInfoContainer : APP_THEME.light.onInfoContainer;
}
