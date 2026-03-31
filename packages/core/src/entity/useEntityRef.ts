import { computed, isRef } from "vue";
import type { Ref } from "vue";
import { hasComponent } from "bitecs";
import { useGame } from "../world/useGame";
import { createTransform } from "../ecs/components";
import type { TransformStore } from "../ecs/components";
import { createSlicedTransform } from "../ecs/transformHelpers";
import type { SlicedTransform } from "../ecs/transformHelpers";
import type { ComponentFactory } from "../types";
import type { InstancesOf, SlicedComponents, SlicedStore } from "./types";

/**
 * Gives reactive, sliced read/write access to an existing entity's components.
 * The read-only counterpart to useEcsComponent — does not create or own the entity.
 *
 * `eid` accepts a plain number or `Ref<number | null>` so it works when the
 * target entity hasn't spawned yet. When eid is null, all sliced fields are
 * undefined.
 *
 * @example
 * const player = useEntityRef({
 *   eid: playerEid,
 *   components: { physics: createPhysics },
 * });
 *
 * player.transform.posX.value; // reactive
 * player.has(PlayerTag);       // component check
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEntityRef<F extends Record<string, ComponentFactory<any>>>({
  eid: eidInput,
  components: factories = {} as F,
}: {
  eid: number | Ref<number | null>;
  components?: F;
}): {
  eid: Ref<number | null>;
  transform: SlicedTransform | null;
  has: (params: { tag: ComponentFactory }) => boolean;
} & SlicedComponents<InstancesOf<F>> {
  const { world, storeRegistry } = useGame();

  const eidRef = isRef(eidInput) ? eidInput : computed(() => eidInput as number | null);

  // Resolve transform store
  const transformKey = createTransform.__type ?? createTransform;
  const transformStore = storeRegistry.get(transformKey) as TransformStore | undefined;

  // Resolve user-provided component stores
  const resolvedStores = Object.fromEntries(
    Object.entries(factories).map(([key, factory]) => {
      const storeKey = (factory as ComponentFactory).__type ?? factory;
      const store = storeRegistry.get(storeKey);
      return [key, store ?? {}];
    }),
  ) as InstancesOf<F>;

  // Slice user components — returns proxied objects that index by current eid
  const slicedUser = Object.fromEntries(
    Object.entries(resolvedStores).map(([key, store]) => {
      const sliced = new Proxy(
        {},
        {
          get(_, field: string) {
            const eid = eidRef.value;
            if (eid === null) return undefined;
            const arr = (store as Record<string, unknown>)[field];
            if (Array.isArray(arr)) return arr[eid];
            return undefined;
          },
        },
      );
      return [key, sliced];
    }),
  ) as SlicedComponents<InstancesOf<F>>;

  // Slice transform — static slice at current eid, or null
  function getTransform(): SlicedTransform | null {
    const eid = eidRef.value;
    if (eid === null || transformStore === undefined) return null;
    const raw: Record<string, unknown> = {};
    for (const field of Object.keys(transformStore)) {
      const arr = (transformStore as unknown as Record<string, Array<unknown>>)[field];
      if (Array.isArray(arr)) {
        raw[field] = arr[eid];
      }
    }
    return createSlicedTransform(raw as SlicedStore<TransformStore>);
  }

  function has({ tag }: { tag: ComponentFactory }): boolean {
    const eid = eidRef.value;
    if (eid === null) return false;
    const storeKey = tag.__type ?? tag;
    const store = storeRegistry.get(storeKey);
    if (store === undefined) return false;
    return hasComponent(world, eid, store);
  }

  return {
    eid: eidRef,
    get transform() {
      return getTransform();
    },
    has,
    ...slicedUser,
  };
}
