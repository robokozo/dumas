<script setup lang="ts">
import {
  ARENA_HALF_SIZE,
  ARENA_FLOOR_COLOR,
  ARENA_WALL_COLOR,
  WALL_HEIGHT,
  WALL_THICKNESS,
} from "./constants";

const WALL_LENGTH = ARENA_HALF_SIZE * 2 + WALL_THICKNESS;
const WALL_Y = WALL_HEIGHT / 2;

const walls = [
  // North wall
  {
    pos: [0, WALL_Y, -ARENA_HALF_SIZE - WALL_THICKNESS / 2],
    size: [WALL_LENGTH, WALL_HEIGHT, WALL_THICKNESS],
  },
  // South wall
  {
    pos: [0, WALL_Y, ARENA_HALF_SIZE + WALL_THICKNESS / 2],
    size: [WALL_LENGTH, WALL_HEIGHT, WALL_THICKNESS],
  },
  // East wall
  {
    pos: [ARENA_HALF_SIZE + WALL_THICKNESS / 2, WALL_Y, 0],
    size: [WALL_THICKNESS, WALL_HEIGHT, WALL_LENGTH],
  },
  // West wall
  {
    pos: [-ARENA_HALF_SIZE - WALL_THICKNESS / 2, WALL_Y, 0],
    size: [WALL_THICKNESS, WALL_HEIGHT, WALL_LENGTH],
  },
] as const;
</script>

<template>
  <!-- Arena floor -->
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0, 0]">
    <TresPlaneGeometry :args="[ARENA_HALF_SIZE * 2, ARENA_HALF_SIZE * 2]" />
    <TresMeshStandardMaterial :color="ARENA_FLOOR_COLOR" />
  </TresMesh>

  <!-- Grid lines on floor for visual reference -->
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.01, 0]">
    <TresPlaneGeometry :args="[ARENA_HALF_SIZE * 2, ARENA_HALF_SIZE * 2]" />
    <TresMeshStandardMaterial color="#3a3a48" :wireframe="true" />
  </TresMesh>

  <!-- Boundary walls -->
  <TresMesh v-for="(wall, i) in walls" :key="i" :position="[wall.pos[0], wall.pos[1], wall.pos[2]]">
    <TresBoxGeometry :args="[wall.size[0], wall.size[1], wall.size[2]]" />
    <TresMeshStandardMaterial
      :color="ARENA_WALL_COLOR"
      :emissive="ARENA_WALL_COLOR"
      :emissive-intensity="0.05"
    />
  </TresMesh>
</template>
