<script setup lang="ts">
import { ref } from "vue";
import { Scene, useEcsComponent, useSystem, DumasEntity } from "@dumas/core";

// ── Constants ──────────────────────────────────────────────────────────────────
const MOVE_SPEED = 4;
const ARRIVAL_DIST = 0.12;
const INTERACTION_RANGE = 1.8;
const APPROACH_OFFSET = 1.1;

// ── Item definitions ───────────────────────────────────────────────────────────
interface Interaction {
  label: string;
  response: string;
}

interface AdventureItem {
  id: string;
  label: string;
  x: number;
  z: number;
  interactions: Array<Interaction>;
}

const ITEMS: Array<AdventureItem> = [
  {
    id: "chest",
    label: "Ancient Chest",
    x: 4,
    z: 1,
    interactions: [
      {
        label: "Open it",
        response:
          'The chest creaks open. Inside: a handful of coins and a crumpled note reading "Not here."',
      },
      {
        label: "Examine it",
        response: "Old wood, suspiciously new lock. Strange symbols are carved along the lid.",
      },
      {
        label: "Leave it",
        response: "You back away slowly. Some things are better left unopened.",
      },
    ],
  },
  {
    id: "sign",
    label: "Wooden Sign",
    x: -4,
    z: -1,
    interactions: [
      {
        label: "Read it",
        response:
          '"DANGER: The forest ahead is cursed. Turn back." — scrawled beneath in fresh ink: "(we\'re also out of milk)"',
      },
      { label: "Ignore it", response: "Signs are just suggestions. You've got places to be." },
    ],
  },
  {
    id: "orb",
    label: "Floating Orb",
    x: 1,
    z: -4,
    interactions: [
      {
        label: "Touch it",
        response: "A warm pulse runs up your arm. You glimpse a distant mountain. Then nothing.",
      },
      {
        label: "Circle it",
        response: "It rotates to always face you. Unsettling, but at least it's polite.",
      },
      {
        label: "Talk to it",
        response: '"Hello?" The orb brightens briefly. You feel slightly foolish.',
      },
    ],
  },
];

// ── Character entity ───────────────────────────────────────────────────────────
const { eid: charEid, transform: charTransform } = useEcsComponent({ components: {} });

// ── Movement state ─────────────────────────────────────────────────────────────
const targetX = ref(0);
const targetZ = ref(0);
const isMoving = ref(false);
const pendingItem = ref<AdventureItem | null>(null);

// ── Interaction state ─────────────────────────────────────────────────────────
const nearbyItem = ref<AdventureItem | null>(null);
const activeItem = ref<AdventureItem | null>(null);
const interactionResponse = ref<string | null>(null);

// ── Movement system ────────────────────────────────────────────────────────────
useSystem({
  components: [],
  fn: ({ delta }) => {
    if (isMoving.value === false) return;

    const dx = targetX.value - charTransform.posX.value;
    const dz = targetZ.value - charTransform.posZ.value;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < ARRIVAL_DIST) {
      isMoving.value = false;
      if (pendingItem.value !== null) {
        activeItem.value = pendingItem.value;
        interactionResponse.value = null;
        pendingItem.value = null;
      }
      return;
    }

    const nx = dx / dist;
    const nz = dz / dist;
    charTransform.posX.value += nx * MOVE_SPEED * delta;
    charTransform.posZ.value += nz * MOVE_SPEED * delta;
    // rotX/Y/Z/W are quaternion components, not Euler angles.
    // For a Y-axis rotation by angle θ: (0, sin(θ/2), 0, cos(θ/2)).
    const halfAngle = Math.atan2(nx, nz) / 2;
    charTransform.rotX.value = 0;
    charTransform.rotY.value = Math.sin(halfAngle);
    charTransform.rotZ.value = 0;
    charTransform.rotW.value = Math.cos(halfAngle);
  },
});

// ── Nearby item detection ─────────────────────────────────────────────────────
useSystem({
  components: [],
  fn: () => {
    if (activeItem.value !== null) return;
    let found: AdventureItem | null = null;
    for (const item of ITEMS) {
      const dx = item.x - charTransform.posX.value;
      const dz = item.z - charTransform.posZ.value;
      if (Math.sqrt(dx * dx + dz * dz) < INTERACTION_RANGE) {
        found = item;
        break;
      }
    }
    nearbyItem.value = found;
  },
});

// ── Handlers ───────────────────────────────────────────────────────────────────
function onGroundClick({ point }: { point: { x: number; y: number; z: number } }): void {
  if (activeItem.value !== null) return;
  // Guard: ignore clicks that land on or very near an item hitbox
  for (const item of ITEMS) {
    const dx = item.x - point.x;
    const dz = item.z - point.z;
    if (Math.sqrt(dx * dx + dz * dz) < 0.7) return;
  }
  targetX.value = point.x;
  targetZ.value = point.z;
  isMoving.value = true;
  pendingItem.value = null;
}

