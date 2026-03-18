import type RAPIER from "@dimforge/rapier3d-compat";

export function stepPhysics({
  physicsWorld,
  eventQueue,
}: {
  physicsWorld: RAPIER.World;
  eventQueue: RAPIER.EventQueue;
}): void {
  physicsWorld.step(eventQueue);
}
