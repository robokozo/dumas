<script setup lang="ts">
const props = defineProps<{
  pivotY: number;
  halfSpan: number;
}>();

const BEAM_T = 0.06;
const POST_Z = 0.6;
const POST_X = props.halfSpan + 0.3;
const POST_HEIGHT = props.pivotY;
const BEAM_WIDTH = POST_X * 2 + BEAM_T;
const BEAM_DEPTH = POST_Z * 2 + BEAM_T;

interface FramePiece {
  position: [number, number, number];
  size: [number, number, number];
}

const FRAME_PIECES: Array<FramePiece> = [
  // 4 vertical posts
  { position: [-POST_X, POST_HEIGHT / 2, -POST_Z], size: [BEAM_T, POST_HEIGHT, BEAM_T] },
  { position: [-POST_X, POST_HEIGHT / 2, POST_Z], size: [BEAM_T, POST_HEIGHT, BEAM_T] },
  { position: [POST_X, POST_HEIGHT / 2, -POST_Z], size: [BEAM_T, POST_HEIGHT, BEAM_T] },
  { position: [POST_X, POST_HEIGHT / 2, POST_Z], size: [BEAM_T, POST_HEIGHT, BEAM_T] },
  // 2 top rails running along X (front and back) — strings hang from these
  { position: [0, POST_HEIGHT, -POST_Z], size: [BEAM_WIDTH, BEAM_T, BEAM_T] },
  { position: [0, POST_HEIGHT, POST_Z], size: [BEAM_WIDTH, BEAM_T, BEAM_T] },
  // 2 top connector bars running along Z (left and right)
  { position: [-POST_X, POST_HEIGHT, 0], size: [BEAM_T, BEAM_T, BEAM_DEPTH] },
  { position: [POST_X, POST_HEIGHT, 0], size: [BEAM_T, BEAM_T, BEAM_DEPTH] },
];
</script>

<template>
  <TresGroup>
    <TresMesh v-for="(piece, i) in FRAME_PIECES" :key="i" :position="piece.position">
      <TresBoxGeometry :args="piece.size" />
      <TresMeshStandardMaterial color="#888899" :metalness="0.8" :roughness="0.2" />
    </TresMesh>
  </TresGroup>
</template>
