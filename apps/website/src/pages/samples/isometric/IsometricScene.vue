<script setup lang="ts">
import { shallowRef, reactive } from "vue";
import {
  GameObject,
  useGameObject,
  useRigidBody,
  useCollider,
  useCharacterController,
  useCollisionHandler,
  useSystem,
} from "@dumas/core";
import IsometricCollectible from "./IsometricCollectible.vue";

const CAPSULE_RADIUS = 0.3;
const CAPSULE_HALF_HEIGHT = 0.5;
const MOVE_SPEED = 5;
const STOP_DISTANCE = 0.15;
const FACE_Z_OFFSET = CAPSULE_RADIUS + 0.1;
const FACE_ROTATION_SPEED = Math.PI * 4; // rad/s

const COLLECTIBLES: Array<{ id: number; position: [number, number, number] }> = [
  { id: 0, position: [3, 0.4, 2] },
  { id: 1, position: [-2, 0.4, 3] },
  { id: 2, position: [4, 0.4, -3] },
  { id: 3, position: [-3, 0.4, -2] },
  { id: 4, position: [1, 0.4, -4] },
];

const emit = defineEmits<{
  "update:score": [score: number];
}>();

const ground = useGameObject({ position: [0, -0.1, 0] });
useRigidBody({ eid: ground.eid, type: "fixed" });
useCollider({ eid: ground.eid, shape: "box", args: [12, 0.1, 12] });

const character = useGameObject({ position: [0, 1.5, 0] });
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

const targetPos = shallowRef<{ x: number; z: number } | null>(null);
const faceAngle = shallowRef(0);
let faceTargetAngle = 0;

const collectibles = reactive(COLLECTIBLES.map((c) => ({ ...c, collected: false })));
const collectibleEidToId = new Map<number, number>();
let score = 0;

useCollisionHandler({
  eid: character.eid,
  handler: ({ eidA, eidB, type }) => {
    if (type !== "started") return;
    const otherEid = eidA === character.eid ? eidB : eidA;
    const id = collectibleEidToId.get(otherEid);
    if (id === undefined) return;
    collectibles[id].collected = true;
    score += 1;
    emit("update:score", score);
  },
});

function onGroundClick(event: any): void {
  targetPos.value = { x: event.point.x, z: event.point.z };
}

function onCollectibleReady({ id, eid }: { id: number; eid: number }): void {
  collectibleEidToId.set(eid, id);
}

useSystem({
  fn: ({ delta }) => {
    const target = targetPos.value;
    if (target === null) {
      move({ delta });
      return;
    }

    const pos = character.position.value;
    const dx = target.x - pos.x;
    const dz = target.z - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < STOP_DISTANCE) {
      targetPos.value = null;
      move({ delta });
      return;
    }

    const nx = dx / dist;
    const nz = dz / dist;
    faceTargetAngle = Math.atan2(nx, nz);
    move({ x: nx, z: nz, delta });

    // Rotate face toward target along the shortest arc.
    let diff = faceTargetAngle - faceAngle.value;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    const step = Math.min(Math.abs(diff), FACE_ROTATION_SPEED * delta);
    faceAngle.value += Math.sign(diff) * step;
  },
});
</script>

<template>
  <GameObject>
    <TresPerspectiveCamera :position="[10, 10, 10]" :look-at="[0, 0, 0]" />
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[8, 15, 8]" :intensity="1.2" cast-shadow />

    <TresGroup
      :ref="
        (el: any) => {
          ground.groupRef.value = el;
        }
      "
    >
      <TresMesh @click="onGroundClick">
        <TresBoxGeometry :args="[24, 0.2, 24]" />
        <TresMeshStandardMaterial color="#3a5" />
      </TresMesh>
    </TresGroup>

    <TresGroup
      :ref="
        (el: any) => {
          character.groupRef.value = el;
        }
      "
    >
      <TresMesh>
        <TresCapsuleGeometry :args="[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]" />
        <TresMeshStandardMaterial color="#4af" />
      </TresMesh>
      <TresGroup :rotation-y="faceAngle">
        <TresMesh :position="[0, 0.2, FACE_Z_OFFSET]">
          <TresBoxGeometry :args="[0.25, 0.25, 0.15]" />
          <TresMeshStandardMaterial color="#ff0" />
        </TresMesh>
      </TresGroup>
    </TresGroup>

    <IsometricCollectible
      v-for="collectible in collectibles.filter((c) => c.collected === false)"
      :key="collectible.id"
      :position="collectible.position"
      @ready="
        (eid) => {
          onCollectibleReady({ id: collectible.id, eid });
        }
      "
    />
  </GameObject>
</template>
