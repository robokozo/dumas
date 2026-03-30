import { computed, onUnmounted, shallowRef } from "vue";
import { addComponents, addEntity, removeEntity } from "bitecs";
import { useGame } from "../world/useGame";
import type { ComponentFactory, ComponentStore } from "../types";
import type { InstancesOf, SlicedComponents } from "../entity/types";
import type { PoolInstance, PoolSlot } from "./types";

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

export function usePool<F extends Record<string, ComponentFactory>>({
  size,
  components: factories,
}: {
  size: number;
  components: F;
}): PoolInstance<F> {
  const { world, storeRegistry } = useGame();

  // Resolve stores using __type symbol when available (mirrors useEcsComponent).
  const factoryEntries = Object.entries(factories);

  const stores = Object.fromEntries(
    factoryEntries.map(([key, factory]) => {
      const storeKey = (factory as ComponentFactory).__type ?? factory;
      let instance = storeRegistry.get(storeKey);
      if (instance === undefined) {
        instance = factory();
        storeRegistry.set(storeKey, instance);
      }
      return [key, instance];
    }),
  ) as InstancesOf<F>;

  const componentArray = Object.values(stores) as Array<ComponentStore>;

  const slots: Array<PoolSlot<F>> = [];
  const freeList: Array<number> = [];

  for (let i = 0; i < size; i++) {
    const eid = addEntity(world);

    // Call factory.onMounted (lifecycle now lives on the factory, not the store).
    for (const [, factory] of factoryEntries) {
      const storeKey = (factory as ComponentFactory).__type ?? factory;
      const store = storeRegistry.get(storeKey);
      if (store !== undefined) {
        (factory as ComponentFactory).onMounted?.({ eid, store });
      }
    }

    addComponents(world, eid, componentArray);

    const isActive = shallowRef(false);
    const components = sliceComponents({
      components: stores,
      eid,
    }) as SlicedComponents<InstancesOf<F>>;

    slots.push({ eid, isActive, components });
    freeList.push(eid);
  }

  const eidToSlot = new Map<number, PoolSlot<F>>(slots.map((slot) => [slot.eid, slot]));

  function acquire(): number | null {
    const eid = freeList.pop();
    if (eid === undefined) return null;
    const slot = eidToSlot.get(eid);
    if (slot !== undefined) {
      slot.isActive.value = true;
    }
    return eid;
  }

  function release({ eid }: { eid: number }): void {
    const slot = eidToSlot.get(eid);
    if (slot === undefined || slot.isActive.value === false) return;
    slot.isActive.value = false;
    freeList.push(eid);
  }

  onUnmounted(() => {
    for (const slot of slots) {
      for (const [, factory] of factoryEntries) {
        const storeKey = (factory as ComponentFactory).__type ?? factory;
        const store = storeRegistry.get(storeKey);
        if (store !== undefined) {
          (factory as ComponentFactory).onUnmounted?.({ eid: slot.eid, store });
        }
      }
      removeEntity(world, slot.eid);
    }
  });

  const activeCount = computed(() => slots.filter((s) => s.isActive.value === true).length);
  const freeCount = computed(() => slots.length - activeCount.value);

  return { slots, stores, activeCount, freeCount, acquire, release };
}
