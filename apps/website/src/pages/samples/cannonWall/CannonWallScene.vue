<script setup lang="ts">
import { Raycaster, Vector2 } from "three";
import { useEventListener } from "@vueuse/core";
import { useObjectPool, useSystem } from "@dumas/core";
import { useTresContext } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";
import WallBlock from "./WallBlock.vue";
import WallGround from "./WallGround.vue";
import WallCannonball from "./WallCannonball.vue";

const { camera } = useTresContext();

const COLS = 8;
const ROWS = 8;
const BLOCK_W = 1.05;
const BLOCK_H = 0.52;
const FIRE_SPEED = 40;

const blocks: Array<{ position: [number, number, number]; color: string }> = [];
for (let row = 0; row < ROWS; row++) {
  const offset = (row % 2) * (BLOCK_W / 2);
  const hue = Math.round((row / ROWS) * 360);
  const color = `hsl(${hue}, 80%, 55%)`;
  for (let col = 0; col < COLS; col++) {
    blocks.push({
      position: [offset + (col - (COLS - 1) / 2) * BLOCK_W, 0.26 + row * BLOCK_H, 0],
      color,
    });
  }
}

const pool = useObjectPool({
  size: 10,
  bodyType: "dynamic",
  colliderOptions: { shape: "sphere", radius: 0.4, restitution: 0.3, friction: 0.5 },
});

useSystem({
  fn: () => {
    for (const handle of pool.handles.value) {
      if (handle.isActive === true && handle.rigidBody.translation().y < -20) {
        pool.release({ eid: handle.eid });
      }
    }
  },
});

const raycaster = new Raycaster();
const mouseVec = new Vector2();

const DRAG_THRESHOLD = 4;
let mouseDownX = 0;
let mouseDownY = 0;

useEventListener(window, "mousedown", (e: MouseEvent) => {
  mouseDownX = e.clientX;
  mouseDownY = e.clientY;
});

useEventListener(window, "click", (e: MouseEvent) => {
  const dx = e.clientX - mouseDownX;
  const dy = e.clientY - mouseDownY;
  if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) return;
  const cam = camera.activeCamera.value;
  if (cam === null || cam === undefined) return;

  mouseVec.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouseVec, cam);
  const dir = raycaster.ray.direction;

  const handle = pool.acquire();
  if (handle === null) return;

  handle.rigidBody.setTranslation(
    {
      x: cam.position.x + dir.x * 1.5,
      y: cam.position.y + dir.y * 1.5,
      z: cam.position.z + dir.z * 1.5,
    },
    true,
  );
  handle.rigidBody.setLinvel(
    { x: dir.x * FIRE_SPEED, y: dir.y * FIRE_SPEED, z: dir.z * FIRE_SPEED },
    true,
  );
  handle.rigidBody.enableCcd(true);
});
</script>

<template>
  <TresPerspectiveCamera :position="[0, 4, 18]" :look-at="[0, 2, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight :position="[8, 12, 8]" :intensity="1.2" cast-shadow />
  <WallGround />
  <WallBlock
    v-for="(block, i) in blocks"
    :key="i"
    :position="block.position"
    :color="block.color"
  />
  <WallCannonball v-for="handle in pool.handles.value" :key="handle.eid" :handle="handle" />
</template>
