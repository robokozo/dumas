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
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: "/", component: HomePage }, ...routes],
});
