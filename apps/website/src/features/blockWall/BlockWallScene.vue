<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { Raycaster, Vector2 } from "three";
import { useWorld, useObjectPool, useSystem } from "@dumas/core";
import { useTresContext } from "@tresjs/core";
import { useControls } from "@tresjs/leches";
import { OrbitControls } from "@tresjs/cientos";
import Block from "./Block.vue";
import Ground from "./Ground.vue";
import Cannonball from "./Cannonball.vue";

useWorld({ gravity: { x: 0, y: -9.81, z: 0 } });
useControls({ fps: { type: "fpsgraph" } });

const { camera } = useTresContext();

const COLS = 8;
const ROWS = 8;
const BLOCK_W = 1.05;
const BLOCK_H = 0.52;

const blocks: { position: [number, number, number]; color: string }[] = [];
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

// Auto-release cannonballs that have fallen off the world
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
const mouse = new Vector2();

let pointerMoved = false;
let pointerDownX = 0;
let pointerDownY = 0;

const SPAWN_OFFSET = 1.5;
const FIRE_SPEED = 40;

function onPointerDown(e: PointerEvent) {
  pointerMoved = false;
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
}

function onPointerMove(e: PointerEvent) {
  if (Math.abs(e.clientX - pointerDownX) > 5 || Math.abs(e.clientY - pointerDownY) > 5) {
    pointerMoved = true;
  }
}

function onPointerUp(e: PointerEvent) {
  if (pointerMoved === false) fire(e.clientX, e.clientY);
}

function fire(clientX: number, clientY: number) {
  const cam = camera.activeCamera.value;
  if (cam === null || cam === undefined) return;

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, cam);
  const dir = raycaster.ray.direction;

  const handle = pool.acquire();
  if (handle === null) return;

  handle.rigidBody.setTranslation(
    {
      x: cam.position.x + dir.x * SPAWN_OFFSET,
      y: cam.position.y + dir.y * SPAWN_OFFSET,
      z: cam.position.z + dir.z * SPAWN_OFFSET,
    },
    true,
  );
  handle.rigidBody.setLinvel(
    { x: dir.x * FIRE_SPEED, y: dir.y * FIRE_SPEED, z: dir.z * FIRE_SPEED },
    true,
  );
  handle.rigidBody.enableCcd(true);
}

onMounted(() => {
  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp as EventListener);
});

onUnmounted(() => {
  window.removeEventListener("pointerdown", onPointerDown);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp as EventListener);
});
</script>

<template>
  <TresPerspectiveCamera :position="[0, 4, 18]" :look-at="[0, 2, 0]" />
  <OrbitControls />
  <TresAmbientLight :intensity="0.4" />
  <TresDirectionalLight :position="[8, 12, 8]" :intensity="1.2" cast-shadow />
  <Ground />
  <Block v-for="(block, i) in blocks" :key="i" :position="block.position" :color="block.color" />
  <Cannonball v-for="handle in pool.handles.value" :key="handle.eid" :handle="handle" />
</template>
