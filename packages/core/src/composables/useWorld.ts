import { shallowRef, ref } from "vue";
import { createSharedComposable } from "@vueuse/core";
import type RAPIER from "@dimforge/rapier3d-compat";

import { createDumasWorld } from "../ecs/world";
import { initRapier, createPhysicsWorld } from "../physics/init";
import { DEFAULT_GRAVITY } from "../constants";
import { useGameLoop } from "./useGameLoop";
import type { DumasContext, WorldOptions, SystemFn, SystemEntry } from "../types";

function _useWorld(options?: WorldOptions): DumasContext {
  const gravity = options?.gravity ?? DEFAULT_GRAVITY;

  const { ecsWorld, maps } = createDumasWorld();

  const physicsWorld = shallowRef<RAPIER.World | null>(null);
  const rapier = shallowRef<typeof RAPIER | null>(null);
  const isReady = ref(false);

  const systems: Array<SystemEntry> = [];

  function registerSystem({ fn, priority }: { fn: SystemFn; priority: number }): () => void {
    const entry: SystemEntry = { fn, priority };
    systems.push(entry);

    // Return unsubscribe function
    return () => {
      const index = systems.indexOf(entry);
      if (index !== -1) {
        systems.splice(index, 1);
      }
    };
  }

  const ctx: DumasContext = {
    ecsWorld,
    physicsWorld,
    rapier,
    isReady,
    entityBodyMap: maps.entityBodyMap,
    entityColliderMap: maps.entityColliderMap,
    entityMeshMap: maps.entityMeshMap,
    reactiveEntities: maps.reactiveEntities,
    systems,
    registerSystem,
  };

  // Init Rapier WASM asynchronously — physics starts once loaded
  const initPhysics = async () => {
    const rapierModule = await initRapier();
    rapier.value = rapierModule;
    physicsWorld.value = createPhysicsWorld({ gravity });
    isReady.value = true;
  };

  void initPhysics();

  // Wire up the game loop (hooks into TresJS useLoop)
  useGameLoop({ ctx });

  return ctx;
}

export const useWorld = createSharedComposable((options?: WorldOptions) => _useWorld(options));
