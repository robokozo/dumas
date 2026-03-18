import { tryOnUnmounted } from "@vueuse/core";

import { useWorld } from "./useWorld";
import type { SystemFn } from "../types";

const DEFAULT_PRIORITY = 0;

export function useSystem({ fn, priority }: { fn: SystemFn; priority?: number }): void {
  const ctx = useWorld();

  const unsubscribe = ctx.registerSystem({
    fn,
    priority: priority ?? DEFAULT_PRIORITY,
  });

  tryOnUnmounted(() => {
    unsubscribe();
  });
}
