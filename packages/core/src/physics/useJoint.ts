import { onUnmounted, watch } from "vue";
import { JointData } from "@dimforge/rapier3d-compat";
import type {
  ImpulseJoint,
  RevoluteImpulseJoint,
  PrismaticImpulseJoint,
} from "@dimforge/rapier3d-compat";
import { useGame } from "../world/useGame";
import { PHYSICS_TYPE } from "./createPhysics";
import type { PhysicsStore } from "./createPhysics";
import type { Vec3 } from "../types";

// ─── public types ────────────────────────────────────────────────────────────

interface JointOptionsBase {
  /** Entity ID of the first body. */
  bodyA: number;
  /** Entity ID of the second body. */
  bodyB: number;
  /** Local anchor point on body A (default: origin). */
  anchorA?: Vec3;
  /** Local anchor point on body B (default: origin). */
  anchorB?: Vec3;
}

export interface FixedJointOptions extends JointOptionsBase {
  type: "fixed";
}

export interface RevoluteJointOptions extends JointOptionsBase {
  type: "revolute";
  /** Rotation axis (world-space). */
  axis: Vec3;
  /** Optional angle limits in radians [min, max]. */
  limits?: { min: number; max: number };
}

export interface PrismaticJointOptions extends JointOptionsBase {
  type: "prismatic";
  /** Translation axis (world-space). */
  axis: Vec3;
  /** Optional distance limits [min, max]. */
  limits?: { min: number; max: number };
}

export interface SpringJointOptions extends JointOptionsBase {
  type: "spring";
  /** Rest length of the spring. */
  restLength: number;
  /** Spring stiffness. */
  stiffness: number;
  /** Spring damping. */
  damping: number;
}

export type JointOptions =
  | FixedJointOptions
  | RevoluteJointOptions
  | PrismaticJointOptions
  | SpringJointOptions;

export interface JointResult {
  /** The underlying Rapier ImpulseJoint, or null if not yet created. */
  joint: ImpulseJoint | null;
  /**
   * Set a motor on the joint (revolute or prismatic only).
   * For revolute joints, drives toward the target velocity in rad/s.
   * For prismatic joints, drives toward the target velocity in m/s.
   */
  setMotor: (params: { targetVelocity: number; maxForce: number }) => void;
  /**
   * Set motor to drive toward a target position.
   * For revolute joints, the target is an angle in radians.
   * For prismatic joints, the target is a distance.
   */
  setMotorPosition: (params: {
    targetPosition: number;
    stiffness: number;
    damping: number;
  }) => void;
}

// ─── composable ──────────────────────────────────────────────────────────────

/**
 * Creates a Rapier impulse joint connecting two physics entities.
 * Supports fixed, revolute (hinge), prismatic (slide), and spring joints.
 *
 * The joint is automatically removed when the component unmounts.
 *
 * @example
 * const hinge = useJoint({
 *   type: "revolute",
 *   bodyA: doorFrameEid,
 *   bodyB: doorEid,
 *   axis: { x: 0, y: 1, z: 0 },
 *   limits: { min: 0, max: Math.PI * 0.75 },
 * });
 *
 * function onLeverPulled() {
 *   hinge.setMotor({ targetVelocity: 1.5, maxForce: 200 });
 * }
 */
export function useJoint(options: JointOptions): JointResult {
  const gameCtx = useGame();
  let joint: ImpulseJoint | null = null;

  const result: JointResult = {
    get joint() {
      return joint;
    },

    setMotor({ targetVelocity, maxForce }) {
      if (joint === null) return;
      if (options.type === "revolute") {
        (joint as RevoluteImpulseJoint).configureMotorVelocity(targetVelocity, maxForce);
      } else if (options.type === "prismatic") {
        (joint as PrismaticImpulseJoint).configureMotorVelocity(targetVelocity, maxForce);
      }
    },

    setMotorPosition({ targetPosition, stiffness, damping }) {
      if (joint === null) return;
      if (options.type === "revolute") {
        (joint as RevoluteImpulseJoint).configureMotorPosition(targetPosition, stiffness, damping);
      } else if (options.type === "prismatic") {
        (joint as PrismaticImpulseJoint).configureMotorPosition(targetPosition, stiffness, damping);
      }
    },
  };

  const stopWatch = watch(
    () => gameCtx.physicsWorld.value,
    (rapierWorld) => {
      if (rapierWorld === null) return;
      if (joint !== null) return;

      const physStore = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
      if (physStore === undefined) return;

      const bodyA = physStore.body[options.bodyA];
      const bodyB = physStore.body[options.bodyB];
      if (bodyA === undefined || bodyB === undefined) return;

      const a1 = options.anchorA ?? { x: 0, y: 0, z: 0 };
      const a2 = options.anchorB ?? { x: 0, y: 0, z: 0 };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let jointData: any;

      switch (options.type) {
        case "fixed":
          jointData = JointData.fixed(a1, { x: 0, y: 0, z: 0, w: 1 }, a2, {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          });
          break;

        case "revolute":
          jointData = JointData.revolute(a1, a2, options.axis);
          if (options.limits !== undefined) {
            jointData.limitsEnabled = true;
            jointData.limits = [options.limits.min, options.limits.max];
          }
          break;

        case "prismatic":
          jointData = JointData.prismatic(a1, a2, options.axis);
          if (options.limits !== undefined) {
            jointData.limitsEnabled = true;
            jointData.limits = [options.limits.min, options.limits.max];
          }
          break;

        case "spring":
          jointData = JointData.spring(
            options.restLength,
            options.stiffness,
            options.damping,
            a1,
            a2,
          );
          break;
      }

      joint = rapierWorld.createImpulseJoint(jointData, bodyA, bodyB, true);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    stopWatch();
    if (joint !== null && gameCtx.physicsWorld.value !== null) {
      gameCtx.physicsWorld.value.removeImpulseJoint(joint, true);
      joint = null;
    }
  });

  return result;
}
