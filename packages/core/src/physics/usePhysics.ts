import { useGame } from "../world/useGame";

/**
 * Initializes the Rapier physics engine for the current game instance.
 *
 * Loads the WASM binary and creates a Rapier World with the given gravity.
 * The physics step is driven by the central game loop in <Game> — no separate
 * system registration is needed here.
 *
 * Must be called inside an async component setup that is a descendant of
 * <Game>. Call it once per scene — calling it again is a no-op if the world
 * is already initialized.
 *
 * @example
 * await usePhysics({ gravity: [0, -9.81, 0] });
 */
export async function usePhysics({
  gravity = [0, -9.81, 0] as [number, number, number],
}: {
  gravity?: [number, number, number];
} = {}): Promise<void> {
  const gameCtx = useGame();

  if (gameCtx.physicsWorld.value !== null) return;

  const RAPIER = await import("@dimforge/rapier3d-compat");
  await RAPIER.init();

  gameCtx.physicsWorld.value = new RAPIER.World(
    new RAPIER.Vector3(gravity[0], gravity[1], gravity[2]),
  );
}
