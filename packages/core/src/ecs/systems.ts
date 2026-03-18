import { query } from "bitecs";
import type { World } from "bitecs";
import type RAPIER from "@dimforge/rapier3d-compat";
import type { Object3D } from "three";

import { Transform, RigidBodyRef } from "./components";
import type { ReactiveEntityRefs } from "../types";

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
  const entities = query(ecsWorld, [Transform]);

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
    refs.position.value = {
      x: Transform.posX[eid],
      y: Transform.posY[eid],
      z: Transform.posZ[eid],
    };

    refs.rotation.value = {
      x: Transform.rotX[eid],
      y: Transform.rotY[eid],
      z: Transform.rotZ[eid],
      w: Transform.rotW[eid],
    };
  }
}
