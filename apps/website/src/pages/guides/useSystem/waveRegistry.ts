import type { InjectionKey, ShallowRef } from "vue";

export interface WaveEntry {
  posY: ShallowRef<number>;
  rotY: ShallowRef<number>;
  phase: number;
}

export const WAVE_REGISTRY_KEY: InjectionKey<Map<number, WaveEntry>> = Symbol("wave-registry");
