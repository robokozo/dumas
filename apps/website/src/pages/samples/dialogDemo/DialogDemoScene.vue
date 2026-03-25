<script setup lang="ts">
import {
  GameObject,
  useGameObject,
  useRigidBody,
  useCollider,
  useCharacterController,
  useActions,
  useSystem,
} from "@dumas/core";
import type { Vec3 } from "@dumas/core";
import TriggerZone from "./TriggerZone.vue";

interface DialogContent {
  title: string;
  body: string;
}

interface ZoneConfig {
  position: Vec3;
  color: string;
  title: string;
  body: string;
}

const MOVE_SPEED = 5;
const CAPSULE_HALF_HEIGHT = 0.35;
const CAPSULE_RADIUS = 0.3;

const ZONES: Array<ZoneConfig> = [
  {
    position: { x: -5, y: 0, z: -4 },
    color: "#4af",
    title: "Ancient Obelisk",
    body: "This weathered stone pillar has stood here for centuries. Strange runes are carved into its surface, pulsing with a faint blue light. Their meaning has been lost to time — but those who linger say they can hear a distant hum.",
  },
  {
    position: { x: 5, y: 0, z: -4 },
    color: "#fa4",
    title: "Treasure Chest",
    body: "A battered chest sits half-buried in the earth. Inside you find a collection of old coins and a crumpled map with an 'X' marked somewhere to the north. Someone was here before you.",
  },
  {
    position: { x: 0, y: 0, z: 5 },
    color: "#a4f",
    title: "Arcane Portal",
    body: "The air shimmers and crackles with residual energy. This portal once connected to a distant realm, but the binding has long since unraveled. Only an echo of its former power remains, tugging faintly at the edges of your perception.",
  },
];

const emit = defineEmits<{
  "enter-zone": [content: DialogContent];
  "exit-zone": [];
}>();

// Ground
const ground = useGameObject({ position: { x: 0, y: -0.5, z: 0 } });
useRigidBody({ eid: ground.eid, type: "fixed" });
useCollider({ eid: ground.eid, shape: "box", args: [12, 0.5, 12] });

// Character
const character = useGameObject({ position: { x: 0, y: 1, z: 0 } });
const { move } = useCharacterController({
  eid: character.eid,
  mode: "3d",
  moveSpeed: MOVE_SPEED,
  collider: {
    shape: "capsule",
    halfHeight: CAPSULE_HALF_HEIGHT,
    radius: CAPSULE_RADIUS,
  },
});

const input = useActions({
  source: "keyboard",
  bindings: {
    dpadLeft: ["KeyA", "ArrowLeft"],
    dpadRight: ["KeyD", "ArrowRight"],
    dpadUp: ["KeyW", "ArrowUp"],
    dpadDown: ["KeyS", "ArrowDown"],
  },
  actions: {
    move: "leftStick",
  },
});

useSystem({
  fn: ({ delta }) => {
    const { x, y } = input.axis("move");
    // Top-down: stick y (forward) maps to -z in world space
    move({ x, z: -y, delta });
  },
});
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[0, 18, 8]" :look-at="[0, 0, 0]" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[6, 12, 6]" :intensity="1" cast-shadow />

    <!-- Ground -->
    <TresGroup
      :ref="
        (el: any) => {
          ground.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresBoxGeometry :args="[24, 1, 24]" />
        <TresMeshStandardMaterial color="#2a3a2a" />
      </TresMesh>
    </TresGroup>

    <!-- Character -->
    <TresGroup
      :ref="
        (el: any) => {
          character.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresCapsuleGeometry :args="[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]" />
        <TresMeshStandardMaterial color="#eee" :metalness="0.1" :roughness="0.4" />
      </TresMesh>
    </TresGroup>

    <!-- Trigger zones -->
    <TriggerZone
      v-for="zone in ZONES"
      :key="zone.title"
      :position="zone.position"
      :player-eid="character.eid"
      :color="zone.color"
      @enter="emit('enter-zone', { title: zone.title, body: zone.body })"
      @exit="emit('exit-zone')"
    />
  </GameObject>
</template>
