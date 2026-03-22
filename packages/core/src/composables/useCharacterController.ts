import { watchOnce } from "@vueuse/core";

import { useDumasContext } from "./useDumasContext";
import { useRigidBody } from "./useRigidBody";
import { useCollider } from "./useCollider";
import type { CharacterControllerOptions, CharacterControllerReturn } from "../types";

export function useCharacterController({
  eid,
  collider: colliderOptions,
  moveSpeed = 6,
  mode = "3d",
}: CharacterControllerOptions): CharacterControllerReturn {
  const ctx = useDumasContext();

  const { rigidBody } = useRigidBody({ eid, type: "dynamic" });
  const { collider } = useCollider({ friction: 0, restitution: 0, ...colliderOptions, eid });

  function initBody(): void {
    const body = rigidBody.value;
    if (body === null) return;

    // Prevent the capsule from tipping over under contact forces.
    body.lockRotations(true, true);

    // In 2D mode lock Z so the character stays in the XY plane.
    if (mode === "2d") {
      body.setEnabledTranslations(true, true, false, true);
    }
  }

  if (ctx.isReady.value === true) {
    initBody();
  } else {
    watchOnce(ctx.isReady, () => {
      initBody();
    });
  }

  function move({ x, z }: { x: number; z: number; delta: number }): void {
    const body = rigidBody.value;
    if (body === null) return;

    const vel = body.linvel();
    body.setLinvel({ x: x * moveSpeed, y: vel.y, z: mode === "2d" ? 0 : z * moveSpeed }, true);
  }

  function teleport({ position }: { position: { x: number; y: number; z: number } }): void {
    const body = rigidBody.value;
    if (body === null) return;
    body.setTranslation(position, true);
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  }

  return { rigidBody, collider, move, teleport };
}
