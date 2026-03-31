# Dumas — TODO

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

---

## Relationships

Expose bitECS's built-in relationship system (`Hierarchy`, `Cascade`) through engine-level abstractions. Enables typed parent-child links between entities — useful for scene graphs, equipment slots, projectile ownership, and anything that needs structured entity-to-entity references beyond shared components.

---

## Prefabs

A `definePrefab` factory that captures a set of components and default values as a reusable template. Calling `spawnPrefab(world, EnemyPrefab)` creates a new entity with all components pre-attached and initialized — eliminates repetitive `addEntity` + `useEcsComponent` wiring at every spawn site.
