import { onUnmounted } from "vue";
import { hasComponent } from "bitecs";
import type { Collider } from "@dimforge/rapier3d-compat";
import { useGame } from "../world/useGame";
import { PHYSICS_TYPE } from "./createPhysics";
import type { PhysicsStore } from "./createPhysics";
import type { ComponentFactory, ComponentStore } from "../types";
import type { SlicedComponents, InstancesOf } from "../entity/types";
import type { Vec3 } from "../types";

// ─── public types ─────────────────────────────────────────────────────────────

export interface CollisionContact<
  S extends Record<string, ComponentFactory>,
  O extends Record<string, ComponentFactory>,
> {
  /** Pre-sliced reactive store fields for this entity. */
  self: SlicedComponents<InstancesOf<S>>;
  /** Pre-sliced reactive store fields for the other entity. */
  other: SlicedComponents<InstancesOf<O>>;
  /** World-space contact normal pointing from self toward other. */
  normal: Vec3;
  /** The Rapier Collider on the other body. */
  otherCollider: Collider;
  /** The name of the collider on this entity that was hit. */
  which: string;
  /** The magnitude of the contact impulse (approximated from velocity). */
  otherEid: number;
}

export interface CollisionContactEnd<
  S extends Record<string, ComponentFactory>,
  O extends Record<string, ComponentFactory>,
> {
  self: SlicedComponents<InstancesOf<S>>;
  other: SlicedComponents<InstancesOf<O>>;
  otherCollider: Collider;
  which: string;
  otherEid: number;
}

// ─── composable ───────────────────────────────────────────────────────────────

/**
 * Listens for collision contacts on `eid`, with optional ECS component filters
 * for both sides. Callbacks only fire when both entities carry the declared
 * components — no manual null checks needed.
 *
 * Pre-sliced reactive component data is passed directly to the callback.
 *
 * Requires usePhysics() to have been called and the entity to carry a physics
 * component from createPhysics().
 *
 * @example
 * useCollision({
 *   eid: swordEid,
 *   self: { damage: createDamage },
 *   other: { health: createHealth },
 *   onContact({ self, other, normal }) {
 *     other.health.current.value -= self.damage.amount.value;
 *   },
 * })
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCollision<
  S extends Record<string, ComponentFactory<any>>,
  O extends Record<string, ComponentFactory<any>>,
>({
  eid,
  self: selfFactories = {} as S,
  other: otherFactories = {} as O,
  collider: colliderFilter,
  onContact,
  onContactEnd,
}: {
  eid: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  self?: S;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  other?: O;
  /** Optional — restrict callbacks to a named collider on this entity. */
  collider?: string;
  onContact?: (params: CollisionContact<S, O>) => void;
  onContactEnd?: (params: CollisionContactEnd<S, O>) => void;
}): void {
  const gameCtx = useGame();
  const activeContacts = new Map<string, Set<number>>();

  const off = gameCtx.registerSystem({
    priority: 1,
    fn: () => {
      const rw = gameCtx.physicsWorld.value;
      if (rw === null) return;

      const physicsStore = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
      if (physicsStore === undefined) return;

      const cMap = physicsStore.colliders[eid];
      if (cMap === undefined) return;

      for (const [name, selfCollider] of Object.entries(cMap)) {
        if (colliderFilter !== undefined && name !== colliderFilter) continue;

        let active = activeContacts.get(name);
        if (active === undefined) {
          active = new Set<number>();
          activeContacts.set(name, active);
        }

        const current = new Set<number>();

        rw.contactPairsWith(selfCollider, (otherCollider: Collider) => {
          current.add(otherCollider.handle);

          if (active?.has(otherCollider.handle) === false) {
            const otherEid = gameCtx.colliderRegistry.get(otherCollider.handle);
            if (otherEid === undefined) return;

            if (passesFilter(gameCtx.world, eid, selfFactories, gameCtx.storeRegistry) === false)
              return;
            if (
              passesFilter(gameCtx.world, otherEid, otherFactories, gameCtx.storeRegistry) === false
            )
              return;

            if (onContact !== undefined) {
              const normal = getContactNormal(rw, selfCollider, otherCollider);
              onContact({
                self: sliceFactories(selfFactories, eid, gameCtx.storeRegistry),
                other: sliceFactories(otherFactories, otherEid, gameCtx.storeRegistry),
                normal,
                otherCollider,
                which: name,
                otherEid,
              });
            }
          }
        });

        for (const handle of active) {
          if (current.has(handle) === false) {
            if (onContactEnd !== undefined) {
              const otherEid = gameCtx.colliderRegistry.get(handle);
              if (otherEid === undefined) continue;
              const otherCollider = rw.getCollider(handle);
              if (otherCollider === null) continue;

              if (passesFilter(gameCtx.world, eid, selfFactories, gameCtx.storeRegistry) === false)
                continue;
              if (
                passesFilter(gameCtx.world, otherEid, otherFactories, gameCtx.storeRegistry) ===
                false
              )
                continue;

              onContactEnd({
                self: sliceFactories(selfFactories, eid, gameCtx.storeRegistry),
                other: sliceFactories(otherFactories, otherEid, gameCtx.storeRegistry),
                otherCollider,
                which: name,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

interface RapierWorldForNormal {
  contactPair: (
    a: Collider,
    b: Collider,
    fn: (manifold: { normal(): { x: number; y: number; z: number } }, flipped: boolean) => void,
  ) => void;
}

function getContactNormal(world: RapierWorldForNormal, self: Collider, other: Collider): Vec3 {
  let normal: Vec3 = { x: 0, y: 0, z: 0 };
  world.contactPair(self, other, (manifold, flipped) => {
    const n = manifold.normal();
    normal = flipped === true ? { x: -n.x, y: -n.y, z: -n.z } : { x: n.x, y: n.y, z: n.z };
  });
  return normal;
}
