import type { ComponentStore, ComponentFactory } from "../types";

/**
 * Slices a single ComponentStore to the values at a specific entity ID.
 * Array<T> fields become T; methods and non-array fields are excluded.
 */
export type SlicedStore<S extends ComponentStore> = {
  [K in keyof S as S[K] extends Array<unknown> ? K : never]: S[K] extends Array<infer T>
    ? T
    : never;
};

/**
 * Maps a record of named ComponentStores to their per-entity sliced forms.
 */
export type SlicedComponents<R extends Record<string, ComponentStore>> = {
  [K in keyof R]: SlicedStore<R[K]>;
};

/**
 * Maps a record of ComponentFactories to their return types (store instances).
 */
export type InstancesOf<F extends Record<string, ComponentFactory>> = {
  [K in keyof F]: ReturnType<F[K]>;
};

export interface EntityOptions {
  /**
   * If true, this entity survives scene transitions instead of being
   * destroyed when the owning scene unloads.
   * @default false
   */
  persistent?: boolean;
}

export interface EntityContext {
  /** The bitECS entity ID. Stable for the full lifetime of the entity. */
  eid: number;
  /** Whether this entity persists across scene transitions. */
  isPersistent: boolean;
}
