import { onMounted, onUnmounted, shallowRef } from "vue";
import type { ShallowRef } from "vue";
import { useTres } from "@tresjs/core";
import { Raycaster, Vector2 } from "three";
import type { Camera, Intersection, Object3D } from "three";

// ─── public types ────────────────────────────────────────────────────────────

export interface PointerState {
  /** Screen-space X in pixels (relative to canvas). */
  x: ShallowRef<number>;
  /** Screen-space Y in pixels (relative to canvas). */
  y: ShallowRef<number>;
  /** Normalized device coordinate X (-1 to 1). */
  ndcX: ShallowRef<number>;
  /** Normalized device coordinate Y (-1 to 1). */
  ndcY: ShallowRef<number>;
  /** Whether the pointer is currently pressed. */
  isDown: ShallowRef<boolean>;
  /** True for exactly one frame after the pointer is pressed. */
  isPressed: ShallowRef<boolean>;
  /** True for exactly one frame after the pointer is released. */
  isReleased: ShallowRef<boolean>;
  /** Whether the pointer is over the canvas. */
  isOver: ShallowRef<boolean>;
  /**
   * Cast a ray from the camera through the current pointer position.
   * Returns Three.js intersection results against the provided objects
   * (or the entire scene if none specified).
   */
  raycast: (params?: { objects?: Array<Object3D>; recursive?: boolean }) => Array<Intersection>;
}

// ─── composable ──────────────────────────────────────────────────────────────

/**
 * Tracks pointer/touch position and state relative to the TresCanvas.
 * Provides screen-space coords, NDC coords, press/release detection,
 * and a raycast helper for picking 3D objects.
 *
 * Must be called inside a component that is a descendant of `<TresCanvas>`.
 *
 * @example
 * const pointer = usePointer();
 *
 * useSystem({
 *   fn: () => {
 *     if (pointer.isPressed.value) {
 *       const hits = pointer.raycast();
 *       if (hits.length > 0) {
 *         console.log("clicked", hits[0].object.name);
 *       }
 *     }
 *   },
 * });
 */
export function usePointer(): PointerState {
  const { camera, scene, renderer } = useTres();

  const x = shallowRef(0);
  const y = shallowRef(0);
  const ndcX = shallowRef(0);
  const ndcY = shallowRef(0);
  const isDown = shallowRef(false);
  const isPressed = shallowRef(false);
  const isReleased = shallowRef(false);
  const isOver = shallowRef(false);

  const raycaster = new Raycaster();
  const ndcVec = new Vector2();
  let canvas: HTMLCanvasElement | null = null;
  let edgeFrameId: number | null = null;

  function updateNdc(clientX: number, clientY: number): void {
    if (canvas === null) return;
    const rect = canvas.getBoundingClientRect();
    x.value = clientX - rect.left;
    y.value = clientY - rect.top;
    ndcX.value = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndcY.value = -(((clientY - rect.top) / rect.height) * 2 - 1);
  }

  function scheduleEdgeClear(): void {
    if (edgeFrameId !== null) cancelAnimationFrame(edgeFrameId);
    edgeFrameId = requestAnimationFrame(() => {
      isPressed.value = false;
      isReleased.value = false;
      edgeFrameId = null;
    });
  }

  function onPointerMove(e: PointerEvent): void {
    updateNdc(e.clientX, e.clientY);
  }

  function onPointerDown(e: PointerEvent): void {
    updateNdc(e.clientX, e.clientY);
    if (isDown.value === false) {
      isDown.value = true;
      isPressed.value = true;
      scheduleEdgeClear();
    }
  }

  function onPointerUp(): void {
    if (isDown.value === true) {
      isDown.value = false;
      isReleased.value = true;
      scheduleEdgeClear();
    }
  }

  function onPointerEnter(): void {
    isOver.value = true;
  }

  function onPointerLeave(): void {
    isOver.value = false;
    if (isDown.value === true) {
      isDown.value = false;
      isReleased.value = true;
      scheduleEdgeClear();
    }
  }

  onMounted(() => {
    canvas = renderer.domElement;
    if (canvas === null) return;

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointerleave", onPointerLeave);
  });

  onUnmounted(() => {
    if (edgeFrameId !== null) cancelAnimationFrame(edgeFrameId);
    if (canvas === null) return;
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointerenter", onPointerEnter);
    canvas.removeEventListener("pointerleave", onPointerLeave);
  });

  function raycast({
    objects,
    recursive = true,
  }: { objects?: Array<Object3D>; recursive?: boolean } = {}): Array<Intersection> {
    const cam = camera.value as Camera | undefined;
    if (cam === undefined) return [];

    ndcVec.set(ndcX.value, ndcY.value);
    raycaster.setFromCamera(ndcVec, cam);

    if (objects !== undefined) {
      return raycaster.intersectObjects(objects, recursive);
    }
    return raycaster.intersectObjects(scene.value.children, recursive);
  }

  return { x, y, ndcX, ndcY, isDown, isPressed, isReleased, isOver, raycast };
}
