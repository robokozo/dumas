<script setup lang="ts">
import { shallowRef } from "vue";
import {
  Scene,
  DumasEntity,
  useEcsComponent,
  usePhysics,
  useSystem,
  useCharacterController,
  useGame,
  createPhysics,
  createCuboidCollider,
  createCapsuleCollider,
  defineInputMap,
  useInput,
  PHYSICS_TYPE,
} from "@dumas/core";
import type { PhysicsStore } from "@dumas/core";

const MOVE_SPEED = 5;
const GRAVITY = -20;
const JUMP_FORCE = 8;

// ─── input ──────────────────────────────────────────────────────────────────

const INPUT_MAP = defineInputMap({
  forward: ({ keys }) => keys.w?.value === true || keys.arrowup?.value === true,
  backward: ({ keys }) => keys.s?.value === true || keys.arrowdown?.value === true,
  left: ({ keys }) => keys.a?.value === true || keys.arrowleft?.value === true,
  right: ({ keys }) => keys.d?.value === true || keys.arrowright?.value === true,
  jump: ({ keys }) => keys.space?.value === true,
});

// ─── physics world ──────────────────────────────────────────────────────────

usePhysics({ gravity: [0, -9.81, 0] });

const gameCtx = useGame();

// ─── character entity (kinematicPositionBased capsule) ───────────────────────

const { eid: playerEid, transform: playerTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "kinematicPositionBased",
      colliders: {
        body: createCapsuleCollider({ halfHeight: 0.4, radius: 0.3 }),
      },
    }),
  },
});

playerTransform.posX.value = 0;
playerTransform.posY.value = 2;
playerTransform.posZ.value = 0;

// ─── ground (fixed) ─────────────────────────────────────────────────────────

useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        ground: createCuboidCollider({ halfExtents: [10, 0.1, 10] }),
      },
    }),
  },
});

// ─── ramp (fixed, angled box) ───────────────────────────────────────────────

const { transform: rampTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        ramp: createCuboidCollider({ halfExtents: [1.5, 0.1, 2] }),
      },
    }),
  },
});

rampTransform.posX.value = 4;
rampTransform.posY.value = 0.6;
rampTransform.posZ.value = -3;
// Tilt ~20 degrees around Z axis
rampTransform.setEuler({ z: (-20 * Math.PI) / 180 });

// ─── step (small box on ground) ─────────────────────────────────────────────

const { transform: stepTransform } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        step: createCuboidCollider({ halfExtents: [1, 0.15, 1] }),
      },
    }),
  },
});

stepTransform.posX.value = -3;
stepTransform.posY.value = 0.15;
stepTransform.posZ.value = -3;

// ─── character controller ───────────────────────────────────────────────────

const controller = useCharacterController({
  offset: 0.01,
  maxSlopeAngle: 45,
  stepHeight: 0.3,
  snapToGround: 0.2,
});

// ─── movement system ────────────────────────────────────────────────────────

const velocityY = shallowRef(0);
const isGrounded = shallowRef(false);

// Camera offset from character
const camX = shallowRef(0);
const camY = shallowRef(6);
const camZ = shallowRef(8);

useInput({
  map: INPUT_MAP,
  fn: ({ delta, held, pressed }) => {
    // Compute wish direction from input
    let moveX = 0;
    let moveZ = 0;

    if (held.forward.value === true) moveZ -= 1;
    if (held.backward.value === true) moveZ += 1;
    if (held.left.value === true) moveX -= 1;
    if (held.right.value === true) moveX += 1;

    // Normalize diagonal movement
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX = (moveX / len) * MOVE_SPEED;
      moveZ = (moveZ / len) * MOVE_SPEED;
    }

    // Apply gravity
    velocityY.value += GRAVITY * delta;

    // Jump when grounded
    if (pressed.jump.value === true && controller.isGrounded === true) {
      velocityY.value = JUMP_FORCE;
    }

    // Move the character controller
    const movement = controller.move({
      eid: playerEid,
      velocity: { x: moveX, y: velocityY.value, z: moveZ },
      delta,
      colliderName: "body",
    });

    // Read grounded state after move
    isGrounded.value = controller.isGrounded;

    // Reset vertical velocity when grounded
    if (controller.isGrounded === true && velocityY.value < 0) {
      velocityY.value = 0;
    }

    // Apply the corrected movement to the kinematic body
    const physStore = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
    if (physStore !== undefined) {
      const body = physStore.body[playerEid];
      if (body !== undefined) {
        const pos = body.translation();
        const newX = pos.x + movement.x;
        const newY = pos.y + movement.y;
        const newZ = pos.z + movement.z;

        body.setNextKinematicTranslation({ x: newX, y: newY, z: newZ });

        // Update transform store so visual updates immediately
        // (kinematic bodies are skipped by physics sync)
        playerTransform.posX.value = newX;
        playerTransform.posY.value = newY;
        playerTransform.posZ.value = newZ;

        // Camera follows character from above/behind
        camX.value = newX;
        camY.value = newY + 6;
        camZ.value = newZ + 8;
      }
    }
  },
});
</script>

<template>
  <Scene name="character-controller" :default="true">
    <TresPerspectiveCamera
      :position="[camX, camY, camZ]"
      :look-at="[
        playerTransform.posX.value,
        playerTransform.posY.value,
        playerTransform.posZ.value,
      ]"
      :fov="50"
    />
    <TresDirectionalLight :position="[5, 10, 5]" :intensity="2" />
    <TresAmbientLight :intensity="0.5" />

    <!-- Character (capsule) -->
    <DumasEntity :eid="playerEid">
      <TresMesh>
        <TresCapsuleGeometry :args="[0.3, 0.8, 8, 16]" />
        <TresMeshStandardMaterial color="#4488ff" />
      </TresMesh>
    </DumasEntity>

    <!-- Ground plane -->
    <TresMesh :position="[0, -0.1, 0]">
      <TresBoxGeometry :args="[20, 0.2, 20]" />
      <TresMeshStandardMaterial color="#2a2a2a" />
    </TresMesh>

    <!-- Ramp -->
    <TresMesh :position="[4, 0.6, -3]" :rotation="[0, 0, (-20 * Math.PI) / 180]">
      <TresBoxGeometry :args="[3, 0.2, 4]" />
      <TresMeshStandardMaterial color="#886644" />
    </TresMesh>

    <!-- Step -->
    <TresMesh :position="[-3, 0.15, -3]">
      <TresBoxGeometry :args="[2, 0.3, 2]" />
      <TresMeshStandardMaterial color="#668844" />
    </TresMesh>

    <template #overlay>
      <div class="hud">
        <span :class="['pill', isGrounded === true && 'pill--grounded']">
          {{ isGrounded === true ? "Grounded" : "Airborne" }}
        </span>
        <span class="pill pill--hint">WASD / Arrows to move &middot; Space to jump</span>
      </div>
    </template>
  </Scene>
</template>

<style scoped>
.hud {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  pointer-events: none;
}

.pill {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.5);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  transition: all 0.1s;
}

.pill--grounded {
  border-color: rgba(80, 220, 120, 0.7);
  color: rgba(80, 220, 120, 1);
  background: rgba(80, 220, 120, 0.15);
}

.pill--hint {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  border-color: transparent;
  background: rgba(0, 0, 0, 0.3);
}
</style>
