import type RAPIER from "@dimforge/rapier3d-compat";
import type { ColliderOptions } from "../types";
import { DEFAULT_RESTITUTION, DEFAULT_FRICTION, DEFAULT_DENSITY } from "../constants";

export function createCollider({
  physicsWorld,
  rapier,
  rigidBody,
  options,
}: {
  physicsWorld: RAPIER.World;
  rapier: typeof RAPIER;
  rigidBody: RAPIER.RigidBody;
  options: ColliderOptions;
}): RAPIER.Collider {
  let desc: RAPIER.ColliderDesc;

  if (options.shape === "box") {
    const args = options.args ?? [0.5, 0.5, 0.5];
    desc = rapier.ColliderDesc.cuboid(args[0], args[1], args[2]);
  } else if (options.shape === "sphere") {
    const radius = options.radius ?? 0.5;
    desc = rapier.ColliderDesc.ball(radius);
  } else {
    // capsule
    const halfHeight = options.halfHeight ?? 0.5;
    const radius = options.radius ?? 0.25;
    desc = rapier.ColliderDesc.capsule(halfHeight, radius);
  }

  desc.setRestitution(options.restitution ?? DEFAULT_RESTITUTION);
  desc.setFriction(options.friction ?? DEFAULT_FRICTION);
  desc.setDensity(options.density ?? DEFAULT_DENSITY);

  if (options.isSensor === true) {
    desc.setSensor(true);
  }

  // COLLISION_EVENTS = 1, enables EventQueue collision reporting for this collider
  const COLLISION_EVENTS_FLAG = 1;
  desc.setActiveEvents(COLLISION_EVENTS_FLAG);

  return physicsWorld.createCollider(desc, rigidBody);
}