function onItemClick({ item }: { item: AdventureItem }): void {
  if (activeItem.value !== null) return;
  const dx = charTransform.posX.value - item.x;
  const dz = charTransform.posZ.value - item.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  if (dist < INTERACTION_RANGE) {
    activeItem.value = item;
    interactionResponse.value = null;
  } else {
    const angle = Math.atan2(dx, dz);
    targetX.value = item.x + Math.sin(angle) * APPROACH_OFFSET;
    targetZ.value = item.z + Math.cos(angle) * APPROACH_OFFSET;
    isMoving.value = true;
    pendingItem.value = item;
  }
}

function onInteractNearby(): void {
  if (nearbyItem.value !== null) {
    activeItem.value = nearbyItem.value;
    interactionResponse.value = null;
  }
}

function onSelectInteraction({ response }: { response: string }): void {
  interactionResponse.value = response;
}

function onBackToOptions(): void {
  interactionResponse.value = null;
}

function onCloseModal(): void {
  activeItem.value = null;
  interactionResponse.value = null;
}
</script>

<template>
  <Scene name="adventure" :default="true">
    <TresPerspectiveCamera :position="[0, 14, 12]" :look-at="[0, 0, 0]" :fov="45" />
    <TresAmbientLight :intensity="0.55" />
    <TresDirectionalLight :position="[5, 10, 8]" :intensity="1.4" color="#fff8ee" />
    <TresDirectionalLight :position="[-5, 6, -4]" :intensity="0.35" color="#aaccff" />
    <TresPointLight :position="[1, 1.5, -4]" :intensity="8" :distance="5" color="#40c0e0" />
    <TresPointLight :position="[4, 1, 1]" :intensity="4" :distance="4" color="#f0c040" />

    <!-- Ground (clickable) -->
    <TresMesh :rotation="[-Math.PI / 2, 0, 0]" @click="(e) => onGroundClick(e)">
      <TresPlaneGeometry :args="[30, 30]" />
      <TresMeshStandardMaterial color="#1a2030" />
    </TresMesh>

    <!-- Ground detail patches -->
    <TresMesh :position="[-2, 0.01, 2]" :rotation="[-Math.PI / 2, 0, 0.4]">
      <TresPlaneGeometry :args="[3, 2]" />
      <TresMeshStandardMaterial color="#1c2820" />
    </TresMesh>
    <TresMesh :position="[3, 0.01, -3]" :rotation="[-Math.PI / 2, 0, -0.5]">
      <TresPlaneGeometry :args="[2.5, 2]" />
      <TresMeshStandardMaterial color="#20281a" />
    </TresMesh>
    <TresMesh :position="[-1, 0.01, -5]" :rotation="[-Math.PI / 2, 0, 0.8]">
      <TresPlaneGeometry :args="[2, 1.5]" />
      <TresMeshStandardMaterial color="#1e2420" />
    </TresMesh>

    <!-- Character -->
    <DumasEntity :eid="charEid">
      <!-- Body -->
      <TresMesh :position="[0, 0.38, 0]">
        <TresCylinderGeometry :args="[0.18, 0.22, 0.7, 8]" />
        <TresMeshStandardMaterial color="#4a7fa5" />
      </TresMesh>
      <!-- Head -->
      <TresMesh :position="[0, 0.96, 0]">
        <TresSphereGeometry :args="[0.19, 8, 6]" />
        <TresMeshStandardMaterial color="#f4c2a1" />
      </TresMesh>
      <!-- Direction dot so rotation is visible -->
      <TresMesh :position="[0, 0.96, 0.18]">
        <TresSphereGeometry :args="[0.05, 4, 4]" />
        <TresMeshStandardMaterial color="#c06030" />
      </TresMesh>
    </DumasEntity>

    <!-- ── Ancient Chest (4, 0, 1) ────────────────────────────────────────── -->
    <TresGroup :position="[4, 0, 1]">
      <TresMesh :position="[0, 0.2, 0]">
        <TresBoxGeometry :args="[0.7, 0.38, 0.5]" />
        <TresMeshStandardMaterial color="#7a5020" />
      </TresMesh>
      <TresMesh :position="[0, 0.49, 0]">
        <TresBoxGeometry :args="[0.7, 0.2, 0.5]" />
        <TresMeshStandardMaterial color="#8a6030" />
      </TresMesh>
      <TresMesh :position="[0, 0.37, 0.26]">
        <TresBoxGeometry :args="[0.12, 0.1, 0.04]" />
        <TresMeshStandardMaterial color="#f0c040" :emissive="'#c09010'" :emissive-intensity="0.4" />
      </TresMesh>
      <!-- Hitbox -->
      <TresMesh :position="[0, 0.35, 0]" @click.stop="() => onItemClick({ item: ITEMS[0] })">
        <TresBoxGeometry :args="[1.0, 0.8, 0.9]" />
        <TresMeshBasicMaterial :transparent="true" :opacity="0" />
      </TresMesh>
    </TresGroup>

    <!-- ── Wooden Sign (-4, 0, -1) ────────────────────────────────────────── -->
    <TresGroup :position="[-4, 0, -1]">
      <TresMesh :position="[0, 0.5, 0]">
        <TresBoxGeometry :args="[0.12, 1.0, 0.12]" />
        <TresMeshStandardMaterial color="#6b4a2a" />
      </TresMesh>
      <TresMesh :position="[0, 1.05, 0]" :rotation="[0, 0.25, 0]">
        <TresBoxGeometry :args="[0.8, 0.45, 0.08]" />
        <TresMeshStandardMaterial color="#a07840" />
      </TresMesh>
      <!-- Hitbox -->
      <TresMesh :position="[0, 0.55, 0]" @click.stop="() => onItemClick({ item: ITEMS[1] })">
        <TresBoxGeometry :args="[1.0, 1.3, 0.9]" />
        <TresMeshBasicMaterial :transparent="true" :opacity="0" />
      </TresMesh>
    </TresGroup>

    <!-- ── Floating Orb (1, 0, -4) ────────────────────────────────────────── -->
    <TresGroup :position="[1, 0, -4]">
      <TresMesh :position="[0, 0.2, 0]">
        <TresCylinderGeometry :args="[0.14, 0.24, 0.4, 8]" />
        <TresMeshStandardMaterial color="#3a3a5a" />
      </TresMesh>
      <TresMesh :position="[0, 0.72, 0]">
        <TresSphereGeometry :args="[0.28, 16, 12]" />
        <TresMeshStandardMaterial
          color="#40c0e0"
          :emissive="'#20a0c0'"
          :emissive-intensity="0.9"
          :transparent="true"
          :opacity="0.88"
        />
      </TresMesh>
      <TresMesh :position="[0, 0.72, 0]" :rotation="[Math.PI / 2, 0, 0]">
        <TresTorusGeometry :args="[0.4, 0.04, 6, 24]" />
        <TresMeshStandardMaterial color="#80e8ff" :emissive="'#40c0f0'" :emissive-intensity="1.2" />
      </TresMesh>
      <!-- Hitbox -->
      <TresMesh :position="[0, 0.5, 0]" @click.stop="() => onItemClick({ item: ITEMS[2] })">
        <TresCylinderGeometry :args="[0.7, 0.7, 1.0, 8]" />
        <TresMeshBasicMaterial :transparent="true" :opacity="0" />
      </TresMesh>
    </TresGroup>

    <!-- ── Decorative trees ────────────────────────────────────────────────── -->
    <TresGroup :position="[-6, 0, -5]">
      <TresMesh :position="[0, 0.75, 0]">
        <TresCylinderGeometry :args="[0.14, 0.19, 1.5, 6]" />
        <TresMeshStandardMaterial color="#4a3020" />
      </TresMesh>
      <TresMesh :position="[0, 2.15, 0]">
        <TresConeGeometry :args="[0.9, 2.0, 7]" />
        <TresMeshStandardMaterial color="#1a4020" />
      </TresMesh>
    </TresGroup>
    <TresGroup :position="[6, 0, -6]">
      <TresMesh :position="[0, 0.7, 0]">
        <TresCylinderGeometry :args="[0.12, 0.17, 1.4, 6]" />
        <TresMeshStandardMaterial color="#4a3020" />
      </TresMesh>
      <TresMesh :position="[0, 2.0, 0]">
        <TresConeGeometry :args="[0.8, 1.8, 7]" />
        <TresMeshStandardMaterial color="#1a4020" />
      </TresMesh>
    </TresGroup>
    <TresGroup :position="[-7, 0, 2]">
      <TresMesh :position="[0, 0.6, 0]">
        <TresCylinderGeometry :args="[0.13, 0.17, 1.2, 6]" />
        <TresMeshStandardMaterial color="#4a3020" />
      </TresMesh>
      <TresMesh :position="[0, 1.7, 0]">
        <TresConeGeometry :args="[0.7, 1.6, 7]" />
        <TresMeshStandardMaterial color="#254a28" />
      </TresMesh>
    </TresGroup>
    <TresGroup :position="[5, 0, 5]">
      <TresMesh :position="[0, 0.65, 0]">
        <TresCylinderGeometry :args="[0.14, 0.18, 1.3, 6]" />
        <TresMeshStandardMaterial color="#4a3020" />
      </TresMesh>
      <TresMesh :position="[0, 1.9, 0]">
        <TresConeGeometry :args="[0.85, 1.9, 7]" />
        <TresMeshStandardMaterial color="#1e4822" />
      </TresMesh>
    </TresGroup>
    <TresGroup :position="[-3, 0, 6]">
      <TresMesh :position="[0, 0.55, 0]">
        <TresCylinderGeometry :args="[0.11, 0.15, 1.1, 6]" />
        <TresMeshStandardMaterial color="#4a3020" />
      </TresMesh>
      <TresMesh :position="[0, 1.55, 0]">
        <TresConeGeometry :args="[0.65, 1.5, 7]" />
        <TresMeshStandardMaterial color="#204018" />
      </TresMesh>
    </TresGroup>

    <!-- Decorative rocks -->
    <TresMesh :position="[2, 0.18, 3]" :rotation="[0.2, 0.5, 0.1]">
      <TresBoxGeometry :args="[0.5, 0.35, 0.45]" />
      <TresMeshStandardMaterial color="#505060" />
    </TresMesh>
    <TresMesh :position="[-2, 0.14, -3]" :rotation="[0.1, 1.0, 0.2]">
      <TresBoxGeometry :args="[0.42, 0.28, 0.38]" />
      <TresMeshStandardMaterial color="#484858" />
    </TresMesh>
    <TresMesh :position="[6, 0.12, 2]" :rotation="[0.3, 0.3, 0.15]">
      <TresBoxGeometry :args="[0.35, 0.24, 0.32]" />
      <TresMeshStandardMaterial color="#545464" />
    </TresMesh>

    <template #overlay>
      <!-- Nearby item prompt -->
      <div v-if="nearbyItem !== null && activeItem === null" class="prompt">
        <span class="prompt__label">{{ nearbyItem.label }}</span>
        <button class="prompt__btn" @click="() => onInteractNearby()">Interact</button>
      </div>

      <!-- Interaction modal -->
      <div v-if="activeItem !== null" class="modal-backdrop" @click.self="() => onCloseModal()">
        <div class="modal">
          <div class="modal__header">
            <span class="modal__title">{{ activeItem.label }}</span>
            <button class="modal__close" @click="() => onCloseModal()">✕</button>
          </div>
          <div class="modal__body">
            <div v-if="interactionResponse === null" class="modal__options">
              <button
                v-for="interaction in activeItem.interactions"
                :key="interaction.label"
                class="modal__option"
                @click="() => onSelectInteraction({ response: interaction.response })"
              >
                {{ interaction.label }}
              </button>
            </div>
            <div v-else class="modal__response">
              <p class="modal__response-text">{{ interactionResponse }}</p>
              <button class="modal__back" @click="() => onBackToOptions()">← Back</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hint -->
      <div class="hint">Click to move &nbsp;·&nbsp; Click objects or approach to interact</div>
    </template>
  </Scene>
