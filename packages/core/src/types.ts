import type { ShallowRef, Ref } from "vue";
import type { World } from "bitecs";
import type RAPIER from "@dimforge/rapier3d-compat";
import type { Object3D } from "three";

// -- Union types --

export type RigidBodyType = "dynamic" | "fixed" | "kinematicPosition" | "kinematicVelocity";

export type ColliderShape = "box" | "sphere" | "capsule";

// -- Vector/Quaternion --

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

// -- World context --

export interface DumasContext {
  ecsWorld: World;
  physicsWorld: ShallowRef<RAPIER.World | null>;
  rapier: ShallowRef<typeof RAPIER | null>;
  isReady: Ref<boolean>;
  entityBodyMap: Map<number, RAPIER.RigidBody>;
  entityColliderMap: Map<number, RAPIER.Collider>;
  colliderEntityMap: Map<number, number>;
  entityMeshMap: Map<number, Object3D>;
  reactiveEntities: Map<number, ReactiveEntityRefs>;
  systems: Array<SystemEntry>;
  collisionHandlers: Map<number, Array<CollisionHandler>>;
  jointMap: Map<number, RAPIER.ImpulseJoint>;
  registerSystem: (entry: { fn: SystemFn; priority: number }) => () => void;
  registerCollisionHandler: (params: { eid: number; handler: CollisionHandler }) => () => void;
}

export interface ReactiveEntityRefs {
  position: ShallowRef<Vec3>;
  rotation: ShallowRef<Quat>;
}

export type SystemFn = (params: { world: World; delta: number; elapsed: number }) => void;

export interface SystemEntry {
  fn: SystemFn;
  priority: number;
}

// -- Composable options --

export interface WorldOptions {
  gravity?: Vec3;
}

export interface GameObjectOptions {
  position?: [number, number, number];
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
}

export interface GameObjectReturn {
  groupRef: ShallowRef<Object3D | null>;
  eid: number;
  position: Readonly<Ref<Vec3>>;
  rotation: Readonly<Ref<Quat>>;
}

export interface RigidBodyOptions {
  eid: number;
  type?: RigidBodyType;
}

export interface RigidBodyReturn {
  rigidBody: ShallowRef<RAPIER.RigidBody | null>;
  applyImpulse: (impulse: Vec3) => void;
  applyForce: (force: Vec3) => void;
  setLinvel: (vel: Vec3) => void;
  setAngvel: (vel: Vec3) => void;
}

export interface ColliderOptions {
  eid: number;
  shape: ColliderShape;
  args?: [number, number, number];
  radius?: number;
  halfHeight?: number;
  restitution?: number;
  friction?: number;
  density?: number;
  isSensor?: boolean;
  /** Overrides the default collision pair filtering for this collider. */
  activeCollisionTypes?: RAPIER.ActiveCollisionTypes;
  /** Optional collision handler registered for this entity. Shorthand for a separate useCollisionHandler call. */
  onCollision?: CollisionHandler;
}

export interface ColliderReturn {
  collider: ShallowRef<RAPIER.Collider | null>;
}

// -- Collision events --

export type CollisionEventType = "started" | "stopped";

export interface CollisionEvent {
  eidA: number;
  eidB: number;
  type: CollisionEventType;
  isSensor: boolean;
}

export type CollisionHandler = (event: CollisionEvent) => void;

// -- Joints --

export type JointType = "fixed" | "revolute" | "prismatic" | "spherical";

export interface JointOptions {
  bodyA: RAPIER.RigidBody;
  bodyB: RAPIER.RigidBody;
  type: JointType;
  anchorA?: Vec3;
  anchorB?: Vec3;
  axis?: Vec3;
  limits?: { min: number; max: number };
}

export interface JointReturn {
  joint: ShallowRef<RAPIER.ImpulseJoint | null>;
}

// -- Input --

