import { shallowRef, readonly } from "vue";
import { tryOnMounted, tryOnUnmounted } from "@vueuse/core";
import type { ShallowRef, Ref } from "vue";
import type { Object3D } from "three";

import { createEntity, destroyEntity } from "../ecs/world";
import { Transform } from "../ecs/components";
import { useDumasContext } from "./useDumasContext";
import type { GameObjectOptions, Vec3, Quat, ReactiveEntityRefs } from "../types";

export interface GameObjectReturn {
  groupRef: ShallowRef<Object3D | null>;
  eid: number;
  position: Readonly<Ref<Vec3>>;
  rotation: Readonly<Ref<Quat>>;
}

export function useGameObject(options?: GameObjectOptions): GameObjectReturn {
  const ctx = useDumasContext();

  const eid = createEntity({ world: ctx.ecsWorld });

  // Set initial transform from options
  const pos = options?.position ?? { x: 0, y: 0, z: 0 };
  const rot = options?.rotation ?? { x: 0, y: 0, z: 0, w: 1 };
  const scale = options?.scale ?? { x: 1, y: 1, z: 1 };

  Transform.posX[eid] = pos.x;
  Transform.posY[eid] = pos.y;
  Transform.posZ[eid] = pos.z;
  Transform.rotX[eid] = rot.x;
  Transform.rotY[eid] = rot.y;
  Transform.rotZ[eid] = rot.z;
  Transform.rotW[eid] = rot.w;
  Transform.scaleX[eid] = scale.x;
  Transform.scaleY[eid] = scale.y;
  Transform.scaleZ[eid] = scale.z;

  // Reactive refs for Vue template bindings (updated each frame by reactiveSyncSystem)
  const position = shallowRef<Vec3>({ x: pos.x, y: pos.y, z: pos.z });
  const rotation = shallowRef<Quat>({ x: rot.x, y: rot.y, z: rot.z, w: rot.w });

  const reactiveRefs: ReactiveEntityRefs = { position, rotation };
  ctx.reactiveEntities.set(eid, reactiveRefs);

  // Template ref for the TresGroup — registered in entityMeshMap on mount
  const groupRef = shallowRef<Object3D | null>(null);

  tryOnMounted(() => {
    const group = groupRef.value;
    if (group !== null) {
      ctx.entityMeshMap.set(eid, group);
      group.position.set(pos.x, pos.y, pos.z);
      group.scale.set(scale.x, scale.y, scale.z);
      group.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    }
  });

  tryOnUnmounted(() => {
    destroyEntity({
      world: ctx.ecsWorld,
      eid,
      maps: {
        entityBodyMap: ctx.entityBodyMap,
        entityColliderMap: ctx.entityColliderMap,
        colliderEntityMap: ctx.colliderEntityMap,
        entityMeshMap: ctx.entityMeshMap,
        reactiveEntities: ctx.reactiveEntities,
      },
      collisionHandlers: ctx.collisionHandlers,
    });
  });

  return {
    groupRef,
    eid,
    position: readonly(position),
    rotation: readonly(rotation),
  };
}
