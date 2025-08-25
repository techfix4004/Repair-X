import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(..._inputs: ClassValue[]) {
  return twMerge(clsx(_inputs))
}