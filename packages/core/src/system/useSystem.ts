import { useLoop } from "@tresjs/core";
import type { SystemFn, SystemOptions } from "./types";

export function useSystem({ fn, options }: { fn: SystemFn; options?: SystemOptions }): void {
  const { onBeforeRender } = useLoop();

  onBeforeRender(({ delta, elapsed }) => {
    fn({ delta, elapsed });
  }, options?.priority);
}
