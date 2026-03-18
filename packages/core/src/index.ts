// Components
export { default as GameObject } from "./components/GameObject.vue";
export { default as RigidBody } from "./components/RigidBody.vue";
export { default as Collider } from "./components/Collider.vue";

// Composables
export { useWorld } from "./composables/useWorld";
export { useGameObject } from "./composables/useGameObject";
export { useSystem } from "./composables/useSystem";
export { useRigidBody } from "./composables/useRigidBody";
export { useCollider } from "./composables/useCollider";

// ECS components (for advanced users building custom systems)
export { Transform, Velocity, RigidBodyRef, ColliderRef } from "./ecs/components";

// Types
export type {
  Vec3,
  Quat,
  RigidBodyType,
  ColliderShape,
  DumasContext,
  WorldOptions,
  GameObjectOptions,
  RigidBodyOptions,
  ColliderOptions,
  SystemFn,
} from "./types";

// Return types
export type { GameObjectReturn } from "./composables/useGameObject";
export type { RigidBodyReturn } from "./composables/useRigidBody";
export type { ColliderReturn } from "./composables/useCollider";
