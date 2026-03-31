import type { ComponentFactory } from "../types";
import type { SlicedTransform } from "../ecs/transformHelpers";
import type { InstancesOf, SlicedComponents } from "./types";
import { useEcsComponent } from "./useEcsComponent";

// ─── public types ────────────────────────────────────────────────────────────

export interface PrefabDefinition<F extends Record<string, ComponentFactory>> {
  components: F;
  defaults?: (params: {
    transform: SlicedTransform;
    components: SlicedComponents<InstancesOf<F>>;
  }) => void;
}

// ─── factory ─────────────────────────────────────────────────────────────────

/**
 * Captures a set of components and an optional defaults initializer as a
 * reusable prefab template. Call `usePrefab(MyPrefab)` inside component
 * setup to create a fully-wired entity.
 *
 * @example
 * // Define once at module scope
 * const EnemyPrefab = definePrefab({
 *   components: {
 *     physics: createPhysics({ type: "dynamic", colliders: { body: createSphereCollider({ radius: 0.5 }) } }),
 *     health: createHealth,
 *   },
 *   defaults({ transform, components }) {
 *     transform.posY.value = 5;
 *     components.health.current.value = 100;
 *   },
 * });
 *
 * // Spawn in any component
 * const { eid, transform } = usePrefab(EnemyPrefab);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function definePrefab<F extends Record<string, ComponentFactory<any>>>(
  definition: PrefabDefinition<F>,
): PrefabDefinition<F> {
  return definition;
}

/**
 * Creates an entity from a prefab definition, attaching all declared components
 * and applying the defaults initializer. Equivalent to `useEcsComponent` with
 * the prefab's component map, plus running the defaults callback.
 *
 * Must be called during component setup (same constraints as useEcsComponent).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePrefab<F extends Record<string, ComponentFactory<any>>>(
  prefab: PrefabDefinition<F>,
): SlicedComponents<InstancesOf<F>> & { eid: number; transform: SlicedTransform } {
  const result = useEcsComponent({ components: prefab.components });

  if (prefab.defaults !== undefined) {
    const { eid: _eid, transform: _transform, ...componentSlices } = result;
    prefab.defaults({
      transform: result.transform,
      components: componentSlices as unknown as SlicedComponents<InstancesOf<F>>,
    });
  }

  return result;
}
