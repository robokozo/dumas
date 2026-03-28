import { onUnmounted } from "vue";
import { addComponents, removeComponent, entityExists } from "bitecs";
import type { ComponentRef } from "bitecs";
import { useWorld } from "../world/useWorld";
import { useSystem } from "../system/useSystem";
import type { SystemFn } from "../system/types";

export function useEcsComponent({
  eid,
  components,
  fn,
}: {
  eid: number;
  components: Array<ComponentRef>;
  fn?: SystemFn;
}): {
  eid: number;
} {
  const { ecsWorld } = useWorld();

  addComponents(ecsWorld, eid, components);

  if (fn !== undefined) {
    useSystem({
      components,
      fn: ({ delta, elapsed, world }) => {
        fn({ delta, elapsed, world });
      },
    });
  }

  onUnmounted(() => {
    if (entityExists(ecsWorld, eid) === true) {
      removeComponent(ecsWorld, eid, ...components);
    }
  });

  return { eid };
}
