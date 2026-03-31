import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomePage from "../pages/home/HomePage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/guides/game-setup",
    component: () => import("../pages/guides/gameSetup/GameSetupPage.vue"),
  },
  {
    path: "/guides/use-ecs-component",
    component: () => import("../pages/guides/useEcsComponent/UseEcsComponentPage.vue"),
  },
  {
    path: "/guides/scene-switching",
    component: () => import("../pages/guides/sceneSwitching/SceneSwitchingPage.vue"),
  },
  {
    path: "/guides/physics",
    component: () => import("../pages/guides/physics/PhysicsPage.vue"),
  },
  {
    path: "/guides/use-input",
    component: () => import("../pages/guides/useInput/UseInputPage.vue"),
  },
  {
    path: "/advanced/scene-switching",
    component: () => import("../pages/advanced/sceneSwitching/RoomsPage.vue"),
  },
  {
    path: "/guides/object-pooling",
    component: () => import("../pages/guides/usePool/UsePoolPage.vue"),
  },
  {
    path: "/guides/use-pointer",
    component: () => import("../pages/guides/usePointer/UsePointerPage.vue"),
  },
  {
    path: "/guides/use-collision",
    component: () => import("../pages/guides/useCollision/UseCollisionPage.vue"),
  },
  {
    path: "/guides/use-collision-ecs",
    component: () => import("../pages/guides/useCollision/UseCollisionEcsPage.vue"),
  },
  {
    path: "/guides/use-character-controller",
    component: () =>
      import("../pages/guides/useCharacterController/UseCharacterControllerPage.vue"),
  },
  {
    path: "/guides/use-sensor",
    component: () => import("../pages/guides/useSensor/UseSensorPage.vue"),
  },
  {
    path: "/guides/use-raycast",
    component: () => import("../pages/guides/useRaycast/UseRaycastPage.vue"),
  },
  {
    path: "/guides/collision-groups",
    component: () => import("../pages/guides/collisionGroups/CollisionGroupsPage.vue"),
  },
  {
    path: "/guides/use-observer",
    component: () => import("../pages/guides/useObserver/UseObserverPage.vue"),
  },
  {
    path: "/guides/define-tag",
    component: () => import("../pages/guides/defineTag/DefineTagPage.vue"),
  },
  {
    path: "/guides/transform-helpers",
    component: () => import("../pages/guides/transformHelpers/TransformHelpersPage.vue"),
  },
  {
    path: "/guides/use-world-to-screen",
    component: () => import("../pages/guides/useWorldToScreen/UseWorldToScreenPage.vue"),
  },
  {
    path: "/guides/trigger-zones",
    component: () => import("../pages/guides/triggerZones/TriggerZonesPage.vue"),
  },
  {
    path: "/guides/use-entity-ref",
    component: () => import("../pages/guides/useEntityRef/UseEntityRefPage.vue"),
  },
  {
    path: "/guides/define-prefab",
    component: () => import("../pages/guides/definePrefab/DefinePrefabPage.vue"),
  },
  {
    path: "/guides/use-joint",
    component: () => import("../pages/guides/useJoint/UseJointPage.vue"),
  },
  {
    path: "/guides/relationships",
    component: () => import("../pages/guides/relationships/RelationshipsPage.vue"),
  },
  {
    path: "/games/coin-pusher",
    component: () => import("../pages/games/coinPusher/CoinPusherPage.vue"),
  },
  {
    path: "/games/adventure",
    component: () => import("../pages/games/adventure/AdventurePage.vue"),
  },
  {
    path: "/games/dungeon",
    component: () => import("../pages/games/dungeon/DungeonPage.vue"),
  },
  {
    path: "/games/dyson",
    component: () => import("../pages/games/dyson/DysonPage.vue"),
  },
  {
    path: "/games/quick-drop",
    component: () => import("../pages/games/quickDrop/QuickDropPage.vue"),
  },
  {
    path: "/games/tower-defense",
    component: () => import("../pages/games/towerDefense/TowerDefensePage.vue"),
  },
  {
    path: "/games/fishing",
    component: () => import("../pages/games/fishing/FishingPage.vue"),
  },
  {
    path: "/games/puzzle-platformer",
    component: () => import("../pages/games/puzzlePlatformer/PuzzlePlatformerPage.vue"),
  },
  {
    path: "/games/space-debris",
    component: () => import("../pages/games/spaceDebris/SpaceDebrisPage.vue"),
  },
  {
    path: "/games/arena-brawler",
    component: () => import("../pages/games/arenaBrawler/ArenaBrawlerPage.vue"),
  },
  {
    path: "/games/marble-run",
    component: () => import("../pages/games/marbleRun/MarbleRunPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: "/", component: HomePage }, ...routes],
});
