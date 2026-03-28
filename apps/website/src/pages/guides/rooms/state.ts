import { shallowRef } from "vue";
import type { EntryPoint } from "./types";

// Shared across all room components — tracks which side of the room the
// player entered from so each scene can position the character at the door.
export const entryPoint = shallowRef<EntryPoint>("center");
