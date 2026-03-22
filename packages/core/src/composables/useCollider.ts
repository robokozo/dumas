import { shallowRef } from "vue";
import { tryOnUnmounted, watchOnce } from "@vueuse/core";
import type { ShallowRef } from "vue";
import type RAPIER from "@dimforge/rapier3d-compat";
import { addComponent } from "bitecs";

import { useDumasContext } from "./useDumasContext";
import { createCollider } from "../physics/colliders";
import { ColliderRef } from "../ecs/components";
import type { ColliderOptions } from "../types";

export interface ColliderReturn {
  collider: ShallowRef<RAPIER.Collider | null>;
}

export function useCollider(options: ColliderOptions): ColliderReturn {
  const ctx = useDumasContext();
  const { eid } = options;

  const collider = shallowRef<RAPIER.Collider | null>(null);

  function initCollider(): void {
    const rapier = ctx.rapier.value;
    const physicsWorld = ctx.physicsWorld.value;
    const body = ctx.entityBodyMap.get(eid) ?? null;

    if (rapier === null || physicsWorld === null || body === null) {
      return;
    }

    const col = createCollider({ physicsWorld, rapier, rigidBody: body, options });

    collider.value = col;
    addComponent(ctx.ecsWorld, eid, ColliderRef);
    ColliderRef.handle[eid] = col.handle;
    ctx.entityColliderMap.set(eid, col);
    ctx.colliderEntityMap.set(col.handle, eid);
  }

  if (ctx.isReady.value === true) {
    initCollider();
  } else {
    watchOnce(ctx.isReady, () => {
      initCollider();
    });
  }

  tryOnUnmounted(() => {
    const physicsWorld = ctx.physicsWorld.value;
    if (collider.value !== null && physicsWorld !== null) {
      ctx.colliderEntityMap.delete(collider.value.handle);
      physicsWorld.removeCollider(collider.value, true);
    }
    ctx.entityColliderMap.delete(eid);
  });

  return { collider };
}
