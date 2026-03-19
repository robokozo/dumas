import { shallowRef, ref } from "vue";
import { createSharedComposable } from "@vueuse/core";
import type RAPIER from "@dimforge/rapier3d-compat";

import { createDumasWorld } from "../ecs/world";
import { initRapier, createPhysicsWorld } from "../physics/init";
import { DEFAULT_GRAVITY } from "../constants";
import { useGameLoop } from "./useGameLoop";
import type { DumasContext, WorldOptions, SystemFn, SystemEntry, CollisionHandler } from "../types";

function _useWorld(options?: WorldOptions): DumasContext {
  const gravity = options?.gravity ?? DEFAULT_GRAVITY;

  const { ecsWorld, maps } = createDumasWorld();

  const physicsWorld = shallowRef<RAPIER.World | null>(null);
  const rapier = shallowRef<typeof RAPIER | null>(null);
  const isReady = ref(false);

  const systems: Array<SystemEntry> = [];
  const collisionHandlers = new Map<number, Array<CollisionHandler>>();

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

  function registerCollisionHandler({
    eid,
    handler,
  }: {
    eid: number;
    handler: CollisionHandler;
  }): () => void {
    const handlers = collisionHandlers.get(eid);
    if (handlers !== undefined) {
      handlers.push(handler);
    } else {
      collisionHandlers.set(eid, [handler]);
    }

    return () => {
      const list = collisionHandlers.get(eid);
      if (list === undefined) {
        return;
      }
      const index = list.indexOf(handler);
      if (index !== -1) {
        list.splice(index, 1);
      }
      if (list.length === 0) {
        collisionHandlers.delete(eid);
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
    colliderEntityMap: maps.colliderEntityMap,
    entityMeshMap: maps.entityMeshMap,
    reactiveEntities: maps.reactiveEntities,
    systems,
    collisionHandlers,
    jointMap: new Map(),
    registerSystem,
    registerCollisionHandler,
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
