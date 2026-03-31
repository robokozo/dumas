<script setup lang="ts">
import { shallowRef } from "vue";
import {
  Scene,
  DumasEntity,
  useEcsComponent,
  usePhysics,
  useSystem,
  useCharacterController,
  useJoint,
  useGame,
  createPhysics,
  createCuboidCollider,
  createCapsuleCollider,
  createTriggerZone,
  defineInputMap,
  defineTag,
  useInput,
  PHYSICS_TYPE,
} from "@dumas/core";
import type { PhysicsStore } from "@dumas/core";

// ─── constants ─────────────────────────────────────────────────────────────────

const MOVE_SPEED = 5;
const GRAVITY = -20;
const JUMP_FORCE = 9;
const HALF_PI = Math.PI / 2;

// Colors
const COLOR_GROUND = "#2a2a2a";
const COLOR_PLATFORM = "#3a3a4a";
const COLOR_PLAYER = "#4488ff";
const COLOR_PLAYER_KEY = "#44ccff";
const COLOR_KEY = "#ffd700";
const COLOR_PLATE_IDLE = "#666644";
const COLOR_PLATE_ACTIVE = "#aaaa22";
const COLOR_BRIDGE = "#886644";
const COLOR_GATE = "#664422";
const COLOR_EXIT_LOCKED = "#882222";
const COLOR_EXIT_OPEN = "#22aa44";
const COLOR_WALL = "#333340";

// ─── tags ──────────────────────────────────────────────────────────────────────

const PlayerTag = defineTag();
const KeyTag = defineTag();

// ─── input ─────────────────────────────────────────────────────────────────────

const INPUT_MAP = defineInputMap({
  left: ({ keys }) => keys.a?.value === true || keys.arrowleft?.value === true,
  right: ({ keys }) => keys.d?.value === true || keys.arrowright?.value === true,
  jump: ({ keys }) =>
    keys.space?.value === true || keys.w?.value === true || keys.arrowup?.value === true,
});

// ─── reactive HUD state ────────────────────────────────────────────────────────

const hasKey = shallowRef(false);
const isKeyVisible = shallowRef(true);
const hasWon = shallowRef(false);
const isBridgeActive = shallowRef(false);
const isGateActive = shallowRef(false);

// ─── physics world ─────────────────────────────────────────────────────────────

usePhysics({ gravity: [0, -9.81, 0] });

const gameCtx = useGame();

// ─── player entity (kinematicPositionBased capsule) ────────────────────────────

const { eid: playerEid, transform: playerTransform } = useEcsComponent({
  components: {
    player: PlayerTag,
    physics: createPhysics({
      type: "kinematicPositionBased",
      colliders: {
        body: createCapsuleCollider({ halfHeight: 0.35, radius: 0.25 }),
      },
    }),
  },
});

playerTransform.posX.value = -8;
playerTransform.posY.value = 2;
playerTransform.posZ.value = 0;

// ─── ground ────────────────────────────────────────────────────────────────────

const GROUND_HALF_WIDTH = 12;
const GROUND_HALF_HEIGHT = 0.25;

useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        ground: createCuboidCollider({ halfExtents: [GROUND_HALF_WIDTH, GROUND_HALF_HEIGHT, 2] }),
      },
    }),
  },
});

// ─── back wall (prevent Z drift) ───────────────────────────────────────────────

const { transform: backWallT } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [GROUND_HALF_WIDTH, 6, 0.1] }),
      },
    }),
  },
});

backWallT.posZ.value = -1;
backWallT.posY.value = 6;

// Front wall
const { transform: frontWallT } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        wall: createCuboidCollider({ halfExtents: [GROUND_HALF_WIDTH, 6, 0.1] }),
      },
    }),
  },
});

frontWallT.posZ.value = 1;
frontWallT.posY.value = 6;

// ─── platforms ─────────────────────────────────────────────────────────────────

interface PlatformDef {
  x: number;
  y: number;
  halfWidth: number;
  halfHeight: number;
}

