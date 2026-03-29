import { inject } from "vue";
import { useLoop } from "@tresjs/core";
import { useRapierContext } from "@tresjs/rapier";
import { hasComponent } from "bitecs";
import { GAME_KEY } from "../keys";
import type { RigidBodyColliderContext } from "@tresjs/rapier";
import type { Ref } from "vue";
import type { ComponentFactory, ComponentStore, Vec3 } from "../types";
import type { InstancesOf, SlicedComponents } from "../entity/types";
import type { GameContext } from "../world/types";

// Derived from @tresjs/rapier's exported context type to avoid a direct
// @dimforge/rapier3d-compat import in every consumer.
type Collider = RigidBodyColliderContext["collider"];

// Structural subtype of Rapier's World used for contact normal lookup.
// Avoids importing from @dimforge/rapier3d-compat in consumer code.
interface RapierWorldWithContact {
  contactPair: (
    a: Collider,
    b: Collider,
    fn: (manifold: { normal(): { x: number; y: number; z: number } }, flipped: boolean) => void,
  ) => void;
}

// ─── public types ────────────────────────────────────────────────────────────

/** Payload for useCollision without ECS filters. */
export interface CollisionContact {
  otherCollider: Collider;
  normal: Vec3;
}

/** Payload for useCollision with ECS filters (contact start). */
export interface CollisionContactEcs<
  SF extends Record<string, ComponentFactory>,
  OF extends Record<string, ComponentFactory>,
> {
  otherCollider: Collider;
  normal: Vec3;
  self: SlicedComponents<InstancesOf<SF>>;
  other: SlicedComponents<InstancesOf<OF>>;
}

/**
 * Payload for useCollision with ECS filters (contact end).
 * `normal` is omitted — the contact pair no longer exists when separation
 * is detected so the manifold is unavailable.
 */
export type CollisionContactEndEcs<
  SF extends Record<string, ComponentFactory>,
  OF extends Record<string, ComponentFactory>,
> = Omit<CollisionContactEcs<SF, OF>, "normal">;

// ─── overloads ───────────────────────────────────────────────────────────────

/**
 * Detects when a physics body makes or breaks contact with another body.
 *
 * Must be called inside a component that is a descendant of <Physics>.
 * Polls world.contactPairsWith each frame — reliable regardless of
 * Rapier's internal event-handle ordering.
 */
export function useCollision(options: {
  collider: Ref<Collider | null>;
  onContact?: (contact: CollisionContact) => void;
  onContactEnd?: (contact: Omit<CollisionContact, "normal">) => void;
}): void;

/**
 * ECS-filtered variant. Only fires when both entities carry the declared
 * components. Requires <Game> in the component tree for ECS world access.
 *
 * Call useRegisterCollider({ collider, eid }) on any entity that should be
 * detectable as the `other` side of the filter.
 */
export function useCollision<
  SF extends Record<string, ComponentFactory>,
  OF extends Record<string, ComponentFactory>,
>(options: {
  collider: Ref<Collider | null>;
  selfEid: number;
  self: SF;
  other: OF;
  onContact?: (contact: CollisionContactEcs<SF, OF>) => void;
  onContactEnd?: (contact: CollisionContactEndEcs<SF, OF>) => void;
}): void;

// ─── implementation ──────────────────────────────────────────────────────────

export function useCollision<
  SF extends Record<string, ComponentFactory>,
  OF extends Record<string, ComponentFactory>,
