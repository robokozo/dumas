import type { QueryResult, World } from "bitecs";

export interface SystemOptions {
  /**
   * Execution order relative to other systems. Lower numbers run first.
   * @default 0
   */
  priority?: number;
}

export interface SystemParams {
  delta: number;
  elapsed: number;
  world: World;
}

export interface SystemParamsWithEntities extends SystemParams {
  entities: QueryResult;
}

/**
 * Per-frame callback registered via useSystem().
 * Runs inside TresJS's onBeforeRender loop.
 *
 * Do NOT access Vue reactive state inside this function — it runs in the
 * hot render path. Read directly from bitECS SoA arrays instead.
 */
export type SystemFn = (params: SystemParams) => void;
export type SystemFnWithEntities = (params: SystemParamsWithEntities) => void;
