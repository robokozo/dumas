<script setup lang="ts">
import UseCharacterControllerGame from "./UseCharacterControllerGame.vue";
import GuideLayout from "../../../components/GuideLayout.vue";
import CodeBlock from "../../../components/CodeBlock.vue";
import sceneSource from "./UseCharacterControllerScene.vue?raw";

const CREATE_CONTROLLER = `const controller = useCharacterController({
  offset: 0.01,        // skin width to prevent tunnelling
  maxSlopeAngle: 45,   // degrees — steeper slopes block movement
  stepHeight: 0.3,     // auto-climb steps up to this height
  snapToGround: 0.2,   // snap down to ground within this distance
});`;

const FULL_PATTERN = `// 1. Create a kinematicPositionBased entity with a capsule collider
const { eid: playerEid } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "kinematicPositionBased",
      colliders: {
        body: createCapsuleCollider({ halfHeight: 0.4, radius: 0.3 }),
      },
    }),
  },
});

// 2. Create the character controller
const controller = useCharacterController({
  offset: 0.01,
  maxSlopeAngle: 45,
  stepHeight: 0.3,
  snapToGround: 0.2,
});

// 3. Track vertical velocity for gravity
let velocityY = 0;
const GRAVITY = -20;
const JUMP_FORCE = 8;
const MOVE_SPEED = 5;

const gameCtx = useGame();

// 4. Use input + system to drive movement each frame
useInput({
  map: INPUT_MAP,
  fn: ({ delta, held, pressed }) => {
    let moveX = 0;
    let moveZ = 0;
    if (held.forward.value === true) moveZ -= 1;
    if (held.backward.value === true) moveZ += 1;
    if (held.left.value === true) moveX -= 1;
    if (held.right.value === true) moveX += 1;

    // Apply gravity manually
    velocityY += GRAVITY * delta;

    // Jump when grounded
    if (pressed.jump.value === true && controller.isGrounded === true) {
      velocityY = JUMP_FORCE;
    }

    // controller.move() computes corrected movement against obstacles
    const movement = controller.move({
      eid: playerEid,
      velocity: { x: moveX * MOVE_SPEED, y: velocityY, z: moveZ * MOVE_SPEED },
      delta,
      colliderName: "body",
    });

    // Reset vertical velocity when grounded
    if (controller.isGrounded === true && velocityY < 0) {
      velocityY = 0;
    }

    // Apply the corrected movement via setNextKinematicTranslation
    const physStore = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
    if (physStore !== undefined) {
      const body = physStore.body[playerEid];
      if (body !== undefined) {
        const pos = body.translation();
        body.setNextKinematicTranslation({
          x: pos.x + movement.x,
          y: pos.y + movement.y,
          z: pos.z + movement.z,
        });
      }
    }
  },
});`;
</script>

<template>
  <GuideLayout>
    <template #demo>
      <UseCharacterControllerGame />
    </template>

    <h1>Character Controller</h1>
    <p>
      <code>useCharacterController</code> wraps Rapier's
      <code>KinematicCharacterController</code> to provide automatic step climbing, slope angle
      limits, snap-to-ground, and slide-along-walls for kinematic character movement. The character
      body must use <code>kinematicPositionBased</code> type.
    </p>

    <h2>Create a controller</h2>
    <p>
      Call <code>useCharacterController</code> inside a component where
      <code>usePhysics()</code> has been initialized. The controller is created when the Rapier
      world becomes available and automatically freed on unmount.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="CREATE_CONTROLLER" />
    </div>

    <h2>Movement pattern</h2>
    <p>
      Each frame, compute a desired velocity from input and gravity, then call
      <code>controller.move()</code>. It returns the corrected translation delta after resolving
      collisions with obstacles. Apply that delta to the body via
      <code>setNextKinematicTranslation</code>. After <code>move()</code>,
      <code>controller.isGrounded</code> tells you whether the character is standing on a surface.
    </p>
    <div class="code-wrap">
      <CodeBlock lang="ts" :code="FULL_PATTERN" />
    </div>

    <h2>Options</h2>
    <ul>
      <li><code>offset</code> — skin width to prevent tunnelling (default: <code>0.01</code>)</li>
      <li>
        <code>maxSlopeAngle</code> — maximum climbable slope in degrees (default: <code>45</code>)
      </li>
      <li>
        <code>stepHeight</code> — auto-climb steps up to this height; <code>null</code> to disable
      </li>
      <li>
        <code>snapToGround</code> — snap down within this distance; <code>null</code> to disable
      </li>
      <li>
        <code>applyImpulses</code> — push dynamic bodies the character hits (default:
        <code>true</code>)
      </li>
      <li>
        <code>characterMass</code> — custom mass for impulse resolution; <code>null</code> for
        default
      </li>
    </ul>

    <h2>Demo source</h2>
    <div class="code-wrap">
      <CodeBlock :code="sceneSource" lang="vue" />
    </div>
  </GuideLayout>
</template>
