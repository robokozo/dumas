import { tryOnUnmounted } from "@vueuse/core";

import { useDumasContext } from "./useDumasContext";
import type { CollisionHandler } from "../types";

export function useCollisionHandler({
  eid,
  handler,
}: {
  eid: number;
  handler: CollisionHandler;
}): void {
  const ctx = useDumasContext();

  const unsubscribe = ctx.registerCollisionHandler({ eid, handler });

  tryOnUnmounted(() => {
    unsubscribe();
  });
}
