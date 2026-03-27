interface TransformStore {
  posX: Array<number>;
  posY: Array<number>;
  posZ: Array<number>;
  rotX: Array<number>;
  rotY: Array<number>;
  rotZ: Array<number>;
  rotW: Array<number>;
  scaleX: Array<number>;
  scaleY: Array<number>;
  scaleZ: Array<number>;
}

interface SceneTagStore {
  sceneHash: Array<number>;
}

/**
 * Transform — world-space position, rotation (quaternion), and scale.
 * Arrays are indexed by entity ID. Quaternion defaults to identity (w = 1)
 * and scale defaults to 1 — applied via onAdd observers in createEcsWorld().
 */
export const Transform: TransformStore = {
  posX: [],
  posY: [],
  posZ: [],
  rotX: [],
  rotY: [],
  rotZ: [],
  rotW: [],
  scaleX: [],
  scaleY: [],
  scaleZ: [],
};

/**
 * PersistentTag — zero-field tag. Entities with this component survive
 * scene transitions and are not destroyed on scene exit.
 */
export const PersistentTag = {};

/**
 * SceneTag — records a numeric hash of the owning scene's name.
 * The scene manager uses this to bulk-query and destroy all non-persistent
 * entities belonging to a scene when it unloads.
 */
export const SceneTag: SceneTagStore = {
  sceneHash: [],
};

/**
 * SpawnPointTag — zero-field tag marking entities that represent spawn
 * anchors within a scene. Used by the scene manager to locate spawn points
 * for persistent entity placement on scene transitions.
 */
export const SpawnPointTag = {};
