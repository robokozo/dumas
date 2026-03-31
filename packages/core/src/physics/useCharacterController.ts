import { onUnmounted, watch } from "vue";
import type { KinematicCharacterController, Collider } from "@dimforge/rapier3d-compat";
import { useGame } from "../world/useGame";
import { PHYSICS_TYPE } from "./createPhysics";
import type { PhysicsStore } from "./createPhysics";

// ─── public types ────────────────────────────────────────────────────────────

export interface CharacterControllerOptions {
  /** Skin width — prevents tunnelling. */
  offset?: number;
  /** Maximum slope angle in degrees — steeper slopes block movement. */
  maxSlopeAngle?: number;
  /** Auto-climb steps up to this height. Set to null to disable. */
  stepHeight?: number | null;
  /** Minimum width of free space after stepping on a stair. */
  stepMinWidth?: number;
  /** Whether the character can step over dynamic bodies. */
  stepIncludesDynamic?: boolean;
  /** Snap down to ground within this distance. Set to null to disable. */
  snapToGround?: number | null;
  /** Whether to apply impulses to dynamic bodies the character hits. */
  applyImpulses?: boolean;
  /** Custom character mass for impulse resolution. */
  characterMass?: number | null;
}

export interface CharacterControllerResult {
  /**
   * Compute the character's movement against obstacles.
   * After calling this, read `isGrounded` and apply the returned translation
   * to the body via `setNextKinematicTranslation`.
   */
  move: (params: {
    eid: number;
    velocity: { x: number; y: number; z: number };
    delta: number;
    colliderName?: string;
  }) => { x: number; y: number; z: number };
  /** Whether the character is on the ground after the last `move` call. */
  isGrounded: boolean;
}

// ─── composable ──────────────────────────────────────────────────────────────

/**
 * Wraps Rapier's KinematicCharacterController for easy kinematic character movement.
 * Handles step climbing, slope limits, snap-to-ground, and slide-along-walls.
 *
 * Must be called inside a component where `usePhysics()` has been initialized.
 *
 * @example
 * const controller = useCharacterController({
 *   offset: 0.01,
 *   maxSlopeAngle: 45,
 *   stepHeight: 0.3,
 *   snapToGround: 0.2,
 * });
 *
 * useSystem({
 *   fn: ({ delta }) => {
 *     const movement = controller.move({
 *       eid: playerEid,
 *       velocity: { x: wishDir.x * SPEED, y: velocity.y, z: wishDir.z * SPEED },
 *       delta,
 *     });
 *
 *     // Apply movement to the kinematic body
 *     const body = physicsStore.body[playerEid];
 *     const pos = body.translation();
 *     body.setNextKinematicTranslation({
 *       x: pos.x + movement.x,
 *       y: pos.y + movement.y,
 *       z: pos.z + movement.z,
 *     });
 *
 *     if (controller.isGrounded && pressed.jump) {
 *       velocity.y = JUMP_FORCE;
 *     }
 *   },
 * });
 */
export function useCharacterController(
  options: CharacterControllerOptions = {},
): CharacterControllerResult {
  const {
    offset = 0.01,
    maxSlopeAngle = 45,
    stepHeight = null,
    stepMinWidth = 0.2,
    stepIncludesDynamic = true,
    snapToGround = null,
    applyImpulses = true,
    characterMass = null,
  } = options;

  const gameCtx = useGame();
  let controller: KinematicCharacterController | null = null;

  const result: CharacterControllerResult = {
    isGrounded: false,
    move({ eid, velocity, delta, colliderName }) {
      if (controller === null) return { x: 0, y: 0, z: 0 };

      const physStore = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
      if (physStore === undefined) return { x: 0, y: 0, z: 0 };

      // Find the collider to use for movement computation
      const colliderMap = physStore.colliders[eid];
      if (colliderMap === undefined) return { x: 0, y: 0, z: 0 };

      let collider: Collider | undefined;
      if (colliderName !== undefined) {
        collider = colliderMap[colliderName];
      } else {
        // Use the first collider
        const entries = Object.values(colliderMap);
        collider = entries[0];
      }

      if (collider === undefined) return { x: 0, y: 0, z: 0 };

      const desiredDelta = {
        x: velocity.x * delta,
        y: velocity.y * delta,
        z: velocity.z * delta,
      };

      controller.computeColliderMovement(collider, desiredDelta);
      result.isGrounded = controller.computedGrounded();

      const movement = controller.computedMovement();
      return { x: movement.x, y: movement.y, z: movement.z };
    },
  };

  // Create the controller when the physics world becomes available
  const stopWatch = watch(
    () => gameCtx.physicsWorld.value,
    (rapierWorld) => {
      if (rapierWorld === null) return;

      controller = rapierWorld.createCharacterController(offset);

      // Convert degrees to radians for slope angles
      const maxSlopeRad = (maxSlopeAngle * Math.PI) / 180;
      controller.setMaxSlopeClimbAngle(maxSlopeRad);
      controller.setMinSlopeSlideAngle(maxSlopeRad);

      if (stepHeight !== null) {
        controller.enableAutostep(stepHeight, stepMinWidth, stepIncludesDynamic);
      }

      if (snapToGround !== null) {
        controller.enableSnapToGround(snapToGround);
      }

      controller.setApplyImpulsesToDynamicBodies(applyImpulses);

      if (characterMass !== null) {
        controller.setCharacterMass(characterMass);
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stopWatch();
    if (controller !== null) {
      controller.free();
      controller = null;
    }
  });

  return result;
}
