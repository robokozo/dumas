import { inject } from "vue";
import { WORLD_KEY } from "../keys";
import type { WorldContext } from "./types";

export function useWorld(): WorldContext {
  const ctx = inject(WORLD_KEY);
  if (ctx === undefined) {
    throw new Error("[dumas] useWorld() must be called inside a <World> component.");
  }
  return ctx;
}
