<script setup lang="ts">
import type { Interaction } from "./types";

const props = defineProps<{
  label: string;
  interactions: Array<Interaction>;
  response: string | null;
}>();

const emit = defineEmits<{
  select: [response: string];
  back: [];
  close: [];
}>();
</script>

<template>
  <div class="modal-backdrop" @click.self="() => emit('close')">
    <div class="modal">
      <div class="modal__header">
        <span class="modal__title">{{ props.label }}</span>
        <button class="modal__close" aria-label="Close" @click="() => emit('close')">✕</button>
      </div>

      <div class="modal__body">
        <!-- Option list -->
        <div v-if="props.response === null" class="modal__options">
          <button
            v-for="interaction in props.interactions"
            :key="interaction.label"
            class="modal__option"
            @click="() => emit('select', interaction.response)"
          >
            {{ interaction.label }}
          </button>
        </div>

        <!-- Response view -->
        <div v-else class="modal__response">
          <p class="modal__response-text">{{ props.response }}</p>
          <button class="modal__back" @click="() => emit('back')">← Back</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.52);
  pointer-events: auto;
}

.modal {
  background: #181c28;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  width: min(380px, 90vw);
  overflow: hidden;
  font-family: sans-serif;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal__title {
  font-size: 1rem;
  color: #fff;
  font-weight: 600;
}

.modal__close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  transition: color 0.15s;
}

.modal__close:hover {
  color: #fff;
}

.modal__body {
  padding: 1rem 1.25rem;
}

.modal__options {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.modal__option {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 7px;
  color: #d8d8d8;
  font-size: 0.875rem;
  padding: 0.6rem 0.9rem;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.modal__option:hover {
  background: rgba(68, 170, 255, 0.1);
  border-color: rgba(68, 170, 255, 0.3);
  color: #fff;
}

.modal__response {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal__response-text {
  font-size: 0.875rem;
  color: #bbb;
  line-height: 1.65;
  margin: 0;
  font-style: italic;
}

.modal__back {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: color 0.15s;
}

.modal__back:hover {
  color: #fff;
}
</style>
