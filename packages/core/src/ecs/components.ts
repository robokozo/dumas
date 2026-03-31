import { shallowRef } from "vue";
import type { ShallowRef } from "vue";
import type { ComponentFactory, ComponentStore } from "../types";

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

/** Stable symbol used as the storeRegistry key for all transform stores. */
export const TRANSFORM_TYPE: symbol = Symbol("dumas.transform");

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

function makeTransformStore(): TransformStore {
  return {
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
}

/**
 * Transform ComponentFactory — auto-attached to every entity by useEcsComponent.
 *
 * Exported so user code can still reference it explicitly (e.g. to use the
 * TRANSFORM_TYPE symbol or to include it in useSystem component lists).
 */
export const createTransform: ComponentFactory<TransformStore> = Object.assign(makeTransformStore, {
  __type: TRANSFORM_TYPE,

  onMounted({ eid, store }: { eid: number; store: TransformStore }): void {
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

  onUnmounted({ eid, store }: { eid: number; store: TransformStore }): void {
    const raw = store as unknown as Record<string, Array<unknown>>;
    for (const field of TRANSFORM_FIELDS) {
      raw[field][eid] = undefined;
    }
  },
});

interface SceneTagStore extends ComponentStore {
  sceneHash: Array<number>;
}

/**
 * createSceneTag — factory that returns a fresh SceneTagStore instance.
 * Records a numeric hash of the owning scene's name so the scene manager
 * can bulk-destroy non-persistent entities on scene exit.
 */
export function createSceneTag(): SceneTagStore {
  return { sceneHash: [] };
}

/**
 * PersistentTag — zero-field tag. Entities with this component survive
 * scene transitions and are not destroyed on scene exit.
 */
export const PersistentTag: ComponentStore = {};

/**
 * Creates a zero-field tag ComponentFactory for archetype filtering.
 * Each call returns a unique tag backed by its own symbol.
 *
 * @example
 * const PlayerTag = defineTag();
 * const EnemyTag = defineTag();
 *
 * useEcsComponent({ components: { player: PlayerTag } });
 * useCollision({ self: { player: PlayerTag }, other: { enemy: EnemyTag }, ... });
 */
export function defineTag(): ComponentFactory<ComponentStore> {
  const type: symbol = Symbol();
  return Object.assign((): ComponentStore => ({}), { __type: type });
}
