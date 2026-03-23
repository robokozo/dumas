// Components
export { default as GameObject } from "./components/GameObject.vue";
export { default as RigidBody } from "./components/RigidBody.vue";
export { default as Collider } from "./components/Collider.vue";
export { default as DumasCanvas } from "./components/DumasCanvas.vue";

// Composables
export { useDumasContext } from "./composables/useDumasContext";
export { createWorldContext } from "./composables/useWorld";
export { useGameObject } from "./composables/useGameObject";
export { useSystem } from "./composables/useSystem";
export { useRigidBody } from "./composables/useRigidBody";
export { useCollider } from "./composables/useCollider";
export { useCollisionHandler } from "./composables/useCollisionHandler";
export { useJoint } from "./composables/useJoint";
export { useInput } from "./composables/useInput";
export { useActionMap } from "./composables/useActionMap";
export { useActions } from "./composables/useActions";
export { useCharacterController } from "./composables/useCharacterController";
export { useContactDetection } from "./composables/useContactDetection";

// Pooling
export { createObjectPool } from "./physics/objectPool";
export { useObjectPool } from "./composables/useObjectPool";

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
  HardwareButton,
  StickState,
  TriggerState,
  InputOptions,
  InputReturn,
  ActionSource,
  ActionMapDefinition,
  ActionMapReturn,
  CharacterMode,
  CharacterControllerKccOptions,
  KccCollisionInfo,
  CharacterControllerOptions,
  CharacterControllerReturn,
} from "./types";

// Return types
export type { GameObjectReturn } from "./composables/useGameObject";
export type { RigidBodyReturn } from "./composables/useRigidBody";
export type { ColliderReturn } from "./composables/useCollider";
export type { ContactDetectionReturn } from "./composables/useContactDetection";
