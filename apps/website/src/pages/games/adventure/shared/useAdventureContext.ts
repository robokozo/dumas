import { inject, provide, ref } from "vue";
import { TRANSFORM_TYPE, useGame } from "@dumas/core";
import type { TransformStore } from "@dumas/core";
import type { Ref } from "vue";
import type { Interaction } from "./types";

export interface AdventureContext {
  charEid: Ref<number | null>;
  targetX: Ref<number>;
  targetZ: Ref<number>;
  isMoving: Ref<boolean>;
  activeItemId: Ref<string | null>;
  activeItemLabel: Ref<string | null>;
  activeItemInteractions: Ref<Array<Interaction>>;
  activeItemResponse: Ref<string | null>;
  nearbyItem: Ref<{ id: string; label: string; interactions: Array<Interaction> } | null>;
  pendingItemId: Ref<string | null>;
  getCharPos(): { x: number; z: number };
  walkToItem(params: {
    x: number;
    z: number;
    id: string;
    label: string;
    interactions: Array<Interaction>;
  }): void;
  openItem(params: { id: string; label: string; interactions: Array<Interaction> }): void;
  closeItem(): void;
  openPendingItem(): void;
  selectResponse(params: { response: string }): void;
  goBack(): void;
}

const ADVENTURE_KEY = Symbol("adventure");

export function provideAdventureContext(): AdventureContext {
  const { storeRegistry } = useGame();

  const charEid = ref<number | null>(null);
  const targetX = ref(0);
  const targetZ = ref(0);
  const isMoving = ref(false);
  const nearbyItem = ref<{ id: string; label: string; interactions: Array<Interaction> } | null>(
    null,
  );
  const pendingItemId = ref<string | null>(null);
  const pendingItemLabel = ref<string | null>(null);
  const pendingItemInteractions = ref<Array<Interaction>>([]);
  const activeItemId = ref<string | null>(null);
  const activeItemLabel = ref<string | null>(null);
  const activeItemInteractions = ref<Array<Interaction>>([]);
  const activeItemResponse = ref<string | null>(null);

  function getCharPos(): { x: number; z: number } {
    if (charEid.value === null) return { x: 0, z: 0 };
    const store = storeRegistry.get(TRANSFORM_TYPE) as TransformStore | undefined;
    if (store === undefined) return { x: 0, z: 0 };
    return {
      x: store.posX[charEid.value]?.value ?? 0,
      z: store.posZ[charEid.value]?.value ?? 0,
    };
  }

  function walkToItem({
    x,
    z,
    id,
    label,
    interactions,
  }: {
    x: number;
    z: number;
    id: string;
    label: string;
    interactions: Array<Interaction>;
  }): void {
    targetX.value = x;
    targetZ.value = z;
    isMoving.value = true;
    pendingItemId.value = id;
    pendingItemLabel.value = label;
    pendingItemInteractions.value = interactions;
  }

  function openItem({
    id,
    label,
    interactions,
  }: {
    id: string;
    label: string;
    interactions: Array<Interaction>;
  }): void {
    activeItemId.value = id;
    activeItemLabel.value = label;
    activeItemInteractions.value = interactions;
    activeItemResponse.value = null;
    pendingItemId.value = null;
  }

  function closeItem(): void {
    activeItemId.value = null;
    activeItemLabel.value = null;
    activeItemInteractions.value = [];
    activeItemResponse.value = null;
  }

  function selectResponse({ response }: { response: string }): void {
    activeItemResponse.value = response;
  }

  function openPendingItem(): void {
    if (pendingItemId.value === null || pendingItemLabel.value === null) return;
    openItem({
      id: pendingItemId.value,
      label: pendingItemLabel.value,
      interactions: pendingItemInteractions.value,
    });
  }

  function goBack(): void {
    activeItemResponse.value = null;
  }

  const ctx: AdventureContext = {
    charEid,
    targetX,
    targetZ,
    isMoving,
    nearbyItem,
    pendingItemId,
    activeItemId,
    activeItemLabel,
    activeItemInteractions,
    activeItemResponse,
    getCharPos,
    walkToItem,
    openItem,
    closeItem,
    openPendingItem,
    selectResponse,
    goBack,
  };

  provide(ADVENTURE_KEY, ctx);
  return ctx;
}

export function injectAdventureContext(): AdventureContext {
  const ctx = inject<AdventureContext>(ADVENTURE_KEY);
  if (ctx === undefined) throw new Error("AdventureContext not provided");
  return ctx;
}
