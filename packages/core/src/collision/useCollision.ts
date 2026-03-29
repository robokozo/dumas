import { useLoop } from "@tresjs/core";
import { useRapierContext } from "@tresjs/rapier";
import type { RigidBodyColliderContext } from "@tresjs/rapier";
import type { Ref } from "vue";

// Derived from @tresjs/rapier's exported context type to avoid a direct
// @dimforge/rapier3d-compat import in every consumer.
type Collider = RigidBodyColliderContext["collider"];

export interface CollisionContact {
  /** The other collider involved in the contact. */
  other: Collider;
}

/**
 * Detects when a physics body makes or breaks contact with another body.
 *
 * Must be called inside a component that is a descendant of <Physics>,
 * since it needs access to the Rapier world via useRapierContext().
 *
 * Polls world.contactPairsWith each frame — reliable regardless of
 * Rapier's internal event-handle ordering. Does not require
 * activeCollision on the bodies.
 */
export function useCollision({
  collider,
  onContact,
  onContactEnd,
}: {
  collider: Ref<Collider | null>;
  onContact?: (contact: CollisionContact) => void;
  onContactEnd?: (contact: CollisionContact) => void;
}): void {
  const { world } = useRapierContext();
  const { onBeforeRender } = useLoop();

  const activeContacts = new Set<Collider>();

  onBeforeRender(() => {
    const c = collider.value;
    if (c === null) return;

    const current = new Set<Collider>();
    world.value.contactPairsWith(c, (other: Collider) => {
      current.add(other);
    });

    for (const other of current) {
      if (activeContacts.has(other) === false) {
        onContact?.({ other });
      }
    }

    for (const other of activeContacts) {
      if (current.has(other) === false) {
        onContactEnd?.({ other });
      }
    }

    activeContacts.clear();
    for (const other of current) {
      activeContacts.add(other);
    }
  });
}
