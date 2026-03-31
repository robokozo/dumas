import { onUnmounted } from "vue";
import { useGame } from "../world/useGame";
import type { ComponentStore } from "../types";
import type { SystemFnWithEntities, SystemOptions } from "./types";
import { useQuery } from "../query/useQuery";

export function useSystem({
  components,
  fn,
  options,
}: {
  components?: Array<ComponentStore>;
  fn: SystemFnWithEntities;
  options?: SystemOptions;
}): {} {
  const { world, registerSystem } = useGame();
  const { query } = useQuery({ components: components ?? [] });

  const off = registerSystem({
    fn: (delta, elapsed) => {
      const entities = query();
      fn({ delta, elapsed, world, entities });
    },
    priority: options?.priority,
  });

  onUnmounted(off);

  return {};
}
