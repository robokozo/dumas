import type { InjectionKey } from "vue";
import type { GameContext } from "./world/types";
import type { SceneContext } from "./scene/types";

export const GAME_KEY: InjectionKey<GameContext> = Symbol("dumas:game");
export const SCENE_KEY: InjectionKey<SceneContext> = Symbol("dumas:scene");
