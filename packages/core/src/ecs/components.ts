import { shallowRef } from "vue";
import type { ShallowRef } from "vue";
import type { ComponentStore } from "../types";

export interface TransformStore extends ComponentStore {
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

interface SceneTagStore extends ComponentStore {
  sceneHash: Array<number>;
}

const TRANSFORM_FIELDS = [
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
] as const;

/**
 * createTransform — factory that returns a fresh TransformStore instance.
 *
 * Each <Game> registers one instance per factory call, preventing eid
 * collisions when multiple games run on the same page.
 *
 * Fields hold ShallowRefs so TresJS template bindings react to system writes
 * without a separate sync step.
 */
export function createTransform(): TransformStore {
  const store: TransformStore = {
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
      store.posX[eid] = shallowRef(0);
      store.posY[eid] = shallowRef(0);
      store.posZ[eid] = shallowRef(0);
      store.rotX[eid] = shallowRef(0);
      store.rotY[eid] = shallowRef(0);
      store.rotZ[eid] = shallowRef(0);
      store.rotW[eid] = shallowRef(1);
      store.scaleX[eid] = shallowRef(1);
      store.scaleY[eid] = shallowRef(1);
      store.scaleZ[eid] = shallowRef(1);
    },

    onUnmounted({ eid }) {
      const raw = store as unknown as Record<string, Array<unknown>>;
      for (const field of TRANSFORM_FIELDS) {
        raw[field][eid] = undefined;
      }
    },
  };
  return store;
}

/**
 * PersistentTag — zero-field tag. Entities with this component survive
 * scene transitions and are not destroyed on scene exit.
 * Safe as a global singleton — bitECS queries are world-scoped.
 */
export const PersistentTag = {};

/**
 * createSceneTag — factory that returns a fresh SceneTagStore instance.
 * Records a numeric hash of the owning scene's name so the scene manager
 * can bulk-destroy non-persistent entities on scene exit.
 */
export function createSceneTag(): SceneTagStore {
  return { sceneHash: [] };
}

/**
 * SpawnPointTag — zero-field tag marking entities that represent spawn
 * anchors within a scene.
 * Safe as a global singleton — bitECS queries are world-scoped.
 */
export const SpawnPointTag = {};
