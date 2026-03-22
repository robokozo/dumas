import type RAPIER from "@dimforge/rapier3d-compat";
import type { World } from "bitecs";

import { addComponent } from "../ecs/world";
import { Transform, RigidBodyRef, ColliderRef } from "../ecs/components";
import { createEntity, destroyEntity } from "../ecs/world";
import { createRigidBody } from "./bodies";
import { createCollider } from "./colliders";
import type { WorldMaps } from "../ecs/world";
import type { Vec3, ObjectPoolOptions, PoolHandle } from "../types";

const DEFAULT_BODY_TYPE = "dynamic" as const;
const DEFAULT_PARK_POSITION: Vec3 = { x: 0, y: -10000, z: 0 } as const;
const DEFAULT_PARK_ROTATION = { x: 0, y: 0, z: 0, w: 1 } as const;

export interface ObjectPoolState {
  handles: ReadonlyArray<PoolHandle>;
  availableCount: number;
  activeCount: number;
  acquire: () => PoolHandle | null;
  release: (params: { eid: number }) => void;
  destroyAll: () => void;
}

export function createObjectPool({
  ecsWorld,
  physicsWorld,
  rapier,
  maps,
  options,
}: {
  ecsWorld: World;
  physicsWorld: RAPIER.World;
  rapier: typeof RAPIER;
  maps: WorldMaps;
  options: ObjectPoolOptions;
}): ObjectPoolState {
  const parkPosition = options.parkPosition ?? DEFAULT_PARK_POSITION;
  const bodyType = options.bodyType ?? DEFAULT_BODY_TYPE;

  const handles: Array<PoolHandle> = [];

  for (let i = 0; i < options.size; i++) {
    const eid = createEntity({ world: ecsWorld });

    Transform.posX[eid] = parkPosition.x;
    Transform.posY[eid] = parkPosition.y;
    Transform.posZ[eid] = parkPosition.z;

    const rigidBody = createRigidBody({
      physicsWorld,
      rapier,
      type: bodyType,
      position: parkPosition,
      rotation: DEFAULT_PARK_ROTATION,
    });
    rigidBody.setEnabled(false);

    addComponent(ecsWorld, eid, RigidBodyRef);
    RigidBodyRef.handle[eid] = rigidBody.handle;
    maps.entityBodyMap.set(eid, rigidBody);

    const collider = createCollider({
      physicsWorld,
      rapier,
      rigidBody,
      options: { ...options.colliderOptions, eid },
    });

    addComponent(ecsWorld, eid, ColliderRef);
    ColliderRef.handle[eid] = collider.handle;
    maps.entityColliderMap.set(eid, collider);
    maps.colliderEntityMap.set(collider.handle, eid);

    handles.push({ eid, rigidBody, collider, isActive: false });
  }

  function acquire(): PoolHandle | null {
    const handle = handles.find((h) => h.isActive === false) ?? null;

    if (handle === null) {
      console.warn(
        `[dumas] ObjectPool exhausted: all ${options.size} handles are active. Consider increasing pool size.`,
      );
      return null;
    }

    handle.isActive = true;
    handle.rigidBody.setEnabled(true);
    return handle;
  }

  function release({ eid }: { eid: number }): void {
    const handle = handles.find((h) => h.eid === eid) ?? null;

    if (handle === null) {
      return;
    }

    handle.isActive = false;
    handle.rigidBody.setEnabled(false);
    handle.rigidBody.setTranslation(parkPosition, true);
    handle.rigidBody.setRotation(DEFAULT_PARK_ROTATION, true);
    handle.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    handle.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }, true);

    Transform.posX[eid] = parkPosition.x;
    Transform.posY[eid] = parkPosition.y;
    Transform.posZ[eid] = parkPosition.z;
  }

  function destroyAll(): void {
    for (const handle of handles) {
      physicsWorld.removeCollider(handle.collider, true);
      physicsWorld.removeRigidBody(handle.rigidBody);
      destroyEntity({ world: ecsWorld, eid: handle.eid, maps });
    }
    handles.length = 0;
  }

  return {
    handles: handles as ReadonlyArray<PoolHandle>,
    get availableCount() {
      return handles.filter((h) => h.isActive === false).length;
    },
    get activeCount() {
      return handles.filter((h) => h.isActive === true).length;
    },
    acquire,
    release,
    destroyAll,
  };
}