const PLATFORMS: Array<PlatformDef> = [
  // Lower left platform
  { x: -6, y: 1.5, halfWidth: 2, halfHeight: 0.15 },
  // Middle elevated platform (where bridge leads to)
  { x: 0, y: 3, halfWidth: 2.5, halfHeight: 0.15 },
  // Upper right platform (where key is)
  { x: 6, y: 4.5, halfWidth: 2, halfHeight: 0.15 },
  // Small stepping platform between lower-left and middle
  { x: -3, y: 2.2, halfWidth: 0.8, halfHeight: 0.15 },
];

for (const plat of PLATFORMS) {
  const { transform: platT } = useEcsComponent({
    components: {
      physics: createPhysics({
        type: "fixed",
        colliders: {
          platform: createCuboidCollider({ halfExtents: [plat.halfWidth, plat.halfHeight, 1] }),
        },
      }),
    },
  });

  platT.posX.value = plat.x;
  platT.posY.value = plat.y;
}

// ─── bridge (revolute joint — swings down when plate 1 is pressed) ─────────────

// Bridge anchor: fixed body at the left edge of the middle platform
const { eid: bridgeAnchorEid, transform: bridgeAnchorT } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        anchor: createCuboidCollider({ halfExtents: [0.1, 0.1, 0.1] }),
      },
    }),
  },
});

const BRIDGE_ANCHOR_X = -2.5;
const BRIDGE_ANCHOR_Y = 3;

bridgeAnchorT.posX.value = BRIDGE_ANCHOR_X;
bridgeAnchorT.posY.value = BRIDGE_ANCHOR_Y;

// Bridge plank: dynamic body that swings
const BRIDGE_HALF_LENGTH = 1.2;

const { eid: bridgeEid, transform: bridgeT } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      lockTranslations: false,
      enabledRotations: [false, false, true],
      enabledTranslations: [true, true, false],
      gravityScale: 0,
      linearDamping: 5,
      angularDamping: 5,
      colliders: {
        plank: createCuboidCollider({ halfExtents: [BRIDGE_HALF_LENGTH, 0.1, 0.8] }),
      },
    }),
  },
});

// Start the bridge pointing upward (retracted)
bridgeT.posX.value = BRIDGE_ANCHOR_X - BRIDGE_HALF_LENGTH;
bridgeT.posY.value = BRIDGE_ANCHOR_Y;

const bridgeJoint = useJoint({
  type: "revolute",
  bodyA: bridgeAnchorEid,
  bodyB: bridgeEid,
  axis: { x: 0, y: 0, z: 1 },
  anchorA: { x: 0, y: 0, z: 0 },
  anchorB: { x: BRIDGE_HALF_LENGTH, y: 0, z: 0 },
  limits: { min: -HALF_PI, max: 0 },
});

// ─── gate (revolute joint — swings open when plate 2 is pressed) ───────────────

// Gate hinge: fixed body at top of gate
const GATE_X = 4;
const GATE_Y = 4.5;

const { eid: gateAnchorEid, transform: gateAnchorT } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "fixed",
      colliders: {
        anchor: createCuboidCollider({ halfExtents: [0.1, 0.1, 0.1] }),
      },
    }),
  },
});

gateAnchorT.posX.value = GATE_X;
gateAnchorT.posY.value = GATE_Y;

// Gate panel: dynamic body that swings upward
const GATE_HALF_HEIGHT = 1;

const { eid: gateEid, transform: gateT } = useEcsComponent({
  components: {
    physics: createPhysics({
      type: "dynamic",
      gravityScale: 0,
      linearDamping: 5,
      angularDamping: 5,
      enabledRotations: [false, false, true],
      enabledTranslations: [true, true, false],
      colliders: {
        gate: createCuboidCollider({ halfExtents: [0.15, GATE_HALF_HEIGHT, 0.8] }),
      },
    }),
  },
});

gateT.posX.value = GATE_X;
gateT.posY.value = GATE_Y - GATE_HALF_HEIGHT;

