import { onUnmounted, shallowRef } from "vue";
import type { ShallowRef } from "vue";
import { useTres } from "@tresjs/core";
import { Vector3 } from "three";
import type { Camera } from "three";
import { useGame } from "../world/useGame";
import { TRANSFORM_TYPE } from "../ecs/components";
import type { TransformStore } from "../ecs/components";

// ─── public types ────────────────────────────────────────────────────────────

export interface WorldToScreenResult {
  /** Screen-space X in CSS pixels (relative to canvas). */
  x: ShallowRef<number>;
  /** Screen-space Y in CSS pixels (relative to canvas). */
  y: ShallowRef<number>;
  /** Whether the entity is in front of the camera (not behind). */
  isVisible: ShallowRef<boolean>;
}

// ─── composable ──────────────────────────────────────────────────────────────

/**
 * Projects an entity's 3D position to 2D screen coordinates every frame.
 * Use the returned `x`/`y` to position DOM overlay content (health bars,
 * name tags, damage numbers) relative to an entity's world position.
 *
 * Must be called inside a component that is a descendant of `<TresCanvas>`.
 *
 * @example
 * const { x, y, isVisible } = useWorldToScreen({ eid: playerEid });
 *
 * // In overlay template:
 * // <div v-if="isVisible" :style="{ left: x + 'px', top: y + 'px' }">
 * //   {{ health }}
 * // </div>
 */
export function useWorldToScreen({ eid }: { eid: number }): WorldToScreenResult {
  const { camera, renderer } = useTres();
  const { storeRegistry, registerSystem } = useGame();

  const x = shallowRef(0);
  const y = shallowRef(0);
  const isVisible = shallowRef(false);

  const worldPos = new Vector3();

  const off = registerSystem({
    priority: 5,
    fn: () => {
      const cam = camera.value as Camera | undefined;
      if (cam === undefined) return;

      const transformStore = storeRegistry.get(TRANSFORM_TYPE) as TransformStore | undefined;
      if (transformStore === undefined) return;

      const px = transformStore.posX[eid]?.value ?? 0;
      const py = transformStore.posY[eid]?.value ?? 0;
      const pz = transformStore.posZ[eid]?.value ?? 0;

      worldPos.set(px, py, pz);
      worldPos.project(cam);

      // Behind camera check (z > 1 in NDC means behind)
      isVisible.value = worldPos.z < 1;

      const canvas = renderer.domElement;
      const halfW = canvas.clientWidth / 2;
      const halfH = canvas.clientHeight / 2;

      x.value = worldPos.x * halfW + halfW;
      y.value = -(worldPos.y * halfH) + halfH;
    },
  });

  onUnmounted(off);

  return { x, y, isVisible };
}
