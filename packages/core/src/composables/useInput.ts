import { shallowRef, readonly } from "vue";
import { useEventListener, useRafFn, useGamepad } from "@vueuse/core";

import type { HardwareButton, InputOptions, InputReturn, StickState, TriggerState } from "../types";

// W3C standard gamepad button index → HardwareButton
// https://www.w3.org/TR/gamepad/#dfn-standard-gamepad
const STANDARD_GAMEPAD_MAP: Record<number, HardwareButton> = {
  0: "south",
  1: "east",
  2: "west",
  3: "north",
  4: "lb",
  5: "rb",
  6: "lt",
  7: "rt",
  8: "select",
  9: "start",
  10: "l3",
  11: "r3",
  12: "dpadUp",
  13: "dpadDown",
  14: "dpadLeft",
  15: "dpadRight",
};

// Analog triggers report as buttons with a value in [0, 1]
const ANALOG_THRESHOLD = 0.2;

// Deadzone for analog sticks — values within this range are treated as zero
const STICK_DEADZONE = 0.1;

function applyDeadzone(value: number): number {
  return Math.abs(value) < STICK_DEADZONE ? 0 : value;
}

export function useInput(options: InputOptions): InputReturn {
  const heldButtons = new Set<HardwareButton>();
  const justPressedButtons = new Set<HardwareButton>();
  const prevHeldButtons = new Set<HardwareButton>();

  const leftStick = shallowRef<StickState>({ x: 0, y: 0 });
  const rightStick = shallowRef<StickState>({ x: 0, y: 0 });
  const triggers = shallowRef<TriggerState>({ left: 0, right: 0 });

  function updateJustPressed(): void {
    justPressedButtons.clear();
    for (const btn of heldButtons) {
      if (prevHeldButtons.has(btn) === false) {
        justPressedButtons.add(btn);
      }
    }
    prevHeldButtons.clear();
    for (const btn of heldButtons) {
      prevHeldButtons.add(btn);
    }
  }

  if (options.source === "keyboard") {
    const { bindings } = options;

    // Reverse map: KeyboardEvent.code → HardwareButton
    const keyToButton = new Map<string, HardwareButton>();
    for (const [button, keys] of Object.entries(bindings) as Array<
      [HardwareButton, Array<string>]
    >) {
      for (const key of keys) {
        keyToButton.set(key, button);
      }
    }

    const pressedKeys = new Set<string>();

    useEventListener(window, "keydown", (e: KeyboardEvent) => {
      pressedKeys.add(e.code);
    });

    useEventListener(window, "keyup", (e: KeyboardEvent) => {
      pressedKeys.delete(e.code);
    });

    useRafFn(() => {
      heldButtons.clear();
      for (const key of pressedKeys) {
        const btn = keyToButton.get(key);
        if (btn !== undefined) {
          heldButtons.add(btn);
        }
      }

      // Derive leftStick from dpad buttons, normalized for diagonals
      let lx = 0;
      let ly = 0;
      if (heldButtons.has("dpadLeft")) lx -= 1;
      if (heldButtons.has("dpadRight")) lx += 1;
      if (heldButtons.has("dpadUp")) ly += 1;
      if (heldButtons.has("dpadDown")) ly -= 1;
      const lLen = Math.sqrt(lx * lx + ly * ly);
      leftStick.value = lLen > 0 ? { x: lx / lLen, y: ly / lLen } : { x: 0, y: 0 };

      updateJustPressed();
    });
  } else {
    const { index } = options.source;
    // useGamepad handles connection events, isSupported checks, and rAF polling
    const { gamepads, isSupported } = useGamepad();

    useRafFn(() => {
      heldButtons.clear();

      if (isSupported.value === false) {
        updateJustPressed();
        return;
      }

      const gamepad = gamepads.value[index] ?? null;

      if (gamepad === null) {
        leftStick.value = { x: 0, y: 0 };
        rightStick.value = { x: 0, y: 0 };
        triggers.value = { left: 0, right: 0 };
        updateJustPressed();
        return;
      }

      for (const [indexStr, button] of Object.entries(STANDARD_GAMEPAD_MAP)) {
        const gpButton = gamepad.buttons[Number(indexStr)];
        if (gpButton === undefined) continue;
        if (gpButton.pressed === true || gpButton.value > ANALOG_THRESHOLD) {
          heldButtons.add(button);
        }
      }

      const ltValue = gamepad.buttons[6]?.value ?? 0;
      const rtValue = gamepad.buttons[7]?.value ?? 0;
      triggers.value = { left: ltValue, right: rtValue };

      // Invert Y so positive = up (browser reports -1 for up)
      leftStick.value = {
        x: applyDeadzone(gamepad.axes[0] ?? 0),
        y: applyDeadzone(-(gamepad.axes[1] ?? 0)),
      };
      rightStick.value = {
        x: applyDeadzone(gamepad.axes[2] ?? 0),
        y: applyDeadzone(-(gamepad.axes[3] ?? 0)),
      };

      updateJustPressed();
    });
  }

  return {
    isHeld: (button) => heldButtons.has(button),
    wasJustPressed: (button) => justPressedButtons.has(button),
    leftStick: readonly(leftStick),
    rightStick: readonly(rightStick),
    triggers: readonly(triggers),
  };
}
