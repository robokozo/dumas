# Dumas — TODO

Ordered by priority — foundational primitives first, then features that build on them.

---

## Fix overlay slot `provide`/`inject` chain

`Scene.vue` extracts the `#overlay` slot function via `registerOverlay` and re-mounts it under `Game.vue`'s `ActiveSceneOverlay` component. This severs the Vue component tree — overlay content cannot `inject` from its defining scene's ancestors. The adventure game hit this as a runtime error and had to work around it by passing context as a prop.

---

## Transform rotation helpers

Transform rotation is raw quaternion fields (`rotX`, `rotY`, `rotZ`, `rotW`). Every rotation requires manual `sin(halfAngle)` / `cos(halfAngle)` math, which already caused a "character explodes in size" bug during development. Add helpers on the sliced transform:

```ts
transform.setRotationY({ angle: Math.atan2(nx, nz) });
transform.setEuler({ x: 0, y: heading, z: 0 });
transform.lookAt({ x: targetX, z: targetZ });
```

---

## Simplify per-entity frame callbacks

`useSystem({ components: [], fn })` is the current workaround for "run this function every frame for one entity." The `components: []` is meaningless — the system doesn't query an archetype. Allow `useSystem({ fn })` without the components field, or add a dedicated `useFrameCallback(fn)` for the single-entity case.

---

## Tags (`defineTag`)

Expose a `defineTag()` convenience that returns a `ComponentFactory` with no store fields. bitECS supports this natively — Dumas just needs to surface it. Used for archetype filtering in queries, trigger zones, and collision filters.

```ts
const PlayerTag = defineTag();
const EnemyTag = defineTag();
const InteractableTag = defineTag();
```

---

## Entity references (`useEntityRef`)

A composable that gives reactive, sliced access to an existing entity's components — the read-only counterpart to `useEcsComponent`. Currently game code has to manually dig into `storeRegistry.get(TRANSFORM_TYPE)` and index by eid. `useEntityRef` formalizes that pattern.

`eid` should accept `Ref<number | null>` so it works when the target entity hasn't spawned yet.

```ts
const player = useEntityRef({
  eid: playerEid,
  components: { physics: createPhysics },
});

player.transform.posX.value; // sliced, reactive
player.has(PlayerTag); // component check
```

---

## Trigger zones (non-physics proximity)

A `TriggerZone` component + system that handles distance-based enter/exit callbacks without requiring a Rapier physics world. The system queries all entities with `TriggerZoneStore` + `TransformStore`, checks distances against entities matching a target archetype (e.g. `PlayerTag`), and fires callbacks. Depends on `defineTag` and `useEntityRef`.

```ts
useEcsComponent({
  components: {
    trigger: createTriggerZone({
      radius: 1.8,
      target: [PlayerTag],
      onEnter({ targetEid }) {
        showPrompt();
      },
      onExit({ targetEid }) {
        hidePrompt();
      },
    }),
  },
});
```

---

## Pointer / touch input

`useInput` covers keyboard and gamepad but not pointer or touch. Games need click-to-move, drag, and touch buttons. A `usePointer` composable covering screen-space position, world-space raycasting against entities, and press/release state would fill the gap.

---

## World-to-screen UI positioning

No built-in way for an entity to render DOM content in the overlay positioned relative to its 3D location. A `useWorldToScreen({ eid })` composable that returns reactive screen coordinates, or a `<DumasOverlay :eid="eid">` component, would cover health bars, name tags, interaction prompts, and damage numbers.

```ts
const { x, y, isVisible } = useWorldToScreen({ eid });
```

```vue
<DumasOverlay :eid="eid">
  <div class="health-bar">{{ health.value }}</div>
</DumasOverlay>
```

---

## Prefabs

A `definePrefab` factory that captures a set of components and default values as a reusable template. Calling `spawnPrefab(world, EnemyPrefab)` creates a new entity with all components pre-attached and initialized — eliminates repetitive `addEntity` + `useEcsComponent` wiring at every spawn site.

---

## Relationships

Expose bitECS's built-in relationship system (`Hierarchy`, `Cascade`) through engine-level abstractions. Enables typed parent-child links between entities — useful for scene graphs, equipment slots, projectile ownership, and anything that needs structured entity-to-entity references beyond shared components.

---

## Character controller

Wrap Rapier's built-in kinematic character controller (`KinematicCharacterController`) in a `useCharacterController` composable. Handles step climbing, slope limits, snap-to-ground, and slide-along-walls automatically — eliminates the manual overlap-correction loop most physics-driven characters need.

**Scenario:** a third-person player that runs, jumps, and lands cleanly without clipping through ramps or getting stuck on stairs.

```ts
const controller = useCharacterController({
  offset: 0.01, // skin width — prevents tunnelling
  maxSlopeAngle: 45, // degrees — steeper slopes block movement
  stepHeight: 0.3, // auto-climb steps up to 30 cm
  snapToGround: 0.2, // snap down to ground within 20 cm
});

useInput({
  map: INPUT_MAP,
  fn: ({ delta, held }) => {
    const wishDir = getWishDirection(held);

    if (controller.isGrounded && pressed.jump) {
      velocity.y = JUMP_FORCE;
    }

    velocity.y += GRAVITY * delta;

    controller.move({
      velocity: { x: wishDir.x * SPEED, y: velocity.y, z: wishDir.z * SPEED },
      delta,
    });
  },
});
```

---

## Joints / constraints

A `useJoint` composable covering Rapier's joint types: fixed, revolute (hinge), prismatic (slide), and spring. Connects two rigid-body entities with typed options for limits and motor drives. Needed for doors, vehicles, pendulums, ragdolls, and any interactive mechanism that links bodies together.

**Scenario:** a heavy dungeon door that swings open when the player pulls a lever, then slowly swings shut under gravity.

```ts
// Hinge the door to the frame along the Y axis:
const hinge = useJoint({
  type: "revolute",
  bodyA: doorFrameEid,
  bodyB: doorEid,
  axis: { x: 0, y: 1, z: 0 },
  limits: { min: 0, max: Math.PI * 0.75 }, // 0–135°
});

// When the lever fires:
function onLeverPulled() {
  hinge.setMotor({ targetVelocity: 1.5, maxForce: 200 }); // swing open
}

// After a delay, let gravity close it:
function onLeverReleased() {
  hinge.setMotor({ targetVelocity: 0, maxForce: 0 }); // free-swing shut
}
```