</template>

<style scoped>
.prompt {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 0.5rem 0.75rem 0.5rem 1rem;
  font-family: sans-serif;
  backdrop-filter: blur(6px);
  pointer-events: auto;
}

.prompt__label {
  font-size: 0.85rem;
  color: #ddd;
}

.prompt__btn {
  background: rgba(68, 170, 255, 0.18);
  border: 1px solid rgba(68, 170, 255, 0.4);
  border-radius: 5px;
  color: #4af;
  font-size: 0.8rem;
  padding: 0.25rem 0.65rem;
  cursor: pointer;
  transition: background 0.15s;
}

.prompt__btn:hover {
  background: rgba(68, 170, 255, 0.32);
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.52);
  pointer-events: auto;
}

.modal {
  background: #181c28;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  width: min(380px, 90vw);
  overflow: hidden;
  font-family: sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal__title {
  font-size: 1rem;
  color: #fff;
  font-weight: 600;
}

.modal__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  transition: color 0.15s;
}

.modal__close:hover {
  color: #fff;
}

.modal__body {
  padding: 1rem 1.25rem;
}

.modal__options {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.modal__option {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 7px;
  color: #d8d8d8;
  font-size: 0.875rem;
  padding: 0.6rem 0.9rem;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.modal__option:hover {
  background: rgba(68, 170, 255, 0.1);
  border-color: rgba(68, 170, 255, 0.3);
  color: #fff;
}

.modal__response {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal__response-text {
  font-size: 0.875rem;
  color: #bbb;
  line-height: 1.65;
  margin: 0;
  font-style: italic;
}

.modal__back {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: color 0.15s;
}

.modal__back:hover {
  color: #fff;
}

.hint {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: sans-serif;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  white-space: nowrap;
}
</style>
