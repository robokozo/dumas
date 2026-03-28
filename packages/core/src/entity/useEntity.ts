import { onUnmounted } from "vue";
import { addComponent, addEntity, removeEntity } from "bitecs";
import { useGame } from "../world/useGame";
import { PersistentTag } from "../ecs/components";
import type { EntityContext, EntityOptions } from "./types";

export function useEntity({ persistent }: EntityOptions = {}): EntityContext {
  const { world } = useGame();
  const isPersistent = persistent === true;

  const eid = addEntity(world);

  if (isPersistent === true) {
    addComponent(world, eid, PersistentTag);
  }

  onUnmounted(() => {
    removeEntity(world, eid);
  });

  return { eid, isPersistent };
}
