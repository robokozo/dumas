import { inject, onMounted as vueOnMounted, watch } from "vue";
import { ColliderDesc, RigidBodyDesc } from "@dimforge/rapier3d-compat";
import { encodeCollisionGroups } from "./collisionGroups";
import type { Collider, RigidBody, World } from "@dimforge/rapier3d-compat";
import { GAME_KEY } from "../keys";
import { TRANSFORM_TYPE } from "../ecs/components";
import type { TransformStore } from "../ecs/components";
import type { ComponentFactory, ComponentStore, Vec3 } from "../types";
import type { ColliderConfig } from "./colliderConfig";
import type { PhysicsContact, PhysicsContactEnd } from "./types";

// ─── public types ─────────────────────────────────────────────────────────────

export interface PhysicsStore extends ComponentStore {
  /** Rapier RigidBody per entity ID. */
  body: Array<RigidBody | undefined>;
  /** Named Rapier Colliders per entity ID. */
  colliders: Array<Record<string, Collider> | undefined>;
}

export interface PhysicsOptions {
  type?: "dynamic" | "fixed" | "kinematicPositionBased" | "kinematicVelocityBased";
  /**
   * Named colliders for this body. Each key is accessible via the `which`
   * field in collision callbacks to identify which part was hit.
   * Each collider can carry its own onCollision / onCollisionEnd callback.
   */
  colliders?: Record<string, ColliderConfig>;
  gravityScale?: number;
  linearDamping?: number;
  angularDamping?: number;
  lockTranslations?: boolean;
  lockRotations?: boolean;
  enabledTranslations?: [boolean, boolean, boolean];
  enabledRotations?: [boolean, boolean, boolean];
  linvel?: Vec3;
  angvel?: Vec3;
  enableCcd?: boolean;
  /** Fires when any collider on this entity starts contacting another body. */
  onCollision?: (contact: PhysicsContact) => void;
  /** Fires when any collider on this entity stops contacting another body. */
  onCollisionEnd?: (contact: PhysicsContactEnd) => void;
}

/**
 * Stable symbol — all createPhysics() calls share one PhysicsStore per <Game>.
 * Exported for internal use by useCollision, useSensor, and useRaycast.
 * Not part of the public API surface (not re-exported from index.ts).
 */
export const PHYSICS_TYPE: symbol = Symbol("dumas.physics");

// ─── factory ──────────────────────────────────────────────────────────────────

/**
 * Creates a physics ComponentFactory for use inside useEcsComponent.
 *
 * Can be called **inline in component setup** — no module-scope hoisting required.
 * The factory uses a stable __type symbol so all entities share one PhysicsStore
 * per <Game>.
 *
 * The Rapier world is created asynchronously by usePhysics(). If the world is not
 * ready when the entity mounts, the body is created lazily once it becomes available.
 * The entity's initial transform values are read just before the first physics step.
 *
 * @example
 * const health = ref(100)
 * const { eid, transform } = useEcsComponent({
 *   components: {
 *     physics: createPhysics({
 *       type: "dynamic",
 *       colliders: {
 *         head: createSphereCollider({ radius: 0.2, onCollision: () => { health.value -= 50 } }),
 *         body: createCuboidCollider({ halfExtents: [0.3, 0.5, 0.3] }),
 *       },
 *     }),
 *   },
 * })
 * transform.posY.value = 5   // applied before first physics step
 */
