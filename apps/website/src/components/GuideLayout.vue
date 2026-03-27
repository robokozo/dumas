<script setup lang="ts"></script>

<template>
  <div class="page">
    <div class="demo">
      <slot name="demo" />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  font-family: sans-serif;
  color: #eee;
  background: #111;
}

.demo {
  height: 100%;
}

.content {
  padding: 2.5rem 2rem;
  overflow-y: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.content :deep(h1) {
  font-size: 1.5rem;
  margin: 0 0 0.75rem;
}

.content :deep(h2) {
  font-size: 1rem;
  margin: 1.75rem 0 0.4rem;
  color: #fff;
}

.content :deep(p) {
  font-size: 0.875rem;
  color: #999;
  line-height: 1.6;
  margin: 0;
}

.content :deep(code) {
  background: rgba(255, 255, 255, 0.07);
  padding: 0.1em 0.35em;
  border-radius: 4px;
  font-size: 0.85em;
  color: #4af;
}

.content :deep(.code-wrap) {
  margin-top: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
