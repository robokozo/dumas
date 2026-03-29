import { watch, onUnmounted } from "vue";
import { useGame } from "../world/useGame";
import type { Ref } from "vue";
import type { RigidBodyColliderContext } from "@tresjs/rapier";

type Collider = RigidBodyColliderContext["collider"];

/**
 * Registers a Rapier collider in the game's collider registry so it can be
 * looked up by entity ID when useCollision()'s `other` ECS filter is active.
 *
 * Call this inside any entity component that owns a physics body and needs to
 * be detectable as the "other" side of a collision filter.
 */
export function useRegisterCollider({
  collider,
  eid,
}: {
  collider: Ref<Collider | null>;
  eid: number;
}): void {
  const { registerCollider, unregisterCollider } = useGame();

  watch(
    collider,
    (next, prev) => {
      if (prev !== null && prev !== undefined) {
        unregisterCollider({ handle: prev.handle });
      }
      if (next !== null) {
        registerCollider({ handle: next.handle, eid });
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (collider.value !== null) {
      unregisterCollider({ handle: collider.value.handle });
    }
  });
}
