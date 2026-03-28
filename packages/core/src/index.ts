// Components
export { default as Game } from "./world/Game.vue";
export { default as Scene } from "./scene/Scene.vue";
export { default as Entity } from "./entity/Entity.vue";
export { default as SpawnPoint } from "./entity/SpawnPoint.vue";

// Composables
export { useGame } from "./world/useGame";
export { useScene } from "./scene/useScene";
export { useEntity } from "./entity/useEntity";
export { useEcsComponent } from "./entity/useEcsComponent";
export { useSystem } from "./system/useSystem";
export { useQuery } from "./query/useQuery";

// ECS (for advanced users building custom systems)
export { createTransform, createSceneTag, PersistentTag, SpawnPointTag } from "./ecs/components";
export type { TransformStore } from "./ecs/components";

// Types
export type { GameContext } from "./world/types";
export type {
  SceneContext,
  SceneEnterContext,
  SceneExitContext,
  SceneEnterHook,
  SceneExitHook,
  LoadSceneOptions,
  SpawnPointRecord,
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
