import { onUnmounted } from "vue";
import { observe, onAdd, onRemove } from "bitecs";
import { useGame } from "../world/useGame";
import type { ComponentStore } from "../types";

/**
 * Fires a callback once each time an entity gains all of the declared
 * components (i.e. enters the archetype). Cleaned up on component unmount.
 *
 * Useful for one-shot reactions like registering a spawned enemy in a
 * spatial grid, starting a spawn animation, or seeding AI state.
 *
 * @example
 * useObserver({
 *   components: [HealthStore, EnemyStore],
 *   onAdd: ({ eid }) => { spawnEffect(eid) },
 * })
 */
export function useObserver({
  components,
  onAdd: onAddFn,
  onRemove: onRemoveFn,
}: {
  components: Array<ComponentStore>;
  onAdd?: (params: { eid: number }) => void;
  onRemove?: (params: { eid: number }) => void;
}): void {
  const { world } = useGame();
  const cleanups: Array<() => void> = [];

  if (onAddFn !== undefined) {
    const off = observe(world, onAdd(...components), (eid: number) => {
      onAddFn({ eid });
    });
    cleanups.push(off);
  }

  if (onRemoveFn !== undefined) {
    const off = observe(world, onRemove(...components), (eid: number) => {
      onRemoveFn({ eid });
    });
    cleanups.push(off);
  }

  onUnmounted(() => {
    for (const off of cleanups) {
      off();
    }
  });
}
