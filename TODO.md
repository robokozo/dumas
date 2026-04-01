# Dumas — TODO

## Known limitation: overlay slot provide/inject

`Scene.vue` extracts the `#overlay` slot function via `registerOverlay` and re-mounts it under `Game.vue`'s `ActiveSceneOverlay` component. This severs the Vue component tree — overlay content cannot `inject` from its defining scene's ancestors. `<Teleport>` cannot be used because TresCanvas uses a custom Vue renderer that doesn't support it. Components must pass context via props or refs instead.

---

## Remaining

### Games

- **General:** most demos need to be zoomed out more; consider orbit controls for basic guides
