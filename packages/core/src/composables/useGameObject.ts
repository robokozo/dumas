import { shallowRef, readonly } from "vue";
import { tryOnMounted, tryOnUnmounted } from "@vueuse/core";
import type { ShallowRef, Ref } from "vue";
import type { Object3D } from "three";

import { createEntity, destroyEntity } from "../ecs/world";
import { Transform } from "../ecs/components";
import { useWorld } from "./useWorld";
import type { GameObjectOptions, Vec3, Quat, ReactiveEntityRefs } from "../types";

export interface GameObjectReturn {
  groupRef: ShallowRef<Object3D | null>;
  eid: number;
  position: Readonly<Ref<Vec3>>;
  rotation: Readonly<Ref<Quat>>;
}

export function useGameObject(options?: GameObjectOptions): GameObjectReturn {
  const ctx = useWorld();

  const eid = createEntity({ world: ctx.ecsWorld });

  // Set initial transform from options
  const pos = options?.position ?? [0, 0, 0];
  const rot = options?.rotation ?? [0, 0, 0, 1];
  const scale = options?.scale ?? [1, 1, 1];

  Transform.posX[eid] = pos[0];
  Transform.posY[eid] = pos[1];
  Transform.posZ[eid] = pos[2];
  Transform.rotX[eid] = rot[0];
  Transform.rotY[eid] = rot[1];
  Transform.rotZ[eid] = rot[2];
  Transform.rotW[eid] = rot[3];
  Transform.scaleX[eid] = scale[0];
  Transform.scaleY[eid] = scale[1];
  Transform.scaleZ[eid] = scale[2];

  // Reactive refs for Vue template bindings (updated each frame by reactiveSyncSystem)
  const position = shallowRef<Vec3>({ x: pos[0], y: pos[1], z: pos[2] });
  const rotation = shallowRef<Quat>({ x: rot[0], y: rot[1], z: rot[2], w: rot[3] });

  const reactiveRefs: ReactiveEntityRefs = { position, rotation };
  ctx.reactiveEntities.set(eid, reactiveRefs);

  // Template ref for the TresGroup — registered in entityMeshMap on mount
  const groupRef = shallowRef<Object3D | null>(null);

  tryOnMounted(() => {
    if (groupRef.value !== null) {
      ctx.entityMeshMap.set(eid, groupRef.value);
    }
  });

  tryOnUnmounted(() => {
    destroyEntity({
      world: ctx.ecsWorld,
      eid,
      maps: {
        entityBodyMap: ctx.entityBodyMap,
        entityColliderMap: ctx.entityColliderMap,
        entityMeshMap: ctx.entityMeshMap,
        reactiveEntities: ctx.reactiveEntities,
      },
    });
  });

  return {
    groupRef,
    eid,
    position: readonly(position),
    rotation: readonly(rotation),
  };
}
