<script setup lang="ts">
import { useGame } from "@dumas/core";
import { entryPoint } from "./state";
import type { Direction, Exits } from "./types";

const { exits, label } = defineProps<{
  exits: Exits;
  label: string;
}>();

const { loadScene } = useGame();

const OPPOSITE: Record<Direction, Direction> = {
  north: "south",
  south: "north",
  east: "west",
  west: "east",
};

function navigate({ direction, to }: { direction: Direction; to: string }): void {
  entryPoint.value = `from-${OPPOSITE[direction]}`;
  void loadScene({ name: to });
}
</script>

<template>
  <div class="nav">
    <button
      v-if="exits.north !== undefined"
      class="nav__btn nav__n"
      @click="navigate({ direction: 'north', to: exits.north })"
    >
      ↑
    </button>
    <button
      v-if="exits.west !== undefined"
      class="nav__btn nav__w"
      @click="navigate({ direction: 'west', to: exits.west })"
    >
      ←
    </button>
    <span class="nav__label">{{ label }}</span>
    <button
      v-if="exits.east !== undefined"
      class="nav__btn nav__e"
      @click="navigate({ direction: 'east', to: exits.east })"
    >
      →
    </button>
    <button
      v-if="exits.south !== undefined"
      class="nav__btn nav__s"
      @click="navigate({ direction: 'south', to: exits.south })"
    >
      ↓
    </button>
  </div>
</template>

<style scoped>
.nav {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: 2.2rem 5rem 2.2rem;
  grid-template-rows: 2.2rem 2.2rem 2.2rem;
  gap: 0.2rem;
  align-items: center;
  justify-items: center;
  pointer-events: auto;
}

.nav__n {
  grid-area: 1 / 2;
}
.nav__w {
  grid-area: 2 / 1;
}
.nav__label {
  grid-area: 2 / 2;
  color: rgba(210, 170, 70, 0.9);
  font-family: serif;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
}
.nav__e {
  grid-area: 2 / 3;
}
.nav__s {
  grid-area: 3 / 2;
}

.nav__btn {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(210, 170, 70, 0.35);
  color: rgba(210, 170, 70, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__btn:hover {
  background: rgba(210, 170, 70, 0.15);
  color: rgba(235, 195, 95, 1);
  border-color: rgba(210, 170, 70, 0.6);
}
</style>
