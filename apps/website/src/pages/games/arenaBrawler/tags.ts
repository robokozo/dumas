import { defineTag } from "@dumas/core";

/** Marks an entity as the player character. */
export const PlayerTag = defineTag();

/** Marks an entity as an enemy character. */
export const EnemyTag = defineTag();

/** Marks an entity as the player's weapon. */
export const WeaponTag = defineTag();
