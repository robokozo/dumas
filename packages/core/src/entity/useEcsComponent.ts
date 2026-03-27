import { onUnmounted } from "vue";
import { addComponents, removeComponent, entityExists } from "bitecs";
import type { ComponentRef } from "bitecs";
import { useWorld } from "../world/useWorld";

export function useEcsComponent({
  eid,
  components,
}: {
  eid: number;
  components: Array<ComponentRef>;
}): {
  eid: number;
} {
  const { ecsWorld } = useWorld();

  addComponents(ecsWorld, eid, components);

  onUnmounted(() => {
    if (entityExists(ecsWorld, eid) === true) {
      removeComponent(ecsWorld, eid, ...components);
    }
  });

  return { eid };
}
