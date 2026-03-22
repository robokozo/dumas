import type { InjectionKey } from "vue";
import type { DumasContext } from "./types";

export const DUMAS_CONTEXT_KEY: InjectionKey<DumasContext> = Symbol("dumas:context");
export const GAME_OBJECT_EID_KEY: InjectionKey<number> = Symbol("dumas:eid");
