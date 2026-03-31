import type { ShallowRef } from "vue";

/**
 * A sliced transform with convenience methods for common rotation operations.
 * Returned by useEcsComponent as the `transform` field.
 */
export interface SlicedTransform {
  posX: ShallowRef<number>;
  posY: ShallowRef<number>;
  posZ: ShallowRef<number>;
  rotX: ShallowRef<number>;
  rotY: ShallowRef<number>;
  rotZ: ShallowRef<number>;
  rotW: ShallowRef<number>;
  scaleX: ShallowRef<number>;
  scaleY: ShallowRef<number>;
  scaleZ: ShallowRef<number>;
  /** Set a Y-axis rotation from an angle in radians. */
  setRotationY: (params: { angle: number }) => void;
  /** Set rotation from Euler angles (radians, intrinsic XYZ order). */
  setEuler: (params: { x?: number; y?: number; z?: number }) => void;
  /** Rotate to face a target position on the XZ plane (Y-axis rotation). */
  lookAt: (params: { x: number; z: number }) => void;
}

/**
 * Wraps raw sliced transform ShallowRefs with rotation helper methods.
 */
export function createSlicedTransform(raw: {
  posX: ShallowRef<number>;
  posY: ShallowRef<number>;
  posZ: ShallowRef<number>;
  rotX: ShallowRef<number>;
  rotY: ShallowRef<number>;
  rotZ: ShallowRef<number>;
  rotW: ShallowRef<number>;
  scaleX: ShallowRef<number>;
  scaleY: ShallowRef<number>;
  scaleZ: ShallowRef<number>;
}): SlicedTransform {
  return {
    ...raw,

    setRotationY({ angle }: { angle: number }): void {
      const half = angle / 2;
      raw.rotX.value = 0;
      raw.rotY.value = Math.sin(half);
      raw.rotZ.value = 0;
      raw.rotW.value = Math.cos(half);
    },

    setEuler({ x = 0, y = 0, z = 0 }: { x?: number; y?: number; z?: number }): void {
      // Intrinsic XYZ → quaternion
      const cx = Math.cos(x / 2);
      const sx = Math.sin(x / 2);
      const cy = Math.cos(y / 2);
      const sy = Math.sin(y / 2);
      const cz = Math.cos(z / 2);
      const sz = Math.sin(z / 2);

      raw.rotX.value = sx * cy * cz + cx * sy * sz;
      raw.rotY.value = cx * sy * cz - sx * cy * sz;
      raw.rotZ.value = cx * cy * sz + sx * sy * cz;
      raw.rotW.value = cx * cy * cz - sx * sy * sz;
    },

    lookAt({ x, z }: { x: number; z: number }): void {
      const dx = x - raw.posX.value;
      const dz = z - raw.posZ.value;
      const angle = Math.atan2(dx, dz);
      const half = angle / 2;
      raw.rotX.value = 0;
      raw.rotY.value = Math.sin(half);
      raw.rotZ.value = 0;
      raw.rotW.value = Math.cos(half);
    },
  };
}
