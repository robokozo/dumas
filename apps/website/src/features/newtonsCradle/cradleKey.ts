import type { InjectionKey } from "vue";
import type { ShallowRef } from "vue";
import type RAPIER from "@dimforge/rapier3d-compat";

export interface CradleState {
  angles: Array<number>;
  omegas: Array<number>;
}

export interface CradleContext {
  state: CradleState;
  PIVOT_X: Array<number>;
  PIVOT_Y: number;
  STRING_LENGTH: number;
  BALL_RADIUS: number;
  STRING_Z: number;
  registerBody: (params: { index: number; body: ShallowRef<RAPIER.RigidBody | null> }) => void;
}

export const CRADLE_KEY: InjectionKey<CradleContext> = Symbol("cradleContext");
