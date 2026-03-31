import { inject } from "vue";
import { query } from "bitecs";
import type { QueryResult } from "bitecs";
import { GAME_KEY } from "../keys";
import { TRANSFORM_TYPE } from "../ecs/components";
import type { TransformStore } from "../ecs/components";
import type { ComponentFactory, ComponentStore } from "../types";

// ─── public types ────────────────────────────────────────────────────────────

export interface TriggerZoneStore extends ComponentStore {
  /** Trigger radius per entity ID. */
  radius: Array<number | undefined>;
}

export interface TriggerZoneEvent {
  /** The entity ID that entered/exited the zone. */
  targetEid: number;
  /** The entity ID that owns the trigger zone. */
  zoneEid: number;
}

export interface TriggerZoneOptions {
  /** Detection radius around the entity's position. */
  radius: number;
  /**
   * Tags or ComponentFactories that a target entity must carry to trigger
   * enter/exit callbacks. An empty array matches all entities.
   */
  target: Array<ComponentFactory>;
  /** Fires when a matching target enters the radius. */
  onEnter?: (params: TriggerZoneEvent) => void;
  /** Fires when a matching target exits the radius. */
  onExit?: (params: TriggerZoneEvent) => void;
}

/** Stable symbol — all trigger zones share one TriggerZoneStore per <Game>. */
export const TRIGGER_ZONE_TYPE: symbol = Symbol("dumas.triggerZone");

// ─── factory ─────────────────────────────────────────────────────────────────

/**
 * Creates a proximity-based trigger zone ComponentFactory.
 * No physics world required — distance checks run against TransformStore positions.
 *
 * @example
 * useEcsComponent({
 *   components: {
 *     trigger: createTriggerZone({
 *       radius: 1.8,
 *       target: [PlayerTag],
 *       onEnter({ targetEid }) { showPrompt(); },
 *       onExit({ targetEid }) { hidePrompt(); },
 *     }),
 *   },
 * });
 */
export function createTriggerZone(options: TriggerZoneOptions): ComponentFactory<TriggerZoneStore> {
  const cleanupByEid = new Map<number, () => void>();
  const activeByEid = new Map<number, Set<number>>();

  const factory: ComponentFactory<TriggerZoneStore> = Object.assign(
    (): TriggerZoneStore => ({ radius: [] }),
    {
      __type: TRIGGER_ZONE_TYPE,

      onMounted({ eid, store }: { eid: number; store: TriggerZoneStore }): void {
        const gameCtx = inject(GAME_KEY);
        if (gameCtx === undefined) {
          throw new Error("[dumas] createTriggerZone requires a <Game> ancestor component.");
        }

        store.radius[eid] = options.radius;

        const active = new Set<number>();
        activeByEid.set(eid, active);

        // Build the target query terms — resolve each factory to its store
        const targetStores: Array<ComponentStore> = [];
        for (const tag of options.target) {
          const storeKey = tag.__type ?? tag;
          const s = gameCtx.storeRegistry.get(storeKey);
          if (s !== undefined) {
            targetStores.push(s);
          }
        }

        const transformStore = gameCtx.storeRegistry.get(TRANSFORM_TYPE) as
          | TransformStore
          | undefined;

        const off = gameCtx.registerSystem({
          priority: 2,
          fn: () => {
            if (transformStore === undefined) return;

            const zoneX = transformStore.posX[eid]?.value ?? 0;
            const zoneY = transformStore.posY[eid]?.value ?? 0;
            const zoneZ = transformStore.posZ[eid]?.value ?? 0;
            const r = store.radius[eid] ?? options.radius;
            const rSq = r * r;

            // Query all entities matching the target archetype
            let candidates: QueryResult;
            if (targetStores.length > 0) {
              candidates = query(gameCtx.world, targetStores);
            } else {
              // No target filter — check all entities with transforms
              const tStore = gameCtx.storeRegistry.get(TRANSFORM_TYPE);
              candidates = tStore !== undefined ? query(gameCtx.world, [tStore]) : [];
            }

            const current = new Set<number>();

            for (const targetEid of candidates) {
              if (targetEid === eid) continue;

              const tx = transformStore.posX[targetEid]?.value ?? 0;
              const ty = transformStore.posY[targetEid]?.value ?? 0;
              const tz = transformStore.posZ[targetEid]?.value ?? 0;

              const dx = tx - zoneX;
              const dy = ty - zoneY;
              const dz = tz - zoneZ;
              const distSq = dx * dx + dy * dy + dz * dz;

              if (distSq <= rSq) {
                current.add(targetEid);

                if (active.has(targetEid) === false) {
                  options.onEnter?.({ targetEid, zoneEid: eid });
                }
              }
            }

            // Check for exits
            for (const prevEid of active) {
              if (current.has(prevEid) === false) {
                options.onExit?.({ targetEid: prevEid, zoneEid: eid });
              }
            }

            active.clear();
            for (const h of current) {
              active.add(h);
            }
          },
        });

        cleanupByEid.set(eid, () => {
          off();
          activeByEid.delete(eid);
          store.radius[eid] = undefined;
        });
      },

      onUnmounted({ eid }: { eid: number }): void {
        cleanupByEid.get(eid)?.();
        cleanupByEid.delete(eid);
      },
    },
  );

  return factory;
}
