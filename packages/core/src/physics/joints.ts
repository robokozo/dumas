import type RAPIER from "@dimforge/rapier3d-compat";
import type { JointOptions, Vec3 } from "../types";

const DEFAULT_ANCHOR: Vec3 = { x: 0, y: 0, z: 0 } as const;
const DEFAULT_AXIS: Vec3 = { x: 0, y: 1, z: 0 } as const;

export function createJoint({
  physicsWorld,
  rapier,
  options,
}: {
  physicsWorld: RAPIER.World;
  rapier: typeof RAPIER;
  options: JointOptions;
}): RAPIER.ImpulseJoint {
  const anchorA = options.anchorA ?? DEFAULT_ANCHOR;
  const anchorB = options.anchorB ?? DEFAULT_ANCHOR;

  let params: RAPIER.JointData;

  if (options.type === "fixed") {
    params = rapier.JointData.fixed(
      { x: anchorA.x, y: anchorA.y, z: anchorA.z },
      { w: 1, x: 0, y: 0, z: 0 },
      { x: anchorB.x, y: anchorB.y, z: anchorB.z },
      { w: 1, x: 0, y: 0, z: 0 },
    );
  } else if (options.type === "revolute") {
    const axis = options.axis ?? DEFAULT_AXIS;
    params = rapier.JointData.revolute(
      { x: anchorA.x, y: anchorA.y, z: anchorA.z },
      { x: anchorB.x, y: anchorB.y, z: anchorB.z },
      { x: axis.x, y: axis.y, z: axis.z },
    );
  } else if (options.type === "prismatic") {
    const axis = options.axis ?? { x: 1, y: 0, z: 0 };
    params = rapier.JointData.prismatic(
      { x: anchorA.x, y: anchorA.y, z: anchorA.z },
      { x: anchorB.x, y: anchorB.y, z: anchorB.z },
      { x: axis.x, y: axis.y, z: axis.z },
    );
  } else {
    // spherical
    params = rapier.JointData.spherical(
      { x: anchorA.x, y: anchorA.y, z: anchorA.z },
      { x: anchorB.x, y: anchorB.y, z: anchorB.z },
    );
  }

  const joint = physicsWorld.createImpulseJoint(params, options.bodyA, options.bodyB, true);

  if (options.limits !== undefined && options.type === "revolute") {
    (joint as RAPIER.RevoluteImpulseJoint).setLimits(options.limits.min, options.limits.max);
  } else if (options.limits !== undefined && options.type === "prismatic") {
    (joint as RAPIER.PrismaticImpulseJoint).setLimits(options.limits.min, options.limits.max);
  }

  return joint;
}
