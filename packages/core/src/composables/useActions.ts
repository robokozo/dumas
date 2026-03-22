import { useInput } from "./useInput";
import { useActionMap } from "./useActionMap";
import type { InputOptions, ActionMapDefinition, ActionMapReturn } from "../types";

export function useActions<TActions extends string>(
  options: InputOptions & { actions: ActionMapDefinition<TActions> },
): ActionMapReturn<TActions> {
  const input = useInput(options);
  return useActionMap(input, options.actions);
}
