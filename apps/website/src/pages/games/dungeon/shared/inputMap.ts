import { defineInputMap } from "@dumas/core";

export const DUNGEON_INPUT = defineInputMap({
  moveUp: ({ keys, gamepad }) =>
    keys.w.value || keys.ArrowUp.value || (gamepad.value?.axes[1] ?? 0) < -0.2,
  moveDown: ({ keys, gamepad }) =>
    keys.s.value || keys.ArrowDown.value || (gamepad.value?.axes[1] ?? 0) > 0.2,
  moveLeft: ({ keys, gamepad }) =>
    keys.a.value || keys.ArrowLeft.value || (gamepad.value?.axes[0] ?? 0) < -0.2,
  moveRight: ({ keys, gamepad }) =>
    keys.d.value || keys.ArrowRight.value || (gamepad.value?.axes[0] ?? 0) > 0.2,
});
