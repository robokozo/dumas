<script setup lang="ts">
import { useGLTF, OrbitControls } from "@tresjs/cientos";
interface ControlsWithCamera {
  object: { position: { x: number; y: number; z: number } };
  target: { x: number; y: number; z: number };
}

const GROUND_ROTATION_X = -Math.PI / 2;

const { state } = useGLTF(`${import.meta.env.BASE_URL}models/Mage.glb`);

const emit = defineEmits<{
  cameraChange: [px: number, py: number, pz: number, tx: number, ty: number, tz: number];
}>();

function onControlsChange(controls: ControlsWithCamera): void {
  const { x: px, y: py, z: pz } = controls.object.position;
  const { x: tx, y: ty, z: tz } = controls.target;
  emit(
    "cameraChange",
    +px.toFixed(2),
    +py.toFixed(2),
    +pz.toFixed(2),
    +tx.toFixed(2),
    +ty.toFixed(2),
    +tz.toFixed(2),
  );
}
</script>

<template>
  <TresPerspectiveCamera :position="[0, 2.5, 6]" :look-at="[0, 2, -0.5]" />
  <OrbitControls @change="(controls) => onControlsChange(controls)" />
  <TresAmbientLight :intensity="0.5" />
  <TresDirectionalLight :position="[3, 8, 5]" :intensity="1.5" cast-shadow />
  <TresDirectionalLight :position="[-3, 4, -4]" :intensity="0.3" />

  <TresMesh :rotation="[GROUND_ROTATION_X, 0, 0]">
    <TresPlaneGeometry :args="[10, 10]" />
    <TresMeshStandardMaterial color="#222" />
  </TresMesh>

  <primitive v-if="state !== null" :object="state!.scene" />
</template>
