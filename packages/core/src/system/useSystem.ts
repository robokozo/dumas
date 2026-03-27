import { useLoop } from "@tresjs/core";
import { useWorld } from "../world/useWorld";
import type { SystemFn, SystemOptions } from "./types";

export function useSystem({ fn, options }: { fn: SystemFn; options?: SystemOptions }): {} {
  const { ecsWorld } = useWorld();
  const { onBeforeRender } = useLoop();

  onBeforeRender(({ delta, elapsed }) => {
    fn({ delta, elapsed, world: ecsWorld });
  }, options?.priority);

  return {};
}
