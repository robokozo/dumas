import { query } from "bitecs";
import type { World } from "bitecs";
import type RAPIER from "@dimforge/rapier3d-compat";
import type { Object3D } from "three";

import { Transform, RigidBodyRef } from "./components";
import type { CollisionEvent, CollisionHandler, ReactiveEntityRefs } from "../types";

// Syncs Rapier rigid body transforms → bitECS Transform SoA arrays
export function physicsSyncSystem({
  ecsWorld,
  entityBodyMap,
}: {
  ecsWorld: World;
  entityBodyMap: Map<number, RAPIER.RigidBody>;
}): void {
  const entities = query(ecsWorld, [Transform, RigidBodyRef]);

  for (const eid of entities) {
    const body = entityBodyMap.get(eid);

    if (body === undefined) {
      continue;
    }

    const translation = body.translation();
    const rotation = body.rotation();

    Transform.posX[eid] = translation.x;
    Transform.posY[eid] = translation.y;
    Transform.posZ[eid] = translation.z;
    Transform.rotX[eid] = rotation.x;
    Transform.rotY[eid] = rotation.y;
    Transform.rotZ[eid] = rotation.z;
    Transform.rotW[eid] = rotation.w;
  }
}

// Syncs bitECS Transform SoA arrays → Three.js Object3D position/quaternion
export function renderSyncSystem({
  ecsWorld,
  entityMeshMap,
}: {
  ecsWorld: World;
  entityMeshMap: Map<number, Object3D>;
}): void {
  const entities = query(ecsWorld, [Transform, RigidBodyRef]);

  for (const eid of entities) {
    const mesh = entityMeshMap.get(eid);

    if (mesh === undefined) {
      continue;
    }

    mesh.position.set(Transform.posX[eid], Transform.posY[eid], Transform.posZ[eid]);

    mesh.quaternion.set(
      Transform.rotX[eid],
      Transform.rotY[eid],
      Transform.rotZ[eid],
      Transform.rotW[eid],
    );

    mesh.scale.set(Transform.scaleX[eid], Transform.scaleY[eid], Transform.scaleZ[eid]);
  }
}

// Syncs bitECS Transform SoA arrays → Vue shallowRef reactive state (batched)
export function reactiveSyncSystem({
  ecsWorld: _ecsWorld,
  reactiveEntities,
}: {
  ecsWorld: World;
  reactiveEntities: Map<number, ReactiveEntityRefs>;
}): void {
  for (const [eid, refs] of reactiveEntities) {
    const px = Transform.posX[eid];
    const py = Transform.posY[eid];
    const pz = Transform.posZ[eid];
    const pos = refs.position.value;
    if (pos.x !== px || pos.y !== py || pos.z !== pz) {
      refs.position.value = { x: px, y: py, z: pz };
    }

    const rx = Transform.rotX[eid];
    const ry = Transform.rotY[eid];
    const rz = Transform.rotZ[eid];
    const rw = Transform.rotW[eid];
    const rot = refs.rotation.value;
    if (rot.x !== rx || rot.y !== ry || rot.z !== rz || rot.w !== rw) {
      refs.rotation.value = { x: rx, y: ry, z: rz, w: rw };
    }
  }
}

// Drains Rapier EventQueue and dispatches collision events to registered handlers.
// drainCollisionEvents covers both solid-solid contacts and sensor intersections in Rapier 0.12.
export function collisionEventSystem({
  eventQueue,
  colliderEntityMap,
  entityColliderMap,
  collisionHandlers,
}: {
  eventQueue: RAPIER.EventQueue;
  colliderEntityMap: Map<number, number>;
  entityColliderMap: Map<number, RAPIER.Collider>;
  collisionHandlers: Map<number, Array<CollisionHandler>>;
}): void {
  eventQueue.drainCollisionEvents((handle1, handle2, isStarted) => {
    const eidA = colliderEntityMap.get(handle1) ?? null;
    const eidB = colliderEntityMap.get(handle2) ?? null;

    if (eidA === null || eidB === null) {
      return;
    }

    const isSensor =
      entityColliderMap.get(eidA)?.isSensor() === true ||
      entityColliderMap.get(eidB)?.isSensor() === true;

    const event: CollisionEvent = {
      eidA,
      eidB,
      type: isStarted === true ? "started" : "stopped",
      isSensor,
    };

    const handlersA = collisionHandlers.get(eidA);
    if (handlersA !== undefined) {
      for (const handler of handlersA) {
        handler(event);
      }
    }

    const handlersB = collisionHandlers.get(eidB);
    if (handlersB !== undefined) {
      for (const handler of handlersB) {
        handler(event);
      }
    }
  });
}
