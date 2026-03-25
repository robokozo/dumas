import { shallowRef, ref } from "vue";
import type RAPIER from "@dimforge/rapier3d-compat";

import { createDumasWorld } from "../ecs/world";
import { initRapier, createPhysicsWorld } from "../physics/init";
import { DEFAULT_GRAVITY, DEFAULT_TIMESTEP } from "../constants";
import type { DumasContext, WorldOptions, SystemFn, SystemEntry, CollisionHandler } from "../types";

export function createWorldContext(options?: WorldOptions): DumasContext {
  const gravity = options?.gravity ?? DEFAULT_GRAVITY;
  const fixedTimestep = options?.fixedTimestep ?? DEFAULT_TIMESTEP;

  const { ecsWorld, maps } = createDumasWorld();

  const physicsWorld = shallowRef<RAPIER.World | null>(null);
  const rapier = shallowRef<typeof RAPIER | null>(null);
  const isReady = ref(false);

  const systems: Array<SystemEntry> = [];
  const collisionHandlers = new Map<number, Array<CollisionHandler>>();
  const inputPollCallbacks: Array<() => void> = [];

  function registerInputPoll(fn: () => void): () => void {
    inputPollCallbacks.push(fn);
    return () => {
      const index = inputPollCallbacks.indexOf(fn);
      if (index !== -1) {
        inputPollCallbacks.splice(index, 1);
      }
    };
  }

  function registerSystem({ fn, priority }: { fn: SystemFn; priority: number }): () => void {
    const entry: SystemEntry = { fn, priority };
    systems.push(entry);
    systems.sort((a, b) => a.priority - b.priority);

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
    fixedTimestep,
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
    inputPollCallbacks,
    registerInputPoll,
  };

  // Init Rapier WASM asynchronously — physics starts once loaded
  const initPhysics = async () => {
    const rapierModule = await initRapier();
    rapier.value = rapierModule;
    const world = createPhysicsWorld({ gravity });
    world.timestep = fixedTimestep;
    physicsWorld.value = world;
    isReady.value = true;
  };

  void initPhysics();

  return ctx;
}
