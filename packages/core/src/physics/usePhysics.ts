import { useGame } from "../world/useGame";

/**
 * Kicks off Rapier WASM loading and world creation for the current game instance.
 *
 * The call is synchronous from the component's perspective — WASM loads in the
 * background and the physics world becomes available shortly after. Entity
 * components that use createPhysics() watch for the world to become ready and
 * create their bodies lazily, so no <Suspense> boundary is needed.
 *
 * Call once per game — subsequent calls are a no-op if the world is already
 * initialized or loading.
 *
 * @example
 * usePhysics({ gravity: [0, -9.81, 0] });
 */
export function usePhysics({
  gravity = [0, -9.81, 0] as [number, number, number],
}: {
  gravity?: [number, number, number];
} = {}): void {
  const gameCtx = useGame();

  if (gameCtx.physicsWorld.value !== null) return;

  void (async () => {
    const RAPIER = await import("@dimforge/rapier3d-compat");
    await RAPIER.init();
    if (gameCtx.physicsWorld.value !== null) return;
    const world = new RAPIER.World(new RAPIER.Vector3(gravity[0], gravity[1], gravity[2]));
    // Higher solver iterations for joint/contact stability (default is 4).
    world.numSolverIterations = 8;
    gameCtx.physicsWorld.value = world;
  })();
}
