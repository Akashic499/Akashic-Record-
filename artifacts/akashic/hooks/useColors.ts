import colors from "@/constants/colors";

/**
 * Always returns the dark palette — Akashic Record is a dark-mode-only app.
 */
export function useColors() {
  const palette =
    "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
