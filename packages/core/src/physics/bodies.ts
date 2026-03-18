import type RAPIER from "@dimforge/rapier3d-compat";
import type { RigidBodyType, Vec3, Quat } from "../types";

export function createRigidBody({
  physicsWorld,
  rapier,
  type,
  position,
  rotation,
}: {
  physicsWorld: RAPIER.World;
  rapier: typeof RAPIER;
  type: RigidBodyType;
  position: Vec3;
  rotation?: Quat;
}): RAPIER.RigidBody {
  let desc: RAPIER.RigidBodyDesc;

  if (type === "dynamic") {
    desc = rapier.RigidBodyDesc.dynamic();
  } else if (type === "fixed") {
    desc = rapier.RigidBodyDesc.fixed();
  } else if (type === "kinematicPosition") {
    desc = rapier.RigidBodyDesc.kinematicPositionBased();
  } else {
    desc = rapier.RigidBodyDesc.kinematicVelocityBased();
  }

  desc.setTranslation(position.x, position.y, position.z);

  if (rotation !== undefined) {
    desc.setRotation(rotation);
  }

  return physicsWorld.createRigidBody(desc);
}
