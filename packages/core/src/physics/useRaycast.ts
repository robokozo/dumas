import { hasComponent } from "bitecs";
import type { Collider } from "@dimforge/rapier3d-compat";
import { Ray } from "@dimforge/rapier3d-compat";
import { useGame } from "../world/useGame";
import { TRANSFORM_TYPE } from "../ecs/components";
import type { TransformStore } from "../ecs/components";
import type { ComponentFactory, ComponentStore, Vec3 } from "../types";
import type { SlicedComponents, InstancesOf } from "../entity/types";

// ─── public types ─────────────────────────────────────────────────────────────

export interface RaycastHit<
  S extends Record<string, ComponentFactory>,
  T extends Record<string, ComponentFactory>,
> {
  /** Pre-sliced reactive store fields for the casting entity. */
  source: SlicedComponents<InstancesOf<S>>;
  /** Pre-sliced reactive store fields for the hit entity. */
  target: SlicedComponents<InstancesOf<T>>;
  /** World-space hit point. */
  point: Vec3;
  /** World-space surface normal at the hit point. */
  normal: Vec3;
  /** Distance from ray origin to hit point. */
  distance: number;
  /** The Rapier Collider that was hit. */
  collider: Collider;
  /** bitECS entity ID of the hit entity. */
  targetEid: number;
}

export interface UseRaycastReturn<
  S extends Record<string, ComponentFactory>,
  T extends Record<string, ComponentFactory>,
> {
  /**
   * Cast the ray and return the nearest matching hit, or null if nothing
   * in range carries all the required `target` components.
   */
  cast: (params: {
    origin?: Vec3;
    direction: Vec3;
    maxDistance?: number;
  }) => RaycastHit<S, T> | null;
  /**
   * Cast the ray and return every matching hit along the ray, ordered by
   * distance ascending.
   */
  castAll: (params: {
    origin?: Vec3;
    direction: Vec3;
    maxDistance?: number;
  }) => Array<RaycastHit<S, T>>;
}

// ─── composable ───────────────────────────────────────────────────────────────

const DEFAULT_MAX_DISTANCE = 1000;

/**
 * Casts a ray against the physics world with optional ECS component filters
 * on both the casting entity and potential targets.
 *
 * `origin` defaults to the casting entity's current transform position each
 * call if not provided. `target` filters ensure only entities carrying all
 * the declared components are returned — no manual null checks needed.
 *
 * Throws at setup time if `eid` doesn't carry every declared `source`
 * component — a programming error, not a runtime condition.
 *
 * @example
 * const { cast } = useRaycast({
 *   eid: tankEid,
 *   source: { weapon: createWeapon },
 *   target: { health: createHealth },
 * })
 *
 * function fire() {
 *   const hit = cast({ direction: aimDir, maxDistance: 500 })
 *   if (hit === null) return
 *   hit.target.health.current.value -= hit.source.weapon.damage.value
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRaycast<
  S extends Record<string, ComponentFactory<any>>,
  T extends Record<string, ComponentFactory<any>>,
>({
  eid,
  source: sourceFactories = {} as S,
  target: targetFactories = {} as T,
}: {
  eid: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source?: S;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target?: T;
}): UseRaycastReturn<S, T> {
  const gameCtx = useGame();

  // Validate source components at setup time.
  for (const factory of Object.values(sourceFactories)) {
    const storeKey = (factory as ComponentFactory).__type ?? factory;
    const store = gameCtx.storeRegistry.get(storeKey);
    if (store === undefined || hasComponent(gameCtx.world, eid, store) === false) {
      throw new Error(
        `[dumas] useRaycast: entity ${eid} does not have a required source component.`,
      );
    }
  }

  function resolveOrigin(origin: Vec3 | undefined): Vec3 {
    if (origin !== undefined) return origin;
    const transformStore = gameCtx.storeRegistry.get(TRANSFORM_TYPE) as TransformStore | undefined;
    if (transformStore === undefined) return { x: 0, y: 0, z: 0 };
    return {
      x: transformStore.posX[eid]?.value ?? 0,
      y: transformStore.posY[eid]?.value ?? 0,
      z: transformStore.posZ[eid]?.value ?? 0,
    };
  }

  function buildHit(
    collider: Collider,
    targetEid: number,
    origin: Vec3,
    direction: Vec3,
    distance: number,
  ): RaycastHit<S, T> {
    const point: Vec3 = {
      x: origin.x + direction.x * distance,
      y: origin.y + direction.y * distance,
      z: origin.z + direction.z * distance,
    };

    let normal: Vec3 = { x: 0, y: 1, z: 0 };
    const rw = gameCtx.physicsWorld.value;
    if (rw !== null) {
      const ray = new Ray(origin, direction);
      const hit = rw.castRayAndGetNormal(ray, distance + 0.001, false);
      if (hit !== null && hit.collider.handle === collider.handle) {
        normal = hit.normal;
      }
    }

    return {
      source: sliceFactories(sourceFactories, eid, gameCtx.storeRegistry),
      target: sliceFactories(targetFactories, targetEid, gameCtx.storeRegistry),
      point,
      normal,
      distance,
      collider,
      targetEid,
    };
  }

  function cast({
    origin,
    direction,
    maxDistance = DEFAULT_MAX_DISTANCE,
  }: {
    origin?: Vec3;
    direction: Vec3;
    maxDistance?: number;
  }): RaycastHit<S, T> | null {
    const rw = gameCtx.physicsWorld.value;
    if (rw === null) return null;

    const resolvedOrigin = resolveOrigin(origin);
    const ray = new Ray(resolvedOrigin, direction);

    // Walk through hits from nearest to farthest until we find one that
    // passes the target ECS filter.
    let bestHit: RaycastHit<S, T> | null = null;
    let bestDistance = maxDistance;

    rw.intersectionsWithRay(ray, maxDistance, false, (hit) => {
      if (hit.timeOfImpact >= bestDistance) return true;

      const otherEid = gameCtx.colliderRegistry.get(hit.collider.handle);
      if (otherEid === undefined) return true;
      if (passesFilter(gameCtx.world, otherEid, targetFactories, gameCtx.storeRegistry) === false)
        return true;

      bestDistance = hit.timeOfImpact;
      bestHit = buildHit(hit.collider, otherEid, resolvedOrigin, direction, hit.timeOfImpact);
      return true;
    });

    return bestHit;
  }

  function castAll({
    origin,
    direction,
    maxDistance = DEFAULT_MAX_DISTANCE,
  }: {
    origin?: Vec3;
    direction: Vec3;
    maxDistance?: number;
  }): Array<RaycastHit<S, T>> {
    const rw = gameCtx.physicsWorld.value;
    if (rw === null) return [];

    const resolvedOrigin = resolveOrigin(origin);
    const ray = new Ray(resolvedOrigin, direction);
    const hits: Array<RaycastHit<S, T>> = [];

    rw.intersectionsWithRay(ray, maxDistance, false, (hit) => {
      const otherEid = gameCtx.colliderRegistry.get(hit.collider.handle);
      if (otherEid === undefined) return true;
      if (passesFilter(gameCtx.world, otherEid, targetFactories, gameCtx.storeRegistry) === false)
        return true;

      hits.push(buildHit(hit.collider, otherEid, resolvedOrigin, direction, hit.timeOfImpact));
      return true;
    });

    hits.sort((a, b) => a.distance - b.distance);
    return hits;
  }

  return { cast, castAll };
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
