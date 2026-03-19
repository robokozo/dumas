import { shallowRef, ref, watch, readonly } from "vue";
import { tryOnUnmounted } from "@vueuse/core";

import { useWorld } from "../composables/useWorld";
import { createObjectPool } from "./objectPool";
import type { WorldMaps } from "../ecs/world";
import type { ObjectPoolOptions, ObjectPoolReturn, PoolHandle } from "../types";

export function useObjectPool(options: ObjectPoolOptions): ObjectPoolReturn {
  const ctx = useWorld();

  const handles = shallowRef<ReadonlyArray<PoolHandle>>([]);
  const available = ref<number>(0);
  const active = ref<number>(0);

  let pool: ReturnType<typeof createObjectPool> | null = null;

  function initPool(): void {
    const rapier = ctx.rapier.value;
    const physicsWorld = ctx.physicsWorld.value;

    if (rapier === null || physicsWorld === null) {
      return;
    }

    const maps: WorldMaps = {
      entityBodyMap: ctx.entityBodyMap,
      entityColliderMap: ctx.entityColliderMap,
      colliderEntityMap: ctx.colliderEntityMap,
      entityMeshMap: ctx.entityMeshMap,
      reactiveEntities: ctx.reactiveEntities,
    };

    pool = createObjectPool({ ecsWorld: ctx.ecsWorld, physicsWorld, rapier, maps, options });
    handles.value = pool.handles;
    available.value = pool.availableCount;
    active.value = pool.activeCount;
  }

  if (ctx.isReady.value === true) {
    initPool();
  } else {
    const stopWatch = watch(ctx.isReady, (isReady) => {
      if (isReady === true) {
        initPool();
        stopWatch();
      }
    });
  }

  function acquire(): PoolHandle | null {
    if (pool === null) {
      console.warn("[dumas] useObjectPool: acquire() called before pool is initialized.");
      return null;
    }
    const handle = pool.acquire();
    available.value = pool.availableCount;
    active.value = pool.activeCount;
    return handle;
  }

  function release({ eid }: { eid: number }): void {
    if (pool === null) {
      return;
    }
    pool.release({ eid });
    available.value = pool.availableCount;
    active.value = pool.activeCount;
  }

  tryOnUnmounted(() => {
    if (pool !== null) {
      pool.destroyAll();
      pool = null;
    }
  });

  return {
    handles,
    available: readonly(available),
    active: readonly(active),
    acquire,
    release,
  };
}
