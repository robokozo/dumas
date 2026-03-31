<script setup lang="ts">
import InteractionModal from "./InteractionModal.vue";
import type { AdventureContext } from "./useAdventureContext";

const props = defineProps<{ ctx: AdventureContext }>();
const { ctx } = props;
</script>

<template>
  <!-- Nearby item prompt -->
  <div v-if="ctx.nearbyItem.value !== null && ctx.activeItemId.value === null" class="prompt">
    <span class="prompt__label">{{ ctx.nearbyItem.value.label }}</span>
    <button
      class="prompt__btn"
      @click="
        () =>
          ctx.openItem({
            id: ctx.nearbyItem.value!.id,
            label: ctx.nearbyItem.value!.label,
            interactions: ctx.nearbyItem.value!.interactions,
          })
      "
    >
      Interact
    </button>
  </div>

  <!-- Interaction modal -->
  <InteractionModal
    v-if="ctx.activeItemId.value !== null && ctx.activeItemLabel.value !== null"
    :label="ctx.activeItemLabel.value"
    :interactions="ctx.activeItemInteractions.value"
    :response="ctx.activeItemResponse.value"
    @select="(response) => ctx.selectResponse({ response })"
    @back="() => ctx.goBack()"
    @close="() => ctx.closeItem()"
  />
</template>

<style scoped>
.prompt {
  position: absolute;
  bottom: 3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 0.5rem 0.75rem 0.5rem 1rem;
  font-family: sans-serif;
  backdrop-filter: blur(6px);
  pointer-events: auto;
}

.prompt__label {
  font-size: 0.85rem;
  color: #ddd;
  white-space: nowrap;
}

.prompt__btn {
  background: rgba(68, 170, 255, 0.18);
  border: 1px solid rgba(68, 170, 255, 0.4);
  border-radius: 5px;
  color: #4af;
  font-size: 0.8rem;
  padding: 0.25rem 0.65rem;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.prompt__btn:hover {
  background: rgba(68, 170, 255, 0.32);
}
</style>
