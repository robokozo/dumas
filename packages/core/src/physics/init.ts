import RAPIER from "@dimforge/rapier3d-compat";
import type { Vec3 } from "../types";

let rapierPromise: Promise<typeof RAPIER> | null = null;

export async function initRapier(): Promise<typeof RAPIER> {
  if (rapierPromise === null) {
    rapierPromise = RAPIER.init().then(() => RAPIER);
  }
  return rapierPromise;
}

export function createPhysicsWorld({ gravity }: { gravity: Vec3 }): RAPIER.World {
  return new RAPIER.World(gravity);
}
