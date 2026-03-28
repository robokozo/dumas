import type { QueryResult, World } from "bitecs";

export interface SystemOptions {
  /**
   * Execution order relative to other systems. Lower numbers run first.
   * @default 0
   */
  priority?: number;
}

export interface SystemParamsWithEntities {
  delta: number;
  elapsed: number;
  world: World;
  entities: QueryResult;
}

export type SystemFnWithEntities = (params: SystemParamsWithEntities) => void;
