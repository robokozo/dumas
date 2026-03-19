// Components
export { default as GameObject } from "./components/GameObject.vue";
export { default as RigidBody } from "./components/RigidBody.vue";
export { default as Collider } from "./components/Collider.vue";
export { default as DumasProvider } from "./components/DumasProvider.vue";

// Composables
export { useWorld } from "./composables/useWorld";
export { useGameObject } from "./composables/useGameObject";
export { useSystem } from "./composables/useSystem";
export { useRigidBody } from "./composables/useRigidBody";
export { useCollider } from "./composables/useCollider";
export { useCollisionHandler } from "./composables/useCollisionHandler";
export { useJoint } from "./composables/useJoint";

// Pooling
export { createObjectPool } from "./pooling/objectPool";
export { useObjectPool } from "./pooling/useObjectPool";

// ECS components (for advanced users building custom systems)
export { Transform, Velocity, RigidBodyRef, ColliderRef } from "./ecs/components";

// Types
export type {
  Vec3,
  Quat,
  RigidBodyType,
  ColliderShape,
  CollisionEventType,
  CollisionEvent,
  CollisionHandler,
  JointType,
  JointOptions,
  JointReturn,
  DumasContext,
  WorldOptions,
  GameObjectOptions,
  RigidBodyOptions,
  ColliderOptions,
  SystemFn,
  PoolHandle,
  ObjectPoolOptions,
  ObjectPoolReturn,
} from "./types";

// Return types
export type { GameObjectReturn } from "./composables/useGameObject";
export type { RigidBodyReturn } from "./composables/useRigidBody";
export type { ColliderReturn } from "./composables/useCollider";
