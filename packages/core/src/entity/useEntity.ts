import { onUnmounted } from "vue";
import { addComponent, addEntity, removeEntity } from "bitecs";
import { useWorld } from "../world/useWorld";
import { PersistentTag } from "../ecs/components";
import type { EntityContext, EntityOptions } from "./types";

export function useEntity(options?: EntityOptions): EntityContext {
  const { ecsWorld } = useWorld();
  const isPersistent = options?.persistent === true;

  const eid = addEntity(ecsWorld);

  if (isPersistent === true) {
    addComponent(ecsWorld, eid, PersistentTag);
  }

  onUnmounted(() => {
    removeEntity(ecsWorld, eid);
  });

  return { eid, isPersistent };
}
