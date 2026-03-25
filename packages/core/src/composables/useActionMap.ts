import type { InputReturn, ActionMapDefinition, ActionMapReturn, StickState } from "../types";

const ZERO_STICK: StickState = { x: 0, y: 0 };

export function useActionMap<TActions extends string>(
  input: InputReturn,
  actions: ActionMapDefinition<TActions>,
): ActionMapReturn<TActions> {
  function isHeld(action: TActions): boolean {
    const source = actions[action];
    if (source === "leftStick" || source === "rightStick") return false;
    return source.some((btn) => input.isHeld(btn));
  }

  function wasJustPressed(action: TActions): boolean {
    const source = actions[action];
    if (source === "leftStick" || source === "rightStick") return false;
    return source.some((btn) => input.wasJustPressed(btn));
  }

  function wasJustReleased(action: TActions): boolean {
    const source = actions[action];
    if (source === "leftStick" || source === "rightStick") return false;
    return source.some((btn) => input.wasJustReleased(btn));
  }

  function axis(action: TActions): StickState {
    const source = actions[action];
    if (source === "leftStick") return input.leftStick.value;
    if (source === "rightStick") return input.rightStick.value;
    return ZERO_STICK;
  }

  return { isHeld, wasJustPressed, wasJustReleased, axis };
}
