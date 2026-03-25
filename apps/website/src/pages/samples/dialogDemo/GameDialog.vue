<script setup lang="ts">
import { useEventListener } from "@vueuse/core";

const props = defineProps<{
  title: string;
  body: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

useEventListener(window, "keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    emit("close");
  }
});
</script>

<template>
  <div
    class="overlay"
    @click.self="emit('close')"
    role="dialog"
    :aria-label="props.title"
    aria-modal="true"
  >
    <div class="dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ title }}</h2>
        <button class="dialog-close" @click="emit('close')" aria-label="Close">✕</button>
      </div>
      <p class="dialog-body">{{ body }}</p>
      <div class="dialog-footer">
        <button class="dialog-btn" @click="emit('close')">Continue</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  pointer-events: auto;
}

.dialog {
  background: #1a1f1a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 1.75rem 2rem;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  font-family: sans-serif;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.dialog-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f0f0e8;
  letter-spacing: 0.01em;
}

.dialog-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s;
}

.dialog-close:hover {
  color: rgba(255, 255, 255, 0.75);
}

.dialog-body {
  margin: 0 0 1.5rem;
  font-size: 0.88rem;
  line-height: 1.65;
  color: rgba(220, 220, 210, 0.75);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.dialog-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: #f0f0e8;
  font-size: 0.85rem;
  font-family: sans-serif;
  padding: 0.45rem 1.1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.dialog-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}
</style>
