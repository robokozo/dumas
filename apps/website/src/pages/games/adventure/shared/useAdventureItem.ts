import { useSystem } from "@dumas/core";
import { injectAdventureContext } from "./useAdventureContext";
import type { Interaction } from "./types";

const INTERACTION_RANGE = 1.8;
const APPROACH_OFFSET = 1.1;

interface UseAdventureItemOptions {
  id: string;
  x: number;
  z: number;
  label: string;
  interactions: Array<Interaction>;
}

interface UseAdventureItemReturn {
  tryInteract(): void;
}

export function useAdventureItem({
  id,
  x,
  z,
  label,
  interactions,
}: UseAdventureItemOptions): UseAdventureItemReturn {
  const ctx = injectAdventureContext();

  useSystem({
    components: [],
    fn: () => {
      if (ctx.activeItemId.value !== null) {
        // Clear proximity if we were the nearby item
        if (ctx.nearbyItem.value?.id === id) {
          ctx.nearbyItem.value = null;
        }
        return;
      }
      const { x: cx, z: cz } = ctx.getCharPos();
      const dx = x - cx;
      const dz = z - cz;
      const isNear = Math.sqrt(dx * dx + dz * dz) < INTERACTION_RANGE;

      if (isNear) {
        ctx.nearbyItem.value = { id, label, interactions };
      } else if (ctx.nearbyItem.value?.id === id) {
        ctx.nearbyItem.value = null;
      }
    },
  });

  function tryInteract(): void {
    if (ctx.activeItemId.value !== null) return;
    const { x: cx, z: cz } = ctx.getCharPos();
    const dx = cx - x;
    const dz = cz - z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < INTERACTION_RANGE) {
      ctx.openItem({ id, label, interactions });
    } else {
      const angle = Math.atan2(dx, dz);
      ctx.walkToItem({
        x: x + Math.sin(angle) * APPROACH_OFFSET,
        z: z + Math.cos(angle) * APPROACH_OFFSET,
        id,
        label,
        interactions,
      });
    }
  }

  return { tryInteract };
}
