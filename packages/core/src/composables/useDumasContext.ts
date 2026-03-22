import { inject } from "vue";
import { DUMAS_CONTEXT_KEY } from "../keys";
import type { DumasContext } from "../types";

export function useDumasContext(): DumasContext {
  const ctx = inject(DUMAS_CONTEXT_KEY);

  if (ctx === undefined) {
    throw new Error("useDumasContext: must be called inside a <DumasCanvas>");
  }

  return ctx;
}
