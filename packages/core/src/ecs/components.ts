import { shallowRef } from "vue";
import type { ShallowRef } from "vue";
import type { ComponentStore } from "../types";

interface TransformStore extends ComponentStore {
  posX: Array<ShallowRef<number>>;
  posY: Array<ShallowRef<number>>;
  posZ: Array<ShallowRef<number>>;
  rotX: Array<ShallowRef<number>>;
  rotY: Array<ShallowRef<number>>;
  rotZ: Array<ShallowRef<number>>;
  rotW: Array<ShallowRef<number>>;
  scaleX: Array<ShallowRef<number>>;
  scaleY: Array<ShallowRef<number>>;
  scaleZ: Array<ShallowRef<number>>;
}

interface SceneTagStore {
  sceneHash: Array<number>;
}

/**
 * Transform — world-space position, rotation (quaternion), and scale.
 * Each field holds a ShallowRef so systems can write directly (.value = x)
 * and TresJS template bindings react without a separate sync step.
 *
 * useEcsComponent calls onMounted() synchronously before addComponents, so refs
 * are always present by the time setup code accesses them.
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

  onMounted({ eid }) {
    Transform.posX[eid] = shallowRef(0);
    Transform.posY[eid] = shallowRef(0);
    Transform.posZ[eid] = shallowRef(0);
    Transform.rotX[eid] = shallowRef(0);
    Transform.rotY[eid] = shallowRef(0);
    Transform.rotZ[eid] = shallowRef(0);
    Transform.rotW[eid] = shallowRef(1);
    Transform.scaleX[eid] = shallowRef(1);
    Transform.scaleY[eid] = shallowRef(1);
    Transform.scaleZ[eid] = shallowRef(1);
  },

  onUnmounted({ eid }) {
    const store = Transform as unknown as Record<string, Array<unknown>>;
    for (const field of [
      "posX",
      "posY",
      "posZ",
      "rotX",
      "rotY",
      "rotZ",
      "rotW",
      "scaleX",
      "scaleY",
      "scaleZ",
    ]) {
      store[field][eid] = undefined;
    }
  },
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
