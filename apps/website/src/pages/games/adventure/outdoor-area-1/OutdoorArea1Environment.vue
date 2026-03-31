<script setup lang="ts">
const emit = defineEmits<{
  groundClick: [pos: { x: number; z: number }];
}>();

function onGroundClick({ point }: { point: { x: number; y: number; z: number } }): void {
  emit("groundClick", { x: point.x, z: point.z });
}
</script>

<template>
  <!-- Ground plane — full clickable floor -->
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" @click="(e) => onGroundClick(e)">
    <TresPlaneGeometry :args="[30, 30]" />
    <TresMeshStandardMaterial color="#1a2030" />
  </TresMesh>

  <!-- Ground detail patches for visual depth -->
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

  <!-- Trees -->
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

  <!-- Rocks -->
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
</template>
