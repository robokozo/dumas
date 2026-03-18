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
  entityMeshMap: Map<number, Object3D>;
  reactiveEntities: Map<number, ReactiveEntityRefs>;
  systems: Array<SystemEntry>;
  registerSystem: (entry: { fn: SystemFn; priority: number }) => () => void;
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
}

export interface ColliderReturn {
  collider: ShallowRef<RAPIER.Collider | null>;
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
  handles: Readonly<ShallowRef<ReadonlyArray<PoolHandle>>>;
  available: Readonly<Ref<number>>;
  active: Readonly<Ref<number>>;
  acquire: () => PoolHandle | null;
  release: (params: { eid: number }) => void;
}
