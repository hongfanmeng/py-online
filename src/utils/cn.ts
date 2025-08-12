import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes conditionally.
 * Uses `clsx` for conditional logic and `tailwind-merge` to resolve conflicts.
 *
 * @param inputs - Any number of class values (strings, arrays, objects, etc.)
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
