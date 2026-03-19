import { tryOnUnmounted } from "@vueuse/core";

import { useWorld } from "./useWorld";
import type { CollisionHandler } from "../types";

export function useCollisionHandler({
  eid,
  handler,
}: {
  eid: number;
  handler: CollisionHandler;
}): void {
  const ctx = useWorld();

  const unsubscribe = ctx.registerCollisionHandler({ eid, handler });

  tryOnUnmounted(() => {
    unsubscribe();
  });
}
