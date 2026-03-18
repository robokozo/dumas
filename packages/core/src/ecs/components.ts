// bitECS 0.4 SoA (Structure of Arrays) component definitions.
// Each property is a sparse array indexed by entity ID.
// bitECS uses Zero As Initial Initialization (ZAII) — all values start as 0.
// Non-zero defaults (quaternion w, scale) are handled via observers in world.ts.

export const Transform = {
  posX: [] as Array<number>,
  posY: [] as Array<number>,
  posZ: [] as Array<number>,
  rotX: [] as Array<number>,
  rotY: [] as Array<number>,
  rotZ: [] as Array<number>,
  rotW: [] as Array<number>,
  scaleX: [] as Array<number>,
  scaleY: [] as Array<number>,
  scaleZ: [] as Array<number>,
};

export const Velocity = {
  x: [] as Array<number>,
  y: [] as Array<number>,
  z: [] as Array<number>,
};

// Stores the Rapier rigid body handle (integer) for lookup in entityBodyMap
export const RigidBodyRef = {
  handle: [] as Array<number>,
};

// Stores the Rapier collider handle (integer) for lookup in entityColliderMap
export const ColliderRef = {
  handle: [] as Array<number>,
};
