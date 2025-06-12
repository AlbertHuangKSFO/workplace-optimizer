/**
 * Defines the application's color palette.
 * These are primarily for reference or for use in JavaScript-driven styling.
 * For most component styling, prefer using Tailwind CSS utility classes directly.
 *
 * The iTools style typically uses a range of grays/neutrals with an accent color.
 * We're using Tailwind's neutral and sky colors as a base.
 */
export const appColors = {
  background: {
    dark: 'var(--color-bg-dark, #171717)', // neutral-900
    mediumDark: 'var(--color-bg-medium-dark, #262626)', // neutral-800
    lightDark: 'var(--color-bg-light-dark, #404040)', // neutral-700
  },
  text: {
    primaryDark: 'var(--color-text-primary-dark, #f5f5f5)', // neutral-100
    secondaryDark: 'var(--color-text-secondary-dark, #a3a3a3)', // neutral-400
    tertiaryDark: 'var(--color-text-tertiary-dark, #737373)', // neutral-500
  },
  accent: {
    primary: 'var(--color-accent-primary, #0ea5e9)', // sky-500
    primaryHover: 'var(--color-accent-primary-hover, #0284c7)', // sky-600
  },
  border: {
    dark: 'var(--color-border-dark, #404040)', // neutral-700
  },
  // Add other color categories as needed (e.g., success, error, warning)
  // success: 'var(--color-success, #22c55e)', // green-500
  // error: 'var(--color-error, #ef4444)', // red-500
  // warning: 'var(--color-warning, #f97316)', // orange-500
};

// Example how these could be used to define CSS variables in globals.css
/*
:root {
  --color-bg-dark: #171717;
  --color-bg-medium-dark: #262626;
  --color-text-primary-dark: #f5f5f5;
  --color-accent-primary: #0ea5e9;
  // ... and so on
}
*/
