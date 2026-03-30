import { onUnmounted } from "vue";
import { addComponents } from "bitecs";
import { useGame } from "../world/useGame";
import { useEntity } from "./useEntity";
import { useSystem } from "../system/useSystem";
import { createTransform, TRANSFORM_TYPE } from "../ecs/components";
import type { TransformStore } from "../ecs/components";
import type { ComponentFactory, ComponentStore } from "../types";
import type { EntityOptions, InstancesOf, SlicedComponents, SlicedStore } from "./types";

// ─── helpers ──────────────────────────────────────────────────────────────────

function sliceStore<S extends ComponentStore>(store: S, eid: number): SlicedStore<S> {
  return Object.fromEntries(
    Object.entries(store)
      .filter(([, val]) => Array.isArray(val))
      .map(([field, arr]) => [field, (arr as Array<unknown>)[eid]]),
  ) as SlicedStore<S>;
}

function sliceComponents<R extends Record<string, ComponentStore>>(
  components: R,
  eid: number,
): SlicedComponents<R> {
  return Object.fromEntries(
    Object.entries(components).map(([key, store]) => [key, sliceStore(store, eid)]),
  ) as SlicedComponents<R>;
}

// ─── composable ───────────────────────────────────────────────────────────────

/**
 * Creates a bitECS entity and attaches the declared components to it.
 *
 * A transform component is **always auto-attached** — every entity has
 * position, rotation and scale ShallowRefs available via the returned
 * `transform` field. You do not need to include createTransform in your
 * component map.
 *
 * Component factories may be called **inline in setup** — no module-scope
 * hoisting required — because they carry a stable `__type` symbol that is
 * used as the storeRegistry key instead of the function reference.
 *
 * @example
 * const health = ref(100)
 * const { eid, transform } = useEcsComponent({
 *   components: {
 *     physics: createPhysics({
 *       type: "dynamic",
 *       colliders: { body: createCuboidCollider({ halfExtents: [0.5, 0.5, 0.5] }) },
 *       onCollision: () => { health.value -= 10 },
 *     }),
 *   },
 * })
 * transform.posY.value = 5  // initial position before first physics step
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEcsComponent<F extends Record<string, ComponentFactory<any>>>({
  components: factories,
  fn,
  persistent,
}: {
  components: F;
  fn?: (
    params: { delta: number; elapsed: number } & SlicedComponents<InstancesOf<F>> & {
        transform: SlicedStore<TransformStore>;
      },
  ) => void;
  persistent?: EntityOptions["persistent"];
}): SlicedComponents<InstancesOf<F>> & { eid: number; transform: SlicedStore<TransformStore> } {
  const { world, storeRegistry } = useGame();
  const { eid } = useEntity({ persistent });

  // ── 1. Resolve the transform store (always first) ─────────────────────────
  const transformKey = createTransform.__type ?? createTransform;
  let transformStore = storeRegistry.get(transformKey) as TransformStore | undefined;
  if (transformStore === undefined) {
    transformStore = createTransform();
    storeRegistry.set(transformKey, transformStore);
  }
  // Only call onMounted if the user did not explicitly include createTransform
  // in their own factory map (we detect this below and skip the duplicate call).
  const userIncludesTransform = Object.values(factories).some(
    (f) => (f as ComponentFactory).__type === TRANSFORM_TYPE,
  );
  if (userIncludesTransform === false) {
    createTransform.onMounted?.({ eid, store: transformStore });
  }

  // ── 2. Resolve user-provided component stores ─────────────────────────────
  const resolvedStores = Object.fromEntries(
    Object.entries(factories).map(([key, factory]) => {
      // If the user explicitly passed createTransform, reuse the already-resolved
      // store and call onMounted once (here, since we skipped it above).
      if ((factory as ComponentFactory).__type === TRANSFORM_TYPE) {
        createTransform.onMounted?.({ eid, store: transformStore as TransformStore });
        return [key, transformStore as TransformStore];
      }

      const storeKey = (factory as ComponentFactory).__type ?? factory;
      let store = storeRegistry.get(storeKey);
      if (store === undefined) {
        const created: ComponentStore = factory();
        storeRegistry.set(storeKey, created);
        store = created;
      }
      factory.onMounted?.({ eid, store });
      return [key, store];
    }),
  ) as InstancesOf<F>;

  // ── 3. Register with bitECS ───────────────────────────────────────────────
  const userStoreList = Object.values(resolvedStores) as Array<ComponentStore>;
  const allStores = userIncludesTransform ? userStoreList : [transformStore, ...userStoreList];
  addComponents(world, eid, allStores);

  // ── 4. Slice for reactive access ──────────────────────────────────────────
  const slicedUser = sliceComponents(resolvedStores, eid);
  const slicedTransform = sliceStore(transformStore, eid);

  // ── 5. Register optional per-entity system ────────────────────────────────
  if (fn !== undefined) {
    const capturedFn = fn;
    useSystem({
      components: allStores,
      fn: ({ delta, elapsed }) => {
        capturedFn({ delta, elapsed, ...slicedUser, transform: slicedTransform });
      },
    });
  }

  // ── 6. Cleanup ────────────────────────────────────────────────────────────
  onUnmounted(() => {
    for (const [, factory] of Object.entries(factories)) {
      if ((factory as ComponentFactory).__type === TRANSFORM_TYPE) continue;
      const storeKey = (factory as ComponentFactory).__type ?? factory;
      const store = storeRegistry.get(storeKey);
      if (store !== undefined) {
        (factory as ComponentFactory).onUnmounted?.({ eid, store });
      }
    }
    createTransform.onUnmounted?.({ eid, store: transformStore as TransformStore });
  });

  return { ...slicedUser, eid, transform: slicedTransform };
}
