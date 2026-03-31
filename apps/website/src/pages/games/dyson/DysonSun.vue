<script setup lang="ts">
const emit = defineEmits<{
  clicked: [];
}>();
</script>

<template>
  <!-- Sun glow (point light) -->
  <TresPointLight :position="[0, 0.5, 0]" :intensity="8" :distance="30" color="#ffcc44" />
  <TresPointLight :position="[0, 0.5, 0]" :intensity="3" :distance="15" color="#ff6600" />

  <!-- Clickable sun sphere -->
  <TresMesh :position="[0, 0.5, 0]" @click.stop="() => emit('clicked')">
    <TresSphereGeometry :args="[1.2, 24, 24]" />
    <TresMeshStandardMaterial color="#ffaa00" :emissive="'#ffaa00'" :emissive-intensity="2" />
  </TresMesh>

  <!-- Outer glow shell -->
  <TresMesh :position="[0, 0.5, 0]">
    <TresSphereGeometry :args="[1.6, 16, 16]" />
    <TresMeshStandardMaterial
      color="#ff8800"
      :emissive="'#ff6600'"
      :emissive-intensity="1.5"
      :transparent="true"
      :opacity="0.15"
    />
  </TresMesh>
</template>