const gateJoint = useJoint({
  type: "revolute",
  bodyA: gateAnchorEid,
  bodyB: gateEid,
  axis: { x: 0, y: 0, z: 1 },
  anchorA: { x: 0, y: 0, z: 0 },
  anchorB: { x: 0, y: GATE_HALF_HEIGHT, z: 0 },
  limits: { min: 0, max: HALF_PI },
});

// ─── pressure plate 1 (activates bridge) ───────────────────────────────────────

const PLATE_1_X = -6;
const PLATE_1_Y = 1.8;

const { transform: plate1T } = useEcsComponent({
  components: {
    trigger: createTriggerZone({
      radius: 1.2,
      target: [PlayerTag],
      onEnter() {
        isBridgeActive.value = true;
        bridgeJoint.setMotorPosition({ targetPosition: -HALF_PI, stiffness: 200, damping: 50 });
      },
      onExit() {
        isBridgeActive.value = false;
        bridgeJoint.setMotorPosition({ targetPosition: 0, stiffness: 200, damping: 50 });
      },
    }),
  },
});

plate1T.posX.value = PLATE_1_X;
plate1T.posY.value = PLATE_1_Y;

// ─── pressure plate 2 (activates gate) ─────────────────────────────────────────

const PLATE_2_X = 0;
const PLATE_2_Y = 3.3;

const { transform: plate2T } = useEcsComponent({
  components: {
    trigger: createTriggerZone({
      radius: 1.2,
      target: [PlayerTag],
      onEnter() {
        isGateActive.value = true;
        gateJoint.setMotorPosition({ targetPosition: HALF_PI, stiffness: 200, damping: 50 });
      },
      onExit() {
        isGateActive.value = false;
        gateJoint.setMotorPosition({ targetPosition: 0, stiffness: 200, damping: 50 });
      },
    }),
  },
});

plate2T.posX.value = PLATE_2_X;
plate2T.posY.value = PLATE_2_Y;

// ─── key item (collectible) ───────────────────────────────────────────────────

const KEY_X = 7;
const KEY_Y = 5.3;

const { eid: keyEid, transform: keyT } = useEcsComponent({
  components: {
    key: KeyTag,
    trigger: createTriggerZone({
      radius: 1,
      target: [PlayerTag],
      onEnter() {
        if (hasKey.value === false) {
          hasKey.value = true;
          isKeyVisible.value = false;
        }
      },
    }),
  },
});

keyT.posX.value = KEY_X;
keyT.posY.value = KEY_Y;

// Rotating key animation
const keyRotation = shallowRef(0);

useSystem({
  fn: ({ elapsed }) => {
    keyRotation.value = elapsed * 2;
  },
});

// ─── exit door (trigger zone — requires key) ──────────────────────────────────

const EXIT_X = 9;
const EXIT_Y = 0.75;

const { transform: exitT } = useEcsComponent({
  components: {
    trigger: createTriggerZone({
      radius: 1.5,
      target: [PlayerTag],
      onEnter() {
        if (hasKey.value === true) {
          hasWon.value = true;
        }
      },
    }),
  },
});

exitT.posX.value = EXIT_X;
exitT.posY.value = EXIT_Y;

// ─── character controller ──────────────────────────────────────────────────────

const controller = useCharacterController({
  offset: 0.01,
  maxSlopeAngle: 50,
  stepHeight: 0.25,
  snapToGround: 0.15,
});

// ─── movement system ───────────────────────────────────────────────────────────

let velocityY = 0;
const isGrounded = shallowRef(false);
const playerColor = shallowRef(COLOR_PLAYER);

