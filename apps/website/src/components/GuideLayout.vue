<script setup lang="ts">
import { ref } from "vue";

const isOpen = ref(window.innerWidth >= 768);

function togglePanel(): void {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <div class="page" :class="{ 'page--collapsed': isOpen === false }">
    <div class="demo">
      <slot name="demo" />
      <button
        class="toggle"
        :aria-label="isOpen === true ? 'Hide docs' : 'Show docs'"
        @click="() => togglePanel()"
      >
        {{ isOpen === true ? "›" : "‹" }}
      </button>
    </div>
    <div class="content">
      <div class="content__scroll">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  overflow: hidden;
  font-family: sans-serif;
  color: #eee;
  background: #111;
}

.page--collapsed {
  grid-template-columns: 1fr 0fr;
}

.demo {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.toggle {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 10;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: background 0.15s;
}

.toggle:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* overflow:hidden + min-width:0 allows the grid to compress this to 0fr cleanly. */
.content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

/* min-height:0 is required for a flex child with overflow-y:auto to scroll
   rather than expand the parent. */
.content__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 2.5rem 2rem;
}

.content__scroll :deep(h1) {
  font-size: 1.5rem;
  margin: 0 0 0.75rem;
}

.content__scroll :deep(h2) {
  font-size: 1rem;
  margin: 1.75rem 0 0.4rem;
  color: #fff;
}

.content__scroll :deep(p) {
  font-size: 0.875rem;
  color: #999;
  line-height: 1.6;
  margin: 0;
}

.content__scroll :deep(code) {
  background: rgba(255, 255, 255, 0.07);
  padding: 0.1em 0.35em;
  border-radius: 4px;
  font-size: 0.85em;
  color: #4af;
}

.content__scroll :deep(.code-wrap) {
  margin-top: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.content__scroll :deep(ul) {
  font-size: 0.875rem;
  color: #999;
  line-height: 1.8;
  padding-left: 1.25rem;
  margin: 0;
}

.content__scroll :deep(a) {
  color: #4af;
  text-decoration: none;
}

.content__scroll :deep(a:hover) {
  text-decoration: underline;
}
</style>
