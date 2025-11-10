/**
 * Merges class names together
 * @param classes - Class names to merge
 * @returns Merged class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
