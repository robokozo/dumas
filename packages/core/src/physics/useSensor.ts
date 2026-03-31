import { onUnmounted } from "vue";
import { hasComponent } from "bitecs";
import type { Collider } from "@dimforge/rapier3d-compat";
import { useGame } from "../world/useGame";
import { PHYSICS_TYPE } from "./createPhysics";
import type { PhysicsStore } from "./createPhysics";
import type { ComponentFactory, ComponentStore } from "../types";
import type { SlicedComponents, InstancesOf } from "../entity/types";

// ─── public types ─────────────────────────────────────────────────────────────

export interface SensorEvent<O extends Record<string, ComponentFactory>> {
  /** Pre-sliced reactive store fields for the overlapping entity. */
  other: SlicedComponents<InstancesOf<O>>;
  /** The Rapier Collider that entered/exited the sensor. */
  otherCollider: Collider;
  /** bitECS entity ID of the overlapping entity. */
  otherEid: number;
}

// ─── composable ───────────────────────────────────────────────────────────────

/**
 * Detects when other bodies enter or exit a sensor collider on `eid`.
 *
 * The sensor collider must be declared with `sensor: true` in createPhysics().
 * The `other` component filter ensures callbacks only fire when the overlapping
 * entity carries all the required components — no manual null checks needed.
 *
 * Requires usePhysics() to have been called and the entity to carry a physics
 * component from createPhysics().
 *
 * @example
 * // Checkpoint zone:
 * useSensor({
 *   eid: zoneEid,
 *   collider: 'zone',
 *   other: { player: createPlayer },
 *   onEnter({ other }) {
 *     saveCheckpoint({ position: other.player.spawnPoint.value })
 *     showBanner('Checkpoint reached')
 *   },
 *   onExit() {
 *     hideBanner()
 *   },
 * })
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSensor<O extends Record<string, ComponentFactory<any>>>({
  eid,
  collider: colliderFilter,
  other: otherFactories = {} as O,
  onEnter,
  onExit,
}: {
  eid: number;
  /** Optional — restrict to a named sensor collider on this entity. */
  collider?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  other?: O;
  onEnter?: (params: SensorEvent<O>) => void;
  onExit?: (params: SensorEvent<O>) => void;
}): void {
  const gameCtx = useGame();
  const activeOverlaps = new Map<string, Set<number>>();

  const off = gameCtx.registerSystem({
    priority: 1,
    fn: () => {
      const rw = gameCtx.physicsWorld.value;
      if (rw === null) return;

      const physicsStore = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
      if (physicsStore === undefined) return;

      const cMap = physicsStore.colliders[eid];
      if (cMap === undefined) return;

      for (const [name, sensorCollider] of Object.entries(cMap)) {
        if (colliderFilter !== undefined && name !== colliderFilter) continue;

        let active = activeOverlaps.get(name);
        if (active === undefined) {
          active = new Set<number>();
          activeOverlaps.set(name, active);
        }

        const current = new Set<number>();

        rw.intersectionPairsWith(sensorCollider, (otherCollider: Collider) => {
          current.add(otherCollider.handle);

          if (active?.has(otherCollider.handle) === false) {
            const otherEid = gameCtx.colliderRegistry.get(otherCollider.handle);
            if (otherEid === undefined) return;
            if (
              passesFilter(gameCtx.world, otherEid, otherFactories, gameCtx.storeRegistry) === false
            )
              return;

            onEnter?.({
              other: sliceFactories(otherFactories, otherEid, gameCtx.storeRegistry),
              otherCollider,
              otherEid,
            });
          }
        });

        for (const handle of active) {
          if (current.has(handle) === false) {
            if (onExit !== undefined) {
              const otherEid = gameCtx.colliderRegistry.get(handle);
              if (otherEid === undefined) continue;
              const otherCollider = rw.getCollider(handle);
              if (otherCollider === null) continue;
              if (
                passesFilter(gameCtx.world, otherEid, otherFactories, gameCtx.storeRegistry) ===
                false
              )
                continue;

              onExit({
                other: sliceFactories(otherFactories, otherEid, gameCtx.storeRegistry),
                otherCollider,
                otherEid,
              });
            }
          }
        }

        active.clear();
        for (const h of current) {
          active.add(h);
        }
      }
    },
  });

  onUnmounted(off);
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function passesFilter(
  world: ReturnType<typeof import("bitecs").createWorld>,
  eid: number,
  factories: Record<string, ComponentFactory>,
  storeRegistry: Map<object | symbol, ComponentStore>,
): boolean {
  for (const factory of Object.values(factories)) {
    const storeKey = (factory as ComponentFactory).__type ?? factory;
    const store = storeRegistry.get(storeKey);
    if (store === undefined) return false;
    if (hasComponent(world, eid, store) === false) return false;
  }
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sliceFactories<F extends Record<string, ComponentFactory<any>>>(
  factories: F,
  eid: number,
  storeRegistry: Map<object | symbol, ComponentStore>,
): SlicedComponents<InstancesOf<F>> {
  return Object.fromEntries(
    Object.entries(factories).map(([key, factory]) => {
      const storeKey = (factory as ComponentFactory).__type ?? factory;
      const store = storeRegistry.get(storeKey) ?? {};
      return [
        key,
        Object.fromEntries(
          Object.entries(store)
            .filter(([, val]) => Array.isArray(val))
            .map(([field, arr]) => [field, (arr as Array<unknown>)[eid]]),
        ),
      ];
    }),
  ) as SlicedComponents<InstancesOf<F>>;
}