export type HardwareButton =
  | "south"
  | "east"
  | "west"
  | "north"
  | "lb"
  | "rb"
  | "lt"
  | "rt"
  | "l3"
  | "r3"
  | "dpadUp"
  | "dpadDown"
  | "dpadLeft"
  | "dpadRight"
  | "start"
  | "select";

export interface StickState {
  x: number;
  y: number;
}

export interface TriggerState {
  left: number;
  right: number;
}

export interface KeyboardInputOptions {
  source: "keyboard";
  bindings: Partial<Record<HardwareButton, Array<string>>>;
}

export interface GamepadInputOptions {
  source: { type: "gamepad"; index: number };
}

export type InputOptions = KeyboardInputOptions | GamepadInputOptions;

export interface InputReturn {
  isHeld: (button: HardwareButton) => boolean;
  wasJustPressed: (button: HardwareButton) => boolean;
  leftStick: Readonly<ShallowRef<StickState>>;
  rightStick: Readonly<ShallowRef<StickState>>;
  triggers: Readonly<ShallowRef<TriggerState>>;
}

export type ActionSource = ReadonlyArray<HardwareButton> | "leftStick" | "rightStick";

export type ActionMapDefinition<TActions extends string> = Record<TActions, ActionSource>;

export interface ActionMapReturn<TActions extends string> {
  isHeld: (action: TActions) => boolean;
  wasJustPressed: (action: TActions) => boolean;
  axis: (action: TActions) => StickState;
}

// -- Character controller --

export type CharacterMode = "2d" | "3d";

export interface CharacterControllerKccOptions {
  /** Skin width gap maintained between the character and surfaces. Default: 0.01 */
  offset?: number;
  /** Maximum slope angle the character can climb (radians). Default: PI/4 */
  maxSlopeClimbAngle?: number;
  /** Minimum slope angle that causes the character to slide (radians). Default: PI/4 */
  minSlopeSlideAngle?: number;
  /** Snap-to-ground distance. null disables. Default: null */
  snapToGround?: number | null;
  /** Autostep configuration. null disables. Default: null */
  autostep?: { maxHeight: number; minWidth: number; includeDynamic: boolean } | null;
  /** Whether the KCC pushes dynamic bodies it contacts. Default: true */
  applyImpulsesToDynamicBodies?: boolean;
}

export interface KccCollisionInfo {
  colliderHandle: number;
  eid: number | null;
}

export interface CharacterControllerOptions {
  eid: number;
  collider: Omit<ColliderOptions, "eid">;
  moveSpeed?: number;
  jumpSpeed?: number;
  gravity?: number;
  mode?: CharacterMode;
  kcc?: CharacterControllerKccOptions;
  /** Called for each KCC collision after computeColliderMovement. */
  onKccCollision?: (collision: KccCollisionInfo) => void;
}

export interface CharacterControllerReturn {
  rigidBody: ShallowRef<RAPIER.RigidBody | null>;
  collider: ShallowRef<RAPIER.Collider | null>;
  controller: Readonly<ShallowRef<RAPIER.KinematicCharacterController | null>>;
  isGrounded: Readonly<ShallowRef<boolean>>;
  move: (dir: { x: number; z: number; delta: number }) => void;
  jump: (options?: { speed?: number }) => void;
  teleport: (options: { position: Vec3 }) => void;
}

// -- Object pool --

export interface PoolHandle {
  eid: number;
  rigidBody: RAPIER.RigidBody;
  collider: RAPIER.Collider;
  isActive: boolean;
}

export interface ObjectPoolOptions {
  size: number;
  bodyType?: RigidBodyType;
  colliderOptions: Omit<ColliderOptions, "eid">;
  parkPosition?: Vec3;
}

export interface ObjectPoolReturn {
  handles: ShallowRef<ReadonlyArray<PoolHandle>>;
  available: Readonly<Ref<number>>;
  active: Readonly<Ref<number>>;
  acquire: () => PoolHandle | null;
  release: (params: { eid: number }) => void;
}
