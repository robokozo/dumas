import { tryOnUnmounted, watchOnce } from "@vueuse/core";
import type RAPIER from "@dimforge/rapier3d-compat";

import { useDumasContext } from "./useDumasContext";
import { useRigidBody } from "./useRigidBody";
import { useCollider } from "./useCollider";
import type { CharacterControllerOptions, CharacterControllerReturn } from "../types";

export function useCharacterController({
  eid,
  collider: colliderOptions,
  moveSpeed = 6,
  mode = "3d",
  offset = 0.02,
  slideEnabled = true,
  applyImpulsesToDynamicBodies = true,
}: CharacterControllerOptions): CharacterControllerReturn {
  const ctx = useDumasContext();

  // Kinematic body: we move it explicitly via setNextKinematicTranslation,
  // so Rapier never fights our input with its own velocity solver.
  const { rigidBody } = useRigidBody({ eid, type: "kinematicPosition" });
  const { collider } = useCollider({ friction: 0, ...colliderOptions, eid });

  let rapierController: RAPIER.KinematicCharacterController | null = null;
  let verticalVel = 0;
  let isOnGround = false;

  function initController(): void {
    const world = ctx.physicsWorld.value;
    if (world === null) return;

    const controller = world.createCharacterController(offset);
    controller.setUp({ x: 0, y: 1, z: 0 });
    controller.setSlideEnabled(slideEnabled);
    controller.setApplyImpulsesToDynamicBodies(applyImpulsesToDynamicBodies);
    rapierController = controller;

    // Allow kinematic-fixed contacts (sensors are attached to fixed bodies).
    // Rapier's default activeCollisionTypes excludes kinematic-fixed pairs,
    // so coins and lava sensors would not fire events without this.
    const rapier = ctx.rapier.value;
    const col = collider.value;
    if (rapier !== null && col !== null) {
      col.setActiveCollisionTypes(rapier.ActiveCollisionTypes.ALL);
    }
  }

  if (ctx.isReady.value === true) {
    initController();
  } else {
    watchOnce(ctx.isReady, () => {
      initController();
    });
  }

  function isGrounded(): boolean {
    return isOnGround;
  }

  function move({ x, z, delta }: { x: number; z: number; delta: number }): void {
    const body = rigidBody.value;
    const col = collider.value;
    const world = ctx.physicsWorld.value;
    const controller = rapierController;
    if (body === null || col === null || world === null || controller === null) return;

    verticalVel += world.gravity.y * delta;

    const desiredMovement = {
      x: x * moveSpeed * delta,
      y: verticalVel * delta,
      z: mode === "2d" ? 0 : z * moveSpeed * delta,
    };

    controller.computeColliderMovement(col, desiredMovement);
    const corrected = controller.computedMovement();
    isOnGround = controller.computedGrounded();

    // Stop accumulating gravity while standing on the ground
    if (isOnGround === true) {
      verticalVel = 0;
    }

    const pos = body.translation();
    body.setNextKinematicTranslation({
      x: pos.x + corrected.x,
      y: pos.y + corrected.y,
      // Always lock Z in 2D mode — the KCC may compute small Z corrections on wall contacts
      z: mode === "2d" ? pos.z : pos.z + corrected.z,
    });
  }

  function jump({ speed }: { speed: number }): void {
    if (isOnGround === false) return;
    verticalVel = speed;
  }

  function teleport({ position }: { position: { x: number; y: number; z: number } }): void {
    const body = rigidBody.value;
    if (body === null) return;
    body.setTranslation(position, true);
    verticalVel = 0;
  }

  tryOnUnmounted(() => {
    const world = ctx.physicsWorld.value;
    if (rapierController !== null && world !== null) {
      world.removeCharacterController(rapierController);
    }
  });

  return { rigidBody, isGrounded, move, jump, teleport };
}
