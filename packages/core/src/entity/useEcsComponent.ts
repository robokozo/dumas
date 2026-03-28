import { onUnmounted } from "vue";
import { addComponents } from "bitecs";
import { useGame } from "../world/useGame";
import { useEntity } from "./useEntity";
import { useSystem } from "../system/useSystem";
import type { ComponentFactory, ComponentStore } from "../types";
import type { EntityOptions, InstancesOf, SlicedComponents } from "./types";

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

export function useEcsComponent<F extends Record<string, ComponentFactory>>({
  components: factories,
  fn,
  persistent,
}: {
  components: F;
  fn?: (params: { delta: number; elapsed: number } & SlicedComponents<InstancesOf<F>>) => void;
  persistent?: EntityOptions["persistent"];
}): SlicedComponents<InstancesOf<F>> & { eid: number } {
  const { world, storeRegistry } = useGame();
  const { eid } = useEntity({ persistent });

  // Resolve or create store instances from the game-scoped registry.
  // Using the factory function as the Map key means each unique factory
  // gets exactly one store instance per <Game>, preventing eid collisions.
  const components = Object.fromEntries(
    Object.entries(factories).map(([key, factory]) => {
      let instance = storeRegistry.get(factory);
      if (instance === undefined) {
        instance = factory();
        storeRegistry.set(factory, instance);
      }
      return [key, instance];
    }),
  ) as InstancesOf<F>;

  const componentArray = Object.values(components) as Array<ComponentStore>;

  // Call onMounted() before addComponents so that ShallowRef fields exist
  // immediately — bitECS onAdd observers fire deferred and would be too late.
  for (const comp of componentArray) {
    comp.onMounted?.({ eid });
  }

  addComponents(world, eid, componentArray);

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
