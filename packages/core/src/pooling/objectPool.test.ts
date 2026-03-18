import { describe, it, expect, beforeAll, vi } from "vite-plus/test";
import { createWorld } from "bitecs";

import { initRapier, createPhysicsWorld } from "../physics/init";
import { createObjectPool } from "./objectPool";
import type { ObjectPoolOptions } from "../types";

let rapier: Awaited<ReturnType<typeof initRapier>>;

beforeAll(async () => {
  rapier = await initRapier();
});

function makePhysicsWorld() {
  return createPhysicsWorld({ gravity: { x: 0, y: -9.81, z: 0 } });
}

function makeMaps() {
  return {
    entityBodyMap: new Map(),
    entityColliderMap: new Map(),
    entityMeshMap: new Map(),
    reactiveEntities: new Map(),
  };
}

const SPHERE_OPTIONS: ObjectPoolOptions = {
  size: 5,
  bodyType: "dynamic",
  colliderOptions: { shape: "sphere", radius: 0.5 },
};

describe("createObjectPool", () => {
  it("pre-allocates the correct number of handles", () => {
    const physicsWorld = makePhysicsWorld();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps: makeMaps(),
      options: SPHERE_OPTIONS,
    });

    expect(pool.handles.length).toBe(5);
    expect(pool.availableCount).toBe(5);
    expect(pool.activeCount).toBe(0);
  });

  it("all handles start inactive and physics disabled", () => {
    const physicsWorld = makePhysicsWorld();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps: makeMaps(),
      options: SPHERE_OPTIONS,
    });

    expect(pool.handles.every((h) => h.isActive === false)).toBe(true);
    expect(pool.handles.every((h) => h.rigidBody.isEnabled() === false)).toBe(true);
  });

  it("registers all entities in entityBodyMap and entityColliderMap", () => {
    const physicsWorld = makePhysicsWorld();
    const maps = makeMaps();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps,
      options: SPHERE_OPTIONS,
    });

    expect(maps.entityBodyMap.size).toBe(5);
    expect(maps.entityColliderMap.size).toBe(5);
    expect(pool.handles.every((h) => maps.entityBodyMap.get(h.eid) === h.rigidBody)).toBe(true);
    expect(pool.handles.every((h) => maps.entityColliderMap.get(h.eid) === h.collider)).toBe(true);
  });

  it("acquire() returns a handle, marks it active, and enables physics", () => {
    const physicsWorld = makePhysicsWorld();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps: makeMaps(),
      options: SPHERE_OPTIONS,
    });

    const handle = pool.acquire();

    expect(handle).not.toBeNull();
    expect(handle!.isActive).toBe(true);
    expect(handle!.rigidBody.isEnabled()).toBe(true);
    expect(pool.availableCount).toBe(4);
    expect(pool.activeCount).toBe(1);
  });

  it("acquire() returns null and warns when pool is exhausted", () => {
    const physicsWorld = makePhysicsWorld();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps: makeMaps(),
      options: { ...SPHERE_OPTIONS, size: 2 },
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    pool.acquire();
    pool.acquire();
    const handle = pool.acquire();

    expect(handle).toBeNull();
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });

  it("release() parks the body and marks handle inactive", () => {
    const parkPosition = { x: 0, y: -10000, z: 0 };
    const physicsWorld = makePhysicsWorld();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps: makeMaps(),
      options: SPHERE_OPTIONS,
    });

    const handle = pool.acquire()!;
    pool.release({ eid: handle.eid });

    expect(handle.isActive).toBe(false);
    expect(handle.rigidBody.isEnabled()).toBe(false);
    expect(handle.rigidBody.translation().y).toBeCloseTo(parkPosition.y);
    expect(pool.availableCount).toBe(5);
    expect(pool.activeCount).toBe(0);
  });

  it("destroyAll() removes all entities from entity maps", () => {
    const physicsWorld = makePhysicsWorld();
    const maps = makeMaps();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps,
      options: SPHERE_OPTIONS,
    });

    pool.destroyAll();

    expect(maps.entityBodyMap.size).toBe(0);
    expect(maps.entityColliderMap.size).toBe(0);
    expect(pool.handles.length).toBe(0);
  });

  it("respects custom parkPosition", () => {
    const customPark = { x: 99, y: 99, z: 99 };
    const physicsWorld = makePhysicsWorld();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps: makeMaps(),
      options: { ...SPHERE_OPTIONS, parkPosition: customPark },
    });

    expect(pool.handles[0].rigidBody.translation().x).toBeCloseTo(99);
    expect(pool.handles[0].rigidBody.translation().y).toBeCloseTo(99);
  });

  it("release() on unknown eid is a no-op and does not throw", () => {
    const physicsWorld = makePhysicsWorld();
    const pool = createObjectPool({
      ecsWorld: createWorld(),
      physicsWorld,
      rapier,
      maps: makeMaps(),
      options: SPHERE_OPTIONS,
    });

    expect(() => pool.release({ eid: 99999 })).not.toThrow();
    expect(pool.availableCount).toBe(5);
  });
});
