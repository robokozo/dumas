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
    path: "/guides/use-collision",
    component: () => import("../pages/guides/useCollision/UseCollisionPage.vue"),
  },
  {
    path: "/guides/use-collision-ecs",
    component: () => import("../pages/guides/useCollision/UseCollisionEcsPage.vue"),
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
    path: "/games/coin-pusher",
    component: () => import("../pages/games/coinPusher/CoinPusherPage.vue"),
  },
  {
    path: "/games/adventure",
    component: () => import("../pages/games/adventure/AdventurePage.vue"),
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: "/", component: HomePage }, ...routes],
});
