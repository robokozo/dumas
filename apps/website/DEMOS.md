# Demo Rebuild Checklist

- [ ] **World Setup** (`/guides/world-setup`)
  - Static colored meshes at various positions/rotations/scales inside a TresCanvas
  - No physics — just scene composition

- [ ] **Rigid Bodies** (`/guides/rigid-body`)
  - Dynamic ball falling under gravity (blue sphere)
  - Fixed ground platform (gray box)
  - KinematicPositionBased sphere oscillating horizontally (`Math.sin(elapsed) * 3`)
  - Key: `<RigidBody type="...">` with nested mesh + collider

- [ ] **Colliders** (`/guides/colliders`)
  - Three falling objects: box (restitution 0.3), sphere (restitution 0.9), capsule (restitution 0.5)
  - Fixed ground with friction 0.8
  - Key: `<CuboidCollider>`, `<BallCollider>`, `<CapsuleCollider>`

- [ ] **Collision Events** (`/guides/collision-events`)
  - Ball in zero-gravity bouncing between two walls
  - Ball color changes on each wall hit (red = left, blue = right)
  - Minimum speed enforced at 6 m/s
  - Key: `@collision-enter` / `@collision-exit` on `<RigidBody>`

- [ ] **Custom Systems** (`/guides/custom-systems`)
  - Pink box spinning at 1 rad/s, bobbing with `2 + Math.sin(elapsed * 2) * 0.5`
  - No physics — pure per-frame logic via `useLoop().onBeforeRender()`

- [ ] **Joints** (`/guides/joints`)
  - Fixed anchor sphere at (0, 5, 0) with sensor collider
  - Dynamic blue sphere connected via spherical joint, swings under gravity
  - Key: `useRapier()` world + `JointData.spherical()`

- [ ] **Object Pooling** (`/guides/object-pooling`)
  - 5 pre-allocated sphere bodies; spawn button calls `acquire()`, released when y < -10
  - Key: imperative `useRapier()` body creation/enable/disable

- [ ] **Player Input** (`/guides/player-input`)
  - Two capsule characters: Player 1 (keyboard WASD+Space), Player 2 (gamepad)
  - Key: keyboard/gamepad events + KinematicCharacterController via `useRapier()`

- [ ] **Character Controller** (`/guides/character-controller`)
  - Capsule character on scene with ground, ramp (-30° slope), elevated platform
  - A/D/arrows to move, Space/W/Up to jump; blue when grounded, pink when airborne
  - Key: KinematicCharacterController from `useRapier()` world

- [ ] **3D Models** (`/guides/3d-models`)
  - Mage.glb + Knight.glb with Idle animation via `useGLTF` + `useAnimations`
  - No physics
  - Key: `useGLTF`, `useAnimations`, `<Suspense>`