>({
  collider,
  selfEid,
  self: selfFilter,
  other: otherFilter,
  onContact,
  onContactEnd,
}: {
  collider: Ref<Collider | null>;
  selfEid?: number;
  self?: SF;
  other?: OF;
  // Union keeps each overload's callback assignable to the implementation type.
  onContact?:
    | ((contact: CollisionContact) => void)
    | ((contact: CollisionContactEcs<SF, OF>) => void);
  onContactEnd?:
    | ((contact: Omit<CollisionContact, "normal">) => void)
    | ((contact: CollisionContactEndEcs<SF, OF>) => void);
}): void {
  const { world: rapierWorld } = useRapierContext();
  const { onBeforeRender } = useLoop();
  // Optional — only needed when ECS filters are configured.
  const gameCtx = inject(GAME_KEY) ?? null;

  const isFiltered = selfFilter !== undefined || otherFilter !== undefined;
  const activeContacts = new Set<Collider>();

  onBeforeRender(() => {
    const c = collider.value;
    if (c === null) return;

    const current = new Set<Collider>();
    rapierWorld.value.contactPairsWith(c, (other: Collider) => {
      current.add(other);
    });

    for (const otherCollider of current) {
      if (activeContacts.has(otherCollider) === false && onContact !== undefined) {
        if (isFiltered === true) {
          const payload = buildContactPayload({
            c,
            otherCollider,
            selfEid,
            selfFilter,
            otherFilter,
            rapierWorld: rapierWorld.value as unknown as RapierWorldWithContact,
            gameCtx,
          });
          if (payload !== null) {
            (onContact as (contact: CollisionContactEcs<SF, OF>) => void)(payload);
          }
        } else {
          const normal = getContactNormal({
            c,
            otherCollider,
            rapierWorld: rapierWorld.value as unknown as RapierWorldWithContact,
          });
          (onContact as (contact: CollisionContact) => void)({ otherCollider, normal });
        }
      }
    }

    for (const otherCollider of activeContacts) {
      if (current.has(otherCollider) === false && onContactEnd !== undefined) {
        if (isFiltered === true) {
          const payload = buildContactEndPayload({
            otherCollider,
            selfEid,
            selfFilter,
            otherFilter,
            gameCtx,
          });
          if (payload !== null) {
            (onContactEnd as (contact: CollisionContactEndEcs<SF, OF>) => void)(payload);
          }
        } else {
          (onContactEnd as (contact: Omit<CollisionContact, "normal">) => void)({ otherCollider });
        }
      }
    }

    activeContacts.clear();
    for (const other of current) {
      activeContacts.add(other);
    }
  });
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function getContactNormal({
  c,
  otherCollider,
  rapierWorld,
}: {
  c: Collider;
  otherCollider: Collider;
  rapierWorld: RapierWorldWithContact;
}): Vec3 {
  let normal: Vec3 = { x: 0, y: 0, z: 0 };
  rapierWorld.contactPair(c, otherCollider, (manifold, flipped) => {
    const n = manifold.normal();
    // flipped=true means the manifold normal points from other→self; invert so
    // normal always points from self toward other.
    normal = flipped === true ? { x: -n.x, y: -n.y, z: -n.z } : { x: n.x, y: n.y, z: n.z };
  });
  return normal;
}

function resolveStores<F extends Record<string, ComponentFactory>>(
  filter: F,
  storeRegistry: Map<ComponentFactory, ComponentStore>,
): InstancesOf<F> | null {
  const entries: Array<[string, ComponentStore]> = [];
  for (const [key, factory] of Object.entries(filter)) {
    const store = storeRegistry.get(factory as ComponentFactory);
    if (store === undefined) return null;
    entries.push([key, store]);
  }
  return Object.fromEntries(entries) as InstancesOf<F>;
}

function checkComponents(
  world: GameContext["world"],
  eid: number,
  stores: Record<string, ComponentStore>,
): boolean {
  for (const store of Object.values(stores)) {
    if (hasComponent(world, eid, store) === false) return false;
  }
  return true;
}

function sliceStores<R extends Record<string, ComponentStore>>(
  stores: R,
  eid: number,
): SlicedComponents<R> {
  return Object.fromEntries(
    Object.entries(stores).map(([key, store]) => [
      key,
      Object.fromEntries(
        Object.entries(store)
          .filter(([, val]) => Array.isArray(val))
          .map(([field, arr]) => [field, (arr as Array<unknown>)[eid]]),
      ),
    ]),
  ) as SlicedComponents<R>;
}

function buildContactPayload<
  SF extends Record<string, ComponentFactory>,
  OF extends Record<string, ComponentFactory>,
>({
  c,
  otherCollider,
  selfEid,
  selfFilter,
  otherFilter,
  rapierWorld,
  gameCtx,
}: {
  c: Collider;
  otherCollider: Collider;
  selfEid: number | undefined;
  selfFilter: SF | undefined;
  otherFilter: OF | undefined;
  rapierWorld: RapierWorldWithContact;
  gameCtx: GameContext | null;
}): CollisionContactEcs<SF, OF> | null {
  let selfSliced = {} as SlicedComponents<InstancesOf<SF>>;
  if (selfFilter !== undefined) {
    if (selfEid === undefined || gameCtx === null) return null;
    const stores = resolveStores(selfFilter, gameCtx.storeRegistry);
    if (stores === null || checkComponents(gameCtx.world, selfEid, stores) === false) return null;
    selfSliced = sliceStores(stores, selfEid);
  }

  let otherSliced = {} as SlicedComponents<InstancesOf<OF>>;
  if (otherFilter !== undefined) {
    if (gameCtx === null) return null;
    const otherEid = gameCtx.colliderRegistry.get(otherCollider.handle);
    if (otherEid === undefined) return null;
    const stores = resolveStores(otherFilter, gameCtx.storeRegistry);
    if (stores === null || checkComponents(gameCtx.world, otherEid, stores) === false) return null;
    otherSliced = sliceStores(stores, otherEid);
  }

  const normal = getContactNormal({ c, otherCollider, rapierWorld });
  return { otherCollider, normal, self: selfSliced, other: otherSliced };
}

function buildContactEndPayload<
  SF extends Record<string, ComponentFactory>,
  OF extends Record<string, ComponentFactory>,
>({
  otherCollider,
  selfEid,
  selfFilter,
  otherFilter,
  gameCtx,
}: {
  otherCollider: Collider;
  selfEid: number | undefined;
  selfFilter: SF | undefined;
  otherFilter: OF | undefined;
  gameCtx: GameContext | null;
}): CollisionContactEndEcs<SF, OF> | null {
  let selfSliced = {} as SlicedComponents<InstancesOf<SF>>;
  if (selfFilter !== undefined) {
    if (selfEid === undefined || gameCtx === null) return null;
    const stores = resolveStores(selfFilter, gameCtx.storeRegistry);
    if (stores === null || checkComponents(gameCtx.world, selfEid, stores) === false) return null;
    selfSliced = sliceStores(stores, selfEid);
  }

  let otherSliced = {} as SlicedComponents<InstancesOf<OF>>;
  if (otherFilter !== undefined) {
    if (gameCtx === null) return null;
    const otherEid = gameCtx.colliderRegistry.get(otherCollider.handle);
    if (otherEid === undefined) return null;
    const stores = resolveStores(otherFilter, gameCtx.storeRegistry);
    if (stores === null || checkComponents(gameCtx.world, otherEid, stores) === false) return null;
    otherSliced = sliceStores(stores, otherEid);
  }

  return { otherCollider, self: selfSliced, other: otherSliced };
}
