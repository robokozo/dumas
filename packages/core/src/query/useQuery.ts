import { query } from "bitecs";
import type { QueryResult, QueryTerm } from "bitecs";
import { useGame } from "../world/useGame";

export function useQuery({ components }: { components: Array<QueryTerm> }): {
  query: () => QueryResult;
} {
  const { world } = useGame();

  return {
    query: () => query(world, components),
  };
}
