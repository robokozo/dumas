import { createWorld, onAdd, observe } from "bitecs";
import type { World } from "bitecs";
import { Transform } from "./components";

/**
 * Creates a configured bitECS world with non-zero component defaults applied
 * via observers. Call once inside <World> on mount.
 */
export function createEcsWorld(): World {
  const world = createWorld();

  // Quaternion identity (w = 1) and unit scale cannot be expressed as bitECS
  // defaults, so we apply them reactively via onAdd observers.
  observe(world, onAdd(Transform), (eid) => {
    Transform.rotW[eid] = 1;
    Transform.scaleX[eid] = 1;
    Transform.scaleY[eid] = 1;
    Transform.scaleZ[eid] = 1;
  });

  return world;
}

/**
 * Compute a djb2 hash of a string, returned as a number safe to store in
 * a Float64Array. Used by SceneTag to identify scene ownership without
 * storing strings in ECS memory.
 */
export function hashSceneName({ name }: { name: string }): number {
  let hash = 5381;
  for (let i = 0; i < name.length; i++) {
    // djb2: hash * 33 ^ char
    hash = ((hash << 5) + hash) ^ name.charCodeAt(i);
  }
  // Convert to unsigned 32-bit so the value is always positive
  return hash >>> 0;
}
