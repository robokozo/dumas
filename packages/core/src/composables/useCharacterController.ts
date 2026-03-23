import { shallowRef } from "vue";
import { watchOnce, tryOnUnmounted } from "@vueuse/core";
import type RAPIER from "@dimforge/rapier3d-compat";

import { useDumasContext } from "./useDumasContext";
import { useRigidBody } from "./useRigidBody";
import { useCollider } from "./useCollider";
import type { CharacterControllerOptions, CharacterControllerReturn } from "../types";

const DEFAULT_OFFSET = 0.01;
const DEFAULT_MOVE_SPEED = 6;
const DEFAULT_JUMP_SPEED = 12;
const DEFAULT_SLOPE_ANGLE = Math.PI / 4;

// Stronger than real gravity (-9.81) for snappy game feel.
const DEFAULT_CHARACTER_GRAVITY = -25;

// Small downward bias when grounded to maintain ground contact.
const GROUND_STICK_VELOCITY = -1;

export function useCharacterController({
  eid,
  collider: colliderOptions,
  moveSpeed = DEFAULT_MOVE_SPEED,
  jumpSpeed = DEFAULT_JUMP_SPEED,
  gravity = DEFAULT_CHARACTER_GRAVITY,
  mode = "3d",
  kcc = {},
  onKccCollision,
}: CharacterControllerOptions): CharacterControllerReturn {
  const ctx = useDumasContext();

  const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });
  const { collider } = useCollider({ friction: 0, restitution: 0, ...colliderOptions, eid });

  const controller = shallowRef<RAPIER.KinematicCharacterController | null>(null);
  const isGrounded = shallowRef(false);

  let verticalVelocity = 0;
  // Tracks the last position passed to setNextKinematicTranslation so that teleport()
  // called post-physics-step isn't overwritten by the next move() reading body.translation(),
  // which still reflects the pre-teleport position until the next world.step().
  let targetPosition: { x: number; y: number; z: number } | null = null;

  const {
    offset = DEFAULT_OFFSET,
    maxSlopeClimbAngle = DEFAULT_SLOPE_ANGLE,
    minSlopeSlideAngle = DEFAULT_SLOPE_ANGLE,
    snapToGround = null,
    autostep = null,
    applyImpulsesToDynamicBodies = true,
  } = kcc;

  function initController(): void {
    const world = ctx.physicsWorld.value;
    const rapier = ctx.rapier.value;
    if (world === null || rapier === null) return;

    // ActiveCollisionTypes is WASM-bound and undefined before RAPIER.init() completes.
    // Set it here post-init so kinematic-fixed/kinematic-kinematic pairs generate events.
    collider.value?.setActiveCollisionTypes(rapier.ActiveCollisionTypes.ALL);

    const kccInstance = world.createCharacterController(offset);
    kccInstance.setUp({ x: 0, y: 1, z: 0 });
    kccInstance.setMaxSlopeClimbAngle(maxSlopeClimbAngle);
    kccInstance.setMinSlopeSlideAngle(minSlopeSlideAngle);
    kccInstance.setApplyImpulsesToDynamicBodies(applyImpulsesToDynamicBodies);

    if (snapToGround !== null) {
      kccInstance.enableSnapToGround(snapToGround);
    }

    if (autostep !== null) {
      kccInstance.enableAutostep(autostep.maxHeight, autostep.minWidth, autostep.includeDynamic);
    }

    controller.value = kccInstance;

    const body = rigidBody.value;
    if (body !== null) {
      body.lockRotations(true, true);
      if (mode === "2d") {
        body.setEnabledTranslations(true, true, false, true);
      }
    }
  }

  if (ctx.isReady.value === true) {
    initController();
  } else {
    watchOnce(ctx.isReady, () => {
      initController();
    });
  }

  tryOnUnmounted(() => {
    const world = ctx.physicsWorld.value;
    if (world !== null && controller.value !== null) {
      world.removeCharacterController(controller.value);
      controller.value = null;
    }
  });

  function move({ x, z, delta }: { x: number; z: number; delta: number }): void {
    const body = rigidBody.value;
    const col = collider.value;
    const kccInstance = controller.value;
    if (body === null || col === null || kccInstance === null) return;

    verticalVelocity += gravity * delta;

    const desiredMovement = {
      x: x * moveSpeed * delta,
      y: verticalVelocity * delta,
      z: mode === "2d" ? 0 : z * moveSpeed * delta,
    };

    kccInstance.computeColliderMovement(
      col,
      desiredMovement,
      undefined,
      undefined,
      (otherCollider) => otherCollider.isSensor() === false,
    );

    isGrounded.value = kccInstance.computedGrounded();

    if (isGrounded.value === true && verticalVelocity < 0) {
      verticalVelocity = GROUND_STICK_VELOCITY;
    }

    const actual = kccInstance.computedMovement();
    const pos = targetPosition ?? body.translation();
    const next = {
      x: pos.x + actual.x,
      y: pos.y + actual.y,
      z: mode === "2d" ? 0 : pos.z + actual.z,
    };
    body.setNextKinematicTranslation(next);
    targetPosition = next;

    if (onKccCollision !== undefined) {
      const collisionCount = kccInstance.numComputedCollisions();
      for (let i = 0; i < collisionCount; i++) {
        const collision = kccInstance.computedCollision(i);
        if (collision !== null) {
          const handle = collision.collider?.handle ?? null;
          onKccCollision({
            colliderHandle: handle ?? -1,
            eid: handle !== null ? (ctx.colliderEntityMap.get(handle) ?? null) : null,
          });
        }
      }
    }
  }

  function jump({ speed = jumpSpeed }: { speed?: number } = {}): void {
    if (isGrounded.value === true) {
      verticalVelocity = speed;
    }
  }

  function teleport({ position }: { position: { x: number; y: number; z: number } }): void {
    const body = rigidBody.value;
    if (body === null) return;
    const next = { x: position.x, y: position.y, z: mode === "2d" ? 0 : position.z };
    body.setNextKinematicTranslation(next);
    targetPosition = next;
    verticalVelocity = 0;
  }

  return { rigidBody, collider, controller, isGrounded, move, jump, teleport };
}
