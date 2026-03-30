// Physics
export { createPhysics } from "./physics/createPhysics";
export {
  createSphereCollider,
  createCuboidCollider,
  createCapsuleCollider,
  createConeCollider,
  createCylinderCollider,
} from "./physics/colliderConfig";
export { usePhysics } from "./physics/usePhysics";
export type { PhysicsStore, PhysicsOptions } from "./physics/createPhysics";
export type {
  ColliderConfig,
  SphereColliderConfig,
  CuboidColliderConfig,
  CapsuleColliderConfig,
  ConeColliderConfig,
  CylinderColliderConfig,
} from "./physics/colliderConfig";
export type { PhysicsContact, PhysicsContactEnd } from "./physics/types";

// Components
export { default as Game } from "./world/Game.vue";
export { default as Scene } from "./scene/Scene.vue";
export { default as Entity } from "./entity/Entity.vue";
export { default as ObjectPool } from "./pool/ObjectPool.vue";
export { default as DumasEntity } from "./components/DumasEntity.vue";

// Composables
export { useGame } from "./world/useGame";
export { useScene } from "./scene/useScene";
export { useEntity } from "./entity/useEntity";
export { useEcsComponent } from "./entity/useEcsComponent";
export { useSystem } from "./system/useSystem";
export { useQuery } from "./query/useQuery";
export { defineInputMap, useInput } from "./input/useInput";
export { usePool } from "./pool/usePool";

// ECS (for advanced users building custom systems)
export { createTransform, createSceneTag, PersistentTag, TRANSFORM_TYPE } from "./ecs/components";
export type { TransformStore } from "./ecs/components";

// Types
export type { GameContext } from "./world/types";
export type {
  SceneContext,
  SceneEnterContext,
  SceneExitContext,
  SceneEnterHook,
  SceneExitHook,
} from "./scene/types";
export type {
  EntityOptions,
  EntityContext,
  SlicedStore,
  SlicedComponents,
  InstancesOf,
} from "./entity/types";
export type { SystemFnWithEntities, SystemOptions, SystemParamsWithEntities } from "./system/types";
export type { Vec3, Quat, RigidBodyType, ComponentStore, ComponentFactory } from "./types";
export type { PoolInstance, PoolSlot } from "./pool/types";
export type {
  InputSources,
  InputMapFn,
  InputMapDefinition,
  InputResult,
  InputFn,
} from "./input/types";
