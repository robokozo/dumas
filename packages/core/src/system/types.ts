export interface SystemOptions {
  /**
   * Execution order relative to other systems. Lower numbers run first.
   * @default 0
   */
  priority?: number;
}

/**
 * A per-frame callback registered via useSystem().
 * Runs inside TresJS's onBeforeRender loop.
 *
 * Do NOT access Vue reactive state inside this function — it runs in the
 * hot render path. Read directly from bitECS SoA arrays instead.
 */
export type SystemFn = (params: { delta: number; elapsed: number }) => void;
