<script setup lang="ts">
import { ref } from "vue";
import SiteCanvas from "../../../components/SiteCanvas.vue";
import DemoLayout from "../layout/DemoLayout.vue";
import DialogDemoScene from "./DialogDemoScene.vue";
import GameDialog from "./GameDialog.vue";

interface DialogContent {
  title: string;
  body: string;
}

const activeDialog = ref<DialogContent | null>(null);
</script>

<template>
  <DemoLayout>
    <template #scene>
      <SiteCanvas clear-color="#111814" render-mode="always">
        <DialogDemoScene
          @enter-zone="
            (content) => {
              activeDialog = content;
            }
          "
          @exit-zone="() => {}"
        />
      </SiteCanvas>
    </template>
    <template #hud>
      <Transition name="dialog">
        <GameDialog
          v-if="activeDialog !== null"
          :title="activeDialog.title"
          :body="activeDialog.body"
          @close="activeDialog = null"
        />
      </Transition>
      <p class="hint">WASD · walk into a glowing marker to interact · Esc to close</p>
    </template>
  </DemoLayout>
</template>

<style scoped>
.hint {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  color: rgba(255, 255, 255, 0.28);
  font-family: sans-serif;
  font-size: 0.72rem;
  white-space: nowrap;
  pointer-events: none;
}

.dialog-enter-active,
.dialog-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