export function createPhysics(options: PhysicsOptions): ComponentFactory<PhysicsStore> {
  // Per-entity cleanup closures and active-contact tracking live in the
  // factory closure so each createPhysics() call is fully isolated.
  const cleanupByEid = new Map<number, () => void>();
  const activeContactsByEid = new Map<number, Map<string, Set<number>>>();

  const factory: ComponentFactory<PhysicsStore> = Object.assign(
    (): PhysicsStore => ({ body: [], colliders: [] }),
    {
      __type: PHYSICS_TYPE,

      onMounted({ eid, store }: { eid: number; store: PhysicsStore }): void {
        const gameCtxRaw = inject(GAME_KEY);
        if (gameCtxRaw === undefined) {
          throw new Error("[dumas] createPhysics requires a <Game> ancestor component.");
        }
        // Capture as a non-nullable const so closures inside initBody don't need re-checking.
        const gameCtx = gameCtxRaw;

        const transformStore = gameCtx.storeRegistry.get(TRANSFORM_TYPE) as
          | TransformStore
          | undefined;

        // Track whether the host component has mounted yet.
        // Needed to decide whether to apply the initial transform immediately
        // (slow path: WASM loaded after mount) or defer to vueOnMounted
        // (fast path: world was already ready during setup).
        let hasMounted = false;
        let bodyInitialized = false;

        vueOnMounted(() => {
          hasMounted = true;
          // Fast path: body already created during setup, apply transform now.
          const b = store.body[eid];
          if (b !== undefined) {
            applyInitialTransform(b, transformStore, eid);
          }
          // Slow path: body not yet created (WASM loading), hasMounted flag
          // lets initBody apply the transform when the world becomes available.
        });

        // Watch for the physics world — fires immediately if usePhysics() was
        // already called, otherwise waits for WASM to finish loading.
        // Vue auto-stops this watcher when the host component unmounts.
        watch(
          () => gameCtx.physicsWorld.value,
          (rapierWorld) => {
            if (rapierWorld === null || bodyInitialized === true) return;
            bodyInitialized = true;
            initBody(rapierWorld);
          },
          { immediate: true },
        );

        function initBody(rapierWorld: World): void {
          const activeContacts = new Map<string, Set<number>>();
          activeContactsByEid.set(eid, activeContacts);

          // ── Build body ────────────────────────────────────────────────────────
          const desc = buildRigidBodyDesc(options.type);
          const body = rapierWorld.createRigidBody(desc);

          if (options.gravityScale !== undefined) body.setGravityScale(options.gravityScale, true);
          if (options.linearDamping !== undefined) body.setLinearDamping(options.linearDamping);
          if (options.angularDamping !== undefined) body.setAngularDamping(options.angularDamping);
          if (options.lockTranslations === true) body.lockTranslations(true, true);
          if (options.lockRotations === true) body.lockRotations(true, true);
          if (options.enableCcd === true) body.enableCcd(true);
          if (options.enabledTranslations !== undefined) {
            const [x, y, z] = options.enabledTranslations;
            body.setEnabledTranslations(x, y, z, true);
          }
          if (options.enabledRotations !== undefined) {
            const [x, y, z] = options.enabledRotations;
            body.setEnabledRotations(x, y, z, true);
          }
          if (options.linvel !== undefined) body.setLinvel(options.linvel, true);
          if (options.angvel !== undefined) body.setAngvel(options.angvel, true);

          store.body[eid] = body;

          // ── Build colliders ───────────────────────────────────────────────────
          const colliderMap: Record<string, Collider> = {};
          for (const [name, config] of Object.entries(options.colliders ?? {})) {
            const colliderDesc = applyColliderProps(buildColliderDesc(config), config);
            const collider = rapierWorld.createCollider(colliderDesc, body);
            colliderMap[name] = collider;
            gameCtx.registerCollider({ handle: collider.handle, eid });
          }
          store.colliders[eid] = colliderMap;

          // ── Apply initial transform ───────────────────────────────────────────
          // Slow path: component already mounted, user values are finalized — apply now.
          // Fast path: vueOnMounted hasn't fired yet — it will apply the transform.
          if (hasMounted === true) {
            applyInitialTransform(body, transformStore, eid);
          }

          // ── Physics sync + collision system (priority 0) ──────────────────────
          const syncOff = gameCtx.registerSystem({
            priority: 0,
            fn: () => {
              if (gameCtx.physicsWorld.value === null) return;
              const rw = gameCtx.physicsWorld.value;

              const b = store.body[eid];
              if (b === undefined) return;

              // Write body → transform shallowRefs
              if (transformStore !== undefined) {
                const posRef = transformStore.posX[eid];
                if (posRef !== undefined) {
                  const t = b.translation();
                  const r = b.rotation();
                  transformStore.posX[eid].value = t.x;
                  transformStore.posY[eid].value = t.y;
                  transformStore.posZ[eid].value = t.z;
                  transformStore.rotX[eid].value = r.x;
                  transformStore.rotY[eid].value = r.y;
                  transformStore.rotZ[eid].value = r.z;
                  transformStore.rotW[eid].value = r.w;
                }
              }

              // Collision detection — poll contactPairsWith for each collider
              const cMap = store.colliders[eid];
              if (cMap === undefined) return;

              for (const [name, selfCollider] of Object.entries(cMap)) {
                let active = activeContacts.get(name);
                if (active === undefined) {
                  active = new Set<number>();
                  activeContacts.set(name, active);
                }

                const current = new Set<number>();

                rw.contactPairsWith(selfCollider, (otherCollider: Collider) => {
                  current.add(otherCollider.handle);

                  if (active?.has(otherCollider.handle) === false) {
                    const normal = getContactNormal(rw, selfCollider, otherCollider);
                    const otherEid = gameCtx.colliderRegistry.get(otherCollider.handle) ?? null;
                    const contact: PhysicsContact = {
                      otherCollider,
                      normal,
                      which: name,
                      otherEid,
                    };

                    options.colliders?.[name]?.onCollision?.(contact);
                    options.onCollision?.(contact);
                  }
                });

                for (const handle of active) {
                  if (current.has(handle) === false) {
                    const otherCollider = rw.getCollider(handle);
                    if (otherCollider === null) continue;
                    const otherEid = gameCtx.colliderRegistry.get(handle) ?? null;
                    const contact: PhysicsContactEnd = {
                      otherCollider,
                      which: name,
                      otherEid,
                    };

                    options.colliders?.[name]?.onCollisionEnd?.(contact);
                    options.onCollisionEnd?.(contact);
                  }
                }

                active.clear();
                for (const h of current) {
                  active.add(h);
                }
              }
            },
          });

          cleanupByEid.set(eid, () => {
            syncOff();
            activeContactsByEid.delete(eid);

            if (gameCtx.physicsWorld.value === null) return;
            const rw = gameCtx.physicsWorld.value;

            const cMap = store.colliders[eid];
            if (cMap !== undefined) {
              for (const collider of Object.values(cMap)) {
                gameCtx.unregisterCollider({ handle: collider.handle });
                rw.removeCollider(collider, false);
              }
            }

            const b = store.body[eid];
            if (b !== undefined) rw.removeRigidBody(b);

            store.body[eid] = undefined;
            store.colliders[eid] = undefined;
          });
        }
      },

      onUnmounted({ eid }: { eid: number }): void {
        cleanupByEid.get(eid)?.();
        cleanupByEid.delete(eid);
      },
    },
  );

  return factory;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function applyInitialTransform(
  body: RigidBody,
  transformStore: TransformStore | undefined,
  eid: number,
): void {
  if (transformStore === undefined) return;
  const px = transformStore.posX[eid]?.value ?? 0;
  const py = transformStore.posY[eid]?.value ?? 0;
  const pz = transformStore.posZ[eid]?.value ?? 0;
  body.setTranslation({ x: px, y: py, z: pz }, true);
}

function buildRigidBodyDesc(type: PhysicsOptions["type"]): RigidBodyDesc {
  switch (type) {
    case "fixed":
      return RigidBodyDesc.fixed();
    case "kinematicPositionBased":
      return RigidBodyDesc.kinematicPositionBased();
    case "kinematicVelocityBased":
      return RigidBodyDesc.kinematicVelocityBased();
    default:
      return RigidBodyDesc.dynamic();
  }
}

function buildColliderDesc(config: ColliderConfig): ColliderDesc {
  switch (config.shape) {
    case "ball":
      return ColliderDesc.ball(config.radius);
    case "capsule":
      return ColliderDesc.capsule(config.halfHeight, config.radius);
    case "cone":
      return ColliderDesc.cone(config.halfHeight, config.radius);
    case "cylinder":
      return ColliderDesc.cylinder(config.halfHeight, config.radius);
    default:
      return ColliderDesc.cuboid(...config.halfExtents);
  }
}

function applyColliderProps(desc: ColliderDesc, config: ColliderConfig): ColliderDesc {
  if (config.friction !== undefined) desc.setFriction(config.friction);
  if (config.restitution !== undefined) desc.setRestitution(config.restitution);
  if (config.mass !== undefined) desc.setMass(config.mass);
  if (config.density !== undefined) desc.setDensity(config.density);
  if (config.sensor === true) desc.setSensor(true);
  if (config.membership !== undefined || config.filter !== undefined) {
    // Default: member of all groups (0xffff), collides with all groups (0xffff).
    const membership = config.membership ?? 0xffff;
    const filter = config.filter ?? 0xffff;
    desc.setCollisionGroups(encodeCollisionGroups({ membership, filter }));
  }
  return desc;
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
