<template>
  <div class="sample-layout">
    <slot name="scene" />
    <div class="hud">
      <slot name="hud" />
    </div>
  </div>
</template>

<style scoped>
.sample-layout {
  position: relative;
  height: 100%;
  width: 100%;
}

.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
