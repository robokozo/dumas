import { useLoop } from "@tresjs/core";
import { useWorld } from "../world/useWorld";
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
  const { ecsWorld } = useWorld();
  const { onBeforeRender } = useLoop();

  const { query } = useQuery({ components });

  onBeforeRender(({ delta, elapsed }) => {
    const entities = query();
    fn({ delta, elapsed, world: ecsWorld, entities });
  }, options?.priority);

  return {};
}