useInput({
  map: INPUT_MAP,
  fn: ({ delta, held, pressed }) => {
    let moveX = 0;

    if (held.left.value === true) moveX -= 1;
    if (held.right.value === true) moveX += 1;

    moveX *= MOVE_SPEED;

    // Apply gravity
    velocityY += GRAVITY * delta;

    // Jump when grounded
    if (pressed.jump.value === true && controller.isGrounded === true) {
      velocityY = JUMP_FORCE;
    }

    // Constrain to XY plane (z = 0)
    const movement = controller.move({
      eid: playerEid,
      velocity: { x: moveX, y: velocityY, z: 0 },
      delta,
      colliderName: "body",
    });

    isGrounded.value = controller.isGrounded;

    if (controller.isGrounded === true && velocityY < 0) {
      velocityY = 0;
    }

    // Apply corrected movement
    const physStore = gameCtx.storeRegistry.get(PHYSICS_TYPE) as PhysicsStore | undefined;
    if (physStore !== undefined) {
      const body = physStore.body[playerEid];
      if (body !== undefined) {
        const pos = body.translation();
        body.setNextKinematicTranslation({
          x: pos.x + movement.x,
          y: pos.y + movement.y,
          z: 0,
        });
      }
    }

    // Update player color based on key
    playerColor.value = hasKey.value === true ? COLOR_PLAYER_KEY : COLOR_PLAYER;
  },
});
</script>

