import { query } from "bitecs";
import type { QueryResult, QueryTerm } from "bitecs";
import { useWorld } from "../world/useWorld";

export function useQuery({ components }: { components: Array<QueryTerm> }): {
  query: () => QueryResult;
} {
  const { ecsWorld } = useWorld();

  return {
    query: () => query(ecsWorld, components),
  };
}
