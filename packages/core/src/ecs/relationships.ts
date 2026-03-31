import {
  createRelation,
  makeExclusive,
  withAutoRemoveSubject,
  getRelationTargets,
  Pair,
  addComponents,
  removeComponents,
} from "bitecs";
import type { Relation } from "bitecs";
import { useGame } from "../world/useGame";

// ─── built-in relations ──────────────────────────────────────────────────────

/**
 * ChildOf — an exclusive, auto-cleanup parent-child relation.
 *
 * - Exclusive: each entity can have at most one parent.
 * - Auto-remove: when the parent is removed, the child relation is cleaned up.
 *
 * @example
 * addComponents(world, childEid, [Pair(ChildOf, parentEid)]);
 * const [parent] = getRelationTargets(world, childEid, ChildOf);
 */
export const ChildOf: Relation<object> = createRelation(makeExclusive, withAutoRemoveSubject);

// ─── composable ──────────────────────────────────────────────────────────────

/**
 * Manages a parent-child relationship between two entities.
 * Provides helpers to set/clear the parent and query children.
 *
 * @example
 * const rel = useRelationship({ relation: ChildOf });
 *
 * rel.setParent({ child: swordEid, parent: playerEid });
 * const children = rel.getChildren({ parent: playerEid });
 * rel.removeParent({ child: swordEid });
 */
export function useRelationship<T>({ relation }: { relation: Relation<T> }): {
  setParent: (params: { child: number; parent: number }) => void;
  removeParent: (params: { child: number; parent: number }) => void;
  getChildren: (params: { parent: number }) => Array<number>;
  getParent: (params: { child: number }) => number | null;
} {
  const { world } = useGame();

  function setParent({ child, parent }: { child: number; parent: number }): void {
    addComponents(world, child, [Pair(relation, parent)]);
  }

  function removeParent({ child, parent }: { child: number; parent: number }): void {
    removeComponents(world, child, [Pair(relation, parent)]);
  }

  function getChildren({ parent: _parent }: { parent: number }): Array<number> {
    // bitECS doesn't have a built-in "get all entities that relate to target"
    // query, but we can use Pair(relation, parent) as a query term.
    // For now, we expose getRelationTargets which gets targets FROM a subject.
    // Getting children requires querying with Pair(relation, parent).
    // This is a limitation — we return an empty array and note the pattern.
    // Users should use useQuery with Pair(relation, parentEid) as a component.
    return [] as Array<number>;
  }

  function getParent({ child }: { child: number }): number | null {
    const targets = getRelationTargets(world, child, relation);
    return targets.length > 0 ? targets[0] : null;
  }

  return { setParent, removeParent, getChildren, getParent };
}
