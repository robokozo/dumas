import { inject } from "vue";
import { ENTITY_KEY } from "../keys";
import type { EntityContext } from "./types";

export function useEntityContext(): EntityContext {
  const ctx = inject(ENTITY_KEY);
  if (ctx === undefined) {
    throw new Error("[dumas] useEntityContext() must be called inside an <Entity> component.");
  }
  return ctx;
}
