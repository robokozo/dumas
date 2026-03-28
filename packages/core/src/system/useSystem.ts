import { query } from "bitecs";
import type { QueryTerm } from "bitecs";
import { useLoop } from "@tresjs/core";
import { useWorld } from "../world/useWorld";
import type { SystemFn, SystemFnWithEntities, SystemOptions } from "./types";

interface WithComponents {
  components: Array<QueryTerm>;
  fn: SystemFnWithEntities;
  options?: SystemOptions;
}

interface WithoutComponents {
  components?: never;
  fn: SystemFn;
  options?: SystemOptions;
}

function hasComponents(params: WithComponents | WithoutComponents): params is WithComponents {
  return params.components !== undefined;
}

export function useSystem(params: WithComponents): {};
export function useSystem(params: WithoutComponents): {};
export function useSystem(params: WithComponents | WithoutComponents): {} {
  const { ecsWorld } = useWorld();
  const { onBeforeRender } = useLoop();

  if (hasComponents(params)) {
    onBeforeRender(({ delta, elapsed }) => {
      const entities = query(ecsWorld, params.components);
      params.fn({ delta, elapsed, world: ecsWorld, entities });
    }, params.options?.priority);
  } else {
    onBeforeRender(({ delta, elapsed }) => {
      params.fn({ delta, elapsed, world: ecsWorld });
    }, params.options?.priority);
  }

  return {};
}