<template>
  <Scene name="puzzle-platformer" :default="true">
    <!-- Side-view camera looking at XY plane -->
    <TresPerspectiveCamera :position="[0, 4, 18]" :look-at="[0, 3, 0]" :fov="45" />
    <TresDirectionalLight :position="[5, 10, 8]" :intensity="2" cast-shadow />
    <TresAmbientLight :intensity="0.4" />
    <TresHemisphereLight :args="['#334466', '#111111', 0.6]" />

    <!-- Ground -->
    <TresMesh :position="[0, -GROUND_HALF_HEIGHT, 0]">
      <TresBoxGeometry :args="[GROUND_HALF_WIDTH * 2, GROUND_HALF_HEIGHT * 2, 4]" />
      <TresMeshStandardMaterial :color="COLOR_GROUND" />
    </TresMesh>

    <!-- Platforms -->
    <TresMesh v-for="(plat, idx) in PLATFORMS" :key="`plat-${idx}`" :position="[plat.x, plat.y, 0]">
      <TresBoxGeometry :args="[plat.halfWidth * 2, plat.halfHeight * 2, 2]" />
      <TresMeshStandardMaterial :color="COLOR_PLATFORM" />
    </TresMesh>

    <!-- Player (capsule) -->
    <DumasEntity :eid="playerEid">
      <TresMesh>
        <TresCapsuleGeometry :args="[0.25, 0.7, 8, 16]" />
        <TresMeshStandardMaterial :color="playerColor" />
      </TresMesh>
    </DumasEntity>

    <!-- Bridge (revolute plank) -->
    <DumasEntity :eid="bridgeEid">
      <TresMesh>
        <TresBoxGeometry :args="[BRIDGE_HALF_LENGTH * 2, 0.2, 1.6]" />
        <TresMeshStandardMaterial :color="COLOR_BRIDGE" />
      </TresMesh>
    </DumasEntity>

    <!-- Gate (revolute panel) -->
    <DumasEntity :eid="gateEid">
      <TresMesh>
        <TresBoxGeometry :args="[0.3, GATE_HALF_HEIGHT * 2, 1.6]" />
        <TresMeshStandardMaterial :color="COLOR_GATE" />
      </TresMesh>
    </DumasEntity>

    <!-- Pressure plate 1 visual -->
    <TresMesh :position="[PLATE_1_X, PLATE_1_Y - 0.05, 0]">
      <TresBoxGeometry :args="[1.2, 0.1, 1.2]" />
      <TresMeshStandardMaterial
        :color="isBridgeActive === true ? COLOR_PLATE_ACTIVE : COLOR_PLATE_IDLE"
        :emissive="isBridgeActive === true ? COLOR_PLATE_ACTIVE : '#000000'"
        :emissive-intensity="isBridgeActive === true ? 0.5 : 0"
      />
    </TresMesh>

    <!-- Pressure plate 2 visual -->
    <TresMesh :position="[PLATE_2_X, PLATE_2_Y - 0.05, 0]">
      <TresBoxGeometry :args="[1.2, 0.1, 1.2]" />
      <TresMeshStandardMaterial
        :color="isGateActive === true ? COLOR_PLATE_ACTIVE : COLOR_PLATE_IDLE"
        :emissive="isGateActive === true ? COLOR_PLATE_ACTIVE : '#000000'"
        :emissive-intensity="isGateActive === true ? 0.5 : 0"
      />
    </TresMesh>

    <!-- Key item (rotating cube) -->
    <TresMesh
      v-if="isKeyVisible === true"
      :position="[KEY_X, KEY_Y, 0]"
      :rotation="[0, keyRotation, keyRotation * 0.7]"
    >
      <TresBoxGeometry :args="[0.4, 0.4, 0.4]" />
      <TresMeshStandardMaterial
        :color="COLOR_KEY"
        :emissive="COLOR_KEY"
        :emissive-intensity="0.8"
      />
    </TresMesh>

    <!-- Exit door visual -->
    <TresMesh :position="[EXIT_X, EXIT_Y, 0]">
      <TresBoxGeometry :args="[1, 1.5, 0.3]" />
      <TresMeshStandardMaterial
        :color="hasKey === true ? COLOR_EXIT_OPEN : COLOR_EXIT_LOCKED"
        :emissive="hasKey === true ? COLOR_EXIT_OPEN : COLOR_EXIT_LOCKED"
        :emissive-intensity="hasKey === true ? 0.6 : 0.2"
      />
    </TresMesh>

    <!-- Exit door frame -->
    <TresMesh :position="[EXIT_X, EXIT_Y + 0.85, 0]">
      <TresBoxGeometry :args="[1.3, 0.15, 0.4]" />
      <TresMeshStandardMaterial :color="COLOR_WALL" />
    </TresMesh>
    <TresMesh :position="[EXIT_X - 0.6, EXIT_Y, 0]">
      <TresBoxGeometry :args="[0.15, 1.5, 0.4]" />
      <TresMeshStandardMaterial :color="COLOR_WALL" />
    </TresMesh>
    <TresMesh :position="[EXIT_X + 0.6, EXIT_Y, 0]">
      <TresBoxGeometry :args="[0.15, 1.5, 0.4]" />
      <TresMeshStandardMaterial :color="COLOR_WALL" />
    </TresMesh>

    <!-- HUD overlay -->
    <template #overlay>
      <div class="hud">
        <div class="hud__status">
          <span :class="['pill', hasKey === true && 'pill--key']">
            Key: {{ hasKey === true ? "Collected" : "Not found" }}
          </span>
          <span :class="['pill', isGrounded === true && 'pill--grounded']">
            {{ isGrounded === true ? "Grounded" : "Airborne" }}
          </span>
        </div>
        <span class="pill pill--hint">A/D or Arrows to move &middot; Space/W/Up to jump</span>
      </div>

      <!-- Win screen -->
      <div v-if="hasWon === true" class="win-overlay">
        <div class="win-box">
          <h2>Level Complete!</h2>
          <p>You collected the key and reached the exit.</p>
        </div>
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

.hud__status {
  display: flex;
  gap: 0.5rem;
}

.pill {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.5);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.75rem;
  transition: all 0.15s;
}

.pill--key {
  border-color: rgba(255, 215, 0, 0.8);
  color: rgba(255, 215, 0, 1);
  background: rgba(255, 215, 0, 0.15);
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

.win-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

.win-box {
  background: rgba(20, 20, 30, 0.9);
  border: 1px solid rgba(80, 220, 120, 0.5);
  border-radius: 12px;
  padding: 2rem 3rem;
  text-align: center;
  color: #eee;
  font-family: sans-serif;
}

.win-box h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: rgba(80, 220, 120, 1);
}

.win-box p {
  margin: 0;
  font-size: 0.9rem;
  color: #aaa;
}
</style>
