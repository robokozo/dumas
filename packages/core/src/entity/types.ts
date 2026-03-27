export interface EntityOptions {
  /**
   * If true, this entity survives scene transitions instead of being
   * destroyed when the owning scene unloads.
   * @default false
   */
  persistent?: boolean;
}

export interface EntityContext {
  /** The bitECS entity ID. Stable for the full lifetime of the entity. */
  eid: number;
  /** Whether this entity persists across scene transitions. */
  isPersistent: boolean;
}
