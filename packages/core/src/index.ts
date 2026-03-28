// Components
export { default as World } from "./world/World.vue";
export { default as Scene } from "./scene/Scene.vue";
export { default as Entity } from "./entity/Entity.vue";
export { default as SpawnPoint } from "./entity/SpawnPoint.vue";

// Composables
export { useWorld } from "./world/useWorld";
export { useScene } from "./scene/useScene";
export { useEntity } from "./entity/useEntity";
export { useEntityContext } from "./entity/useEntityContext";
export { useEcsComponent } from "./entity/useEcsComponent";
export { useSystem } from "./system/useSystem";
export { useQuery } from "./query/useQuery";

// ECS (for advanced users building custom systems)
export { Transform, PersistentTag, SceneTag, SpawnPointTag } from "./ecs/components";

// Types
export type { WorldContext, WorldOptions } from "./world/types";
export type {
  SceneContext,
  SceneEnterContext,
  SceneExitContext,
  SceneEnterHook,
  SceneExitHook,
  LoadSceneOptions,
  SpawnPointRecord,
} from "./scene/types";
export type { EntityOptions, EntityContext, SlicedStore, SlicedComponents } from "./entity/types";
export type { SystemFnWithEntities, SystemOptions, SystemParamsWithEntities } from "./system/types";
export type { Vec3, Quat, RigidBodyType, ComponentStore } from "./types";
