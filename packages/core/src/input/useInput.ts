import { computed, shallowRef } from "vue";
import type { Ref, ShallowRef } from "vue";
import { useMagicKeys, useGamepad } from "@vueuse/core";
import { useLoop } from "@tresjs/core";
import type { InputMapDefinition, InputResult, InputSources, InputFn } from "./types";

// Analog inputs are considered "held" once they exceed this deadzone.
const ANALOG_THRESHOLD = 0.1;

/**
 * Define a typed input map outside any component.
 * Pass the result to useInput() wherever you need to read actions.
 */
export function defineInputMap<T extends InputMapDefinition>(map: T): T {
  return map;
}

/**
 * Reads input from keyboard and gamepad, mapped to named game actions.
 * Must be called inside a component that is a descendant of <TresCanvas>
 * (i.e. inside a <Scene>), the same requirement as useSystem().
 */
export function useInput<T extends InputMapDefinition>({
  map,
  fn,
}: {
  map: T;
  fn?: InputFn<T>;
}): InputResult<T> {
  const keys = useMagicKeys() as Record<string, Readonly<Ref<boolean>>>;
  const { gamepads } = useGamepad();
  const { onBeforeRender } = useLoop();

  const sources: InputSources = {
    keys,
    gamepad: computed(() => gamepads.value[0] ?? null),
  };

  const held: Record<string, Ref<boolean | number>> = {};
  const pressed: Record<string, ShallowRef<boolean>> = {};
  const released: Record<string, ShallowRef<boolean>> = {};
  const previous: Record<string, boolean> = {};

  for (const action of Object.keys(map)) {
    held[action] = computed(() => map[action](sources));
    pressed[action] = shallowRef(false);
    released[action] = shallowRef(false);
    previous[action] = false;
  }

  const result = { held, pressed, released } as unknown as InputResult<T>;

  onBeforeRender(({ delta, elapsed }) => {
    for (const action of Object.keys(map)) {
      const raw = held[action].value;
      const isHeld = typeof raw === "number" ? Math.abs(raw) > ANALOG_THRESHOLD : raw === true;
      const wasHeld = previous[action];

      pressed[action].value = !wasHeld && isHeld;
      released[action].value = wasHeld && !isHeld;
      previous[action] = isHeld;
    }

    if (fn !== undefined) {
      fn({ delta, elapsed, ...result });
    }
  });

  return result;
}
