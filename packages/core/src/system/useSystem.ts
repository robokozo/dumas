import { useLoop } from "@tresjs/core";
import { useGame } from "../world/useGame";
import type { ComponentStore } from "../types";
import type { SystemFnWithEntities, SystemOptions } from "./types";
import { useQuery } from "../query/useQuery";

export function useSystem({
  components,
  fn,
  options,
}: {
  components: Array<ComponentStore>;
  fn: SystemFnWithEntities;
  options?: SystemOptions;
}): {} {
  const { world } = useGame();
  const { onBeforeRender } = useLoop();

  const { query } = useQuery({ components });

  onBeforeRender(({ delta, elapsed }) => {
    const entities = query();
    fn({ delta, elapsed, world: world, entities });
  }, options?.priority);

  return {};
}
