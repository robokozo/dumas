import { inject } from "vue";
import { GAME_KEY } from "../keys";
import type { GameContext } from "./types";

export function useGame(): GameContext {
  const ctx = inject(GAME_KEY);
  if (ctx === undefined) {
    throw new Error("[dumas] useGame() must be called inside a <Game> component.");
  }
  return ctx;
}
