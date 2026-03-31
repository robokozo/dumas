/**
 * Rapier encodes collision groups as a 32-bit integer: lower 16 bits are
 * membership (what group this collider belongs to) and upper 16 bits are the
 * filter mask (which groups it can interact with).
 */
export function encodeCollisionGroups({
  membership,
  filter,
}: {
  membership: number;
  filter: number;
}): number {
  return ((filter & 0xffff) << 16) | (membership & 0xffff);
}

/**
 * Define named collision groups from a list of names. Each name gets a
 * unique power-of-two bit flag, up to 16 groups.
 *
 * Use the returned constants in createXCollider({ membership, filter }) to
 * control which bodies interact.
 *
 * @example
 * const Groups = defineCollisionGroups(['world', 'player', 'enemy', 'projectile'])
 * // Groups.world === 1, Groups.player === 2, Groups.enemy === 4, Groups.projectile === 8
 *
 * createCuboidCollider({
 *   halfExtents: [0.5, 0.5, 0.5],
 *   membership: Groups.projectile,
 *   filter: Groups.world | Groups.enemy,   // ignores player + other projectiles
 * })
 */
export function defineCollisionGroups<T extends string>(names: Array<T>): Record<T, number> {
  if (names.length > 16) {
    throw new Error("[dumas] defineCollisionGroups: maximum 16 groups (Rapier limit).");
  }
  const result = {} as Record<T, number>;
  for (let i = 0; i < names.length; i++) {
    result[names[i]] = 1 << i;
  }
  return result;
}
