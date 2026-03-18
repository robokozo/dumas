import { createWorld, addEntity, removeEntity, addComponent, observe, onAdd } from "bitecs";
import type { World } from "bitecs";
import type RAPIER from "@dimforge/rapier3d-compat";
import type { Object3D } from "three";

import { Transform } from "./components";
import { TRANSFORM_DEFAULTS } from "../constants";
import type { ReactiveEntityRefs } from "../types";

export interface WorldMaps {
  entityBodyMap: Map<number, RAPIER.RigidBody>;
  entityColliderMap: Map<number, RAPIER.Collider>;
  entityMeshMap: Map<number, Object3D>;
  reactiveEntities: Map<number, ReactiveEntityRefs>;
}

export function createDumasWorld(): { ecsWorld: World; maps: WorldMaps } {
  const ecsWorld = createWorld();

  // Register ZAII observers to set non-zero defaults when Transform is added
  observe(ecsWorld, onAdd(Transform), (eid: number) => {
    Transform.rotW[eid] = TRANSFORM_DEFAULTS.rotW;
    Transform.scaleX[eid] = TRANSFORM_DEFAULTS.scaleX;
    Transform.scaleY[eid] = TRANSFORM_DEFAULTS.scaleY;
    Transform.scaleZ[eid] = TRANSFORM_DEFAULTS.scaleZ;
  });

  const maps: WorldMaps = {
    entityBodyMap: new Map(),
    entityColliderMap: new Map(),
    entityMeshMap: new Map(),
    reactiveEntities: new Map(),
  };

  return { ecsWorld, maps };
}

export function createEntity({ world }: { world: World }): number {
  const eid = addEntity(world);
  addComponent(world, eid, Transform);
  return eid;
}

export function destroyEntity({
  world,
  eid,
  maps,
}: {
  world: World;
  eid: number;
  maps: WorldMaps;
}): void {
  maps.entityBodyMap.delete(eid);
  maps.entityColliderMap.delete(eid);
  maps.entityMeshMap.delete(eid);
  maps.reactiveEntities.delete(eid);
  removeEntity(world, eid);
}

export { addComponent };
