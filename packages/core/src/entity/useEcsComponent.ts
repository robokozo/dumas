import { onUnmounted } from "vue";
import { addComponents } from "bitecs";
import { useWorld } from "../world/useWorld";
import { useEntity } from "./useEntity";
import { useSystem } from "../system/useSystem";
import type { ComponentStore } from "../types";
import type { EntityOptions, SlicedComponents } from "./types";

function sliceComponents<R extends Record<string, ComponentStore>>({
  components,
  eid,
}: {
  components: R;
  eid: number;
}): SlicedComponents<R> {
  return Object.fromEntries(
    Object.entries(components).map(([key, comp]) => [
      key,
      Object.fromEntries(
        Object.entries(comp)
          .filter(([, val]) => Array.isArray(val))
          .map(([field, arr]) => [field, (arr as Array<unknown>)[eid]]),
      ),
    ]),
  ) as SlicedComponents<R>;
}

export function useEcsComponent<R extends Record<string, ComponentStore>>({
  components,
  fn,
  persistent,
}: {
  components: R;
  fn?: (params: { delta: number; elapsed: number } & SlicedComponents<R>) => void;
  persistent?: EntityOptions["persistent"];
}): SlicedComponents<R> & { eid: number } {
  const { ecsWorld } = useWorld();
  const { eid } = useEntity({ persistent });

  const componentArray = Object.values(components);

  // Call onMounted() before addComponents so that ShallowRef fields exist
  // immediately — bitECS onAdd observers fire deferred and would be too late.
  for (const comp of componentArray) {
    comp.onMounted?.({ eid });
  }

  addComponents(ecsWorld, eid, componentArray);

  const sliced = sliceComponents({ components, eid });

  if (fn !== undefined) {
    useSystem({
      components: componentArray,
      fn: ({ delta, elapsed }) => {
        fn({ delta, elapsed, ...sliced });
      },
    });
  }

  onUnmounted(() => {
    for (const comp of componentArray) {
      comp.onUnmounted?.({ eid });
    }
  });

  return { ...sliced, eid };
}
