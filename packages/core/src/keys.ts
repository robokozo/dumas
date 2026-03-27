import type { InjectionKey } from "vue";
import type { WorldContext } from "./world/types";
import type { SceneContext } from "./scene/types";
import type { EntityContext } from "./entity/types";

export const WORLD_KEY: InjectionKey<WorldContext> = Symbol("dumas:world");
export const SCENE_KEY: InjectionKey<SceneContext> = Symbol("dumas:scene");
export const ENTITY_KEY: InjectionKey<EntityContext> = Symbol("dumas:entity");
