import type { Ref } from "vue";

export interface InputSources {
  /** Reactive key state from useMagicKeys — access any key by name: keys.space, keys.a, etc. */
  keys: Record<string, Readonly<Ref<boolean>>>;
  /** First connected gamepad, or null if none is connected. */
  gamepad: Readonly<Ref<Gamepad | null>>;
}

export type InputMapFn = (sources: InputSources) => boolean | number;

export type InputMapDefinition = Record<string, InputMapFn>;

export interface InputResult<T extends InputMapDefinition> {
  /** Current raw value each frame — boolean or analog number. */
  held: { readonly [K in keyof T]: Readonly<Ref<boolean | number>> };
  /** True for exactly one frame when the action becomes active. */
  pressed: { readonly [K in keyof T]: Readonly<Ref<boolean>> };
  /** True for exactly one frame when the action becomes inactive. */
  released: { readonly [K in keyof T]: Readonly<Ref<boolean>> };
}

export type InputFn<T extends InputMapDefinition> = (
  params: { delta: number; elapsed: number } & InputResult<T>,
) => void;
