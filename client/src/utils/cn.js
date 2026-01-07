import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour fusionner les classes Tailwind proprement
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

