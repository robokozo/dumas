import { shallowRef, watch } from "vue";
import { tryOnUnmounted } from "@vueuse/core";
import type { ShallowRef } from "vue";
import type RAPIER from "@dimforge/rapier3d-compat";
import { addComponent } from "bitecs";

import { useWorld } from "./useWorld";
import { createRigidBody } from "../physics/bodies";
import { Transform, RigidBodyRef } from "../ecs/components";
import type { RigidBodyOptions, Vec3 } from "../types";

export interface RigidBodyReturn {
  rigidBody: ShallowRef<RAPIER.RigidBody | null>;
  applyImpulse: (impulse: Vec3) => void;
  applyForce: (force: Vec3) => void;
  setLinvel: (vel: Vec3) => void;
  setAngvel: (vel: Vec3) => void;
}

export function useRigidBody(options: RigidBodyOptions): RigidBodyReturn {
  const ctx = useWorld();
  const { eid, type: bodyType = "dynamic" } = options;

  const rigidBody = shallowRef<RAPIER.RigidBody | null>(null);

  function initBody(): void {
    const rapier = ctx.rapier.value;
    const physicsWorld = ctx.physicsWorld.value;

    if (rapier === null || physicsWorld === null) {
      return;
    }

    const position: Vec3 = {
      x: Transform.posX[eid],
      y: Transform.posY[eid],
      z: Transform.posZ[eid],
    };

    const rotation = {
      x: Transform.rotX[eid],
      y: Transform.rotY[eid],
      z: Transform.rotZ[eid],
      w: Transform.rotW[eid],
    };

    const body = createRigidBody({ physicsWorld, rapier, type: bodyType, position, rotation });

    rigidBody.value = body;
    addComponent(ctx.ecsWorld, eid, RigidBodyRef);
    RigidBodyRef.handle[eid] = body.handle;
    ctx.entityBodyMap.set(eid, body);
  }

  if (ctx.isReady.value === true) {
    initBody();
  } else {
    const stopWatch = watch(ctx.isReady, (isReady) => {
      if (isReady === true) {
        initBody();
        stopWatch();
      }
    });
  }

  function applyImpulse(impulse: Vec3): void {
    rigidBody.value?.applyImpulse(impulse, true);
  }

  function applyForce(force: Vec3): void {
    rigidBody.value?.addForce(force, true);
  }

  function setLinvel(vel: Vec3): void {
    rigidBody.value?.setLinvel(vel, true);
  }

  function setAngvel(vel: Vec3): void {
    rigidBody.value?.setAngvel(vel, true);
  }

  tryOnUnmounted(() => {
    const physicsWorld = ctx.physicsWorld.value;
    if (rigidBody.value !== null && physicsWorld !== null) {
      physicsWorld.removeRigidBody(rigidBody.value);
    }
    ctx.entityBodyMap.delete(eid);
  });

  return { rigidBody, applyImpulse, applyForce, setLinvel, setAngvel };
}
