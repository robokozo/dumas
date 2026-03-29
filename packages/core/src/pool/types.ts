import type { ComputedRef, ShallowRef } from "vue";
import type { ComponentFactory } from "../types";
import type { InstancesOf, SlicedComponents } from "../entity/types";

export interface PoolSlot<F extends Record<string, ComponentFactory>> {
  eid: number;
  isActive: ShallowRef<boolean>;
  components: SlicedComponents<InstancesOf<F>>;
}

export interface PoolInstance<F extends Record<string, ComponentFactory>> {
  slots: ReadonlyArray<PoolSlot<F>>;
  stores: InstancesOf<F>;
  /** Number of currently acquired slots. */
  activeCount: ComputedRef<number>;
  /** Number of remaining free slots. */
  freeCount: ComputedRef<number>;
  acquire: () => number | null;
  release: (params: { eid: number }) => void;
}
