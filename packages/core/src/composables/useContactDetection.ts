import type { ShallowRef } from "vue";
import type RAPIER from "@dimforge/rapier3d-compat";

import { useDumasContext } from "./useDumasContext";
import type { Vec3 } from "../types";

// Default minimum alignment between contact normal and query direction.
const DEFAULT_THRESHOLD = 0.5;

export interface ContactDetectionReturn {
  hasContact: (options: { direction: Vec3; threshold?: number }) => boolean;
}

export function useContactDetection({
  collider,
}: {
  collider: ShallowRef<RAPIER.Collider | null>;
}): ContactDetectionReturn {
  const ctx = useDumasContext();

  function hasContact({
    direction,
    threshold = DEFAULT_THRESHOLD,
  }: {
    direction: Vec3;
    threshold?: number;
  }): boolean {
    const world = ctx.physicsWorld.value;
    const col = collider.value;
    if (world === null || col === null) return false;

    let detected = false;
    world.contactPairsWith(col, (otherCollider) => {
      if (detected === true) return;
      world.contactPair(col, otherCollider, (manifold) => {
        const n = manifold.normal();
        const dot = n.x * direction.x + n.y * direction.y + n.z * direction.z;
        if (dot > threshold) {
          detected = true;
        }
      });
    });

    return detected;
  }

  return { hasContact };
}
