export interface DemoEntry {
  slug: string;
  title: string;
  feature: string;
  description: string;
}

export const DEMOS: Array<DemoEntry> = [
  {
    slug: "world-setup",
    title: "World Setup",
    feature: "DumasCanvas + GameObject",
    description:
      "Initialize a physics world and place entities in 3D space with position, rotation, and scale.",
  },
  {
    slug: "rigid-body",
    title: "Rigid Body",
    feature: "RigidBody",
    description:
      "Attach physics bodies to entities. Choose between dynamic, fixed, and kinematic body types.",
  },
  {
    slug: "colliders",
    title: "Colliders",
    feature: "Collider",
    description:
      "Add collision shapes to physics bodies. Configure restitution, friction, and density.",
  },
  {
    slug: "collision-events",
    title: "Collision Events",
    feature: "useCollisionHandler",
    description: "React to collision events between entities with started and stopped callbacks.",
  },
  {
    slug: "custom-systems",
    title: "Custom Systems",
    feature: "useSystem",
    description: "Register per-frame update loops with delta time for custom game logic.",
  },
  {
    slug: "joints",
    title: "Joints",
    feature: "useJoint",
    description:
      "Connect rigid bodies with constraints like revolute, fixed, and spherical joints.",
  },
  {
    slug: "object-pooling",
    title: "Object Pooling",
    feature: "useObjectPool",
    description: "Pre-allocate and recycle entities for performant spawning and despawning.",
  },
  {
    slug: "cannon-wall",
    title: "Cannon Wall",
    feature: "Combined",
    description: "A complete example combining rigid bodies, colliders, pooling, and systems.",
  },
  {
    slug: "player-input",
    title: "Player Input",
    feature: "useInput + useActionMap",
    description:
      "Bind keyboard or gamepad to a standard hardware layout, then map to game-specific actions. Supports multiple players with independent configurations.",
  },
];

export function getDemoBySlug({ slug }: { slug: string }): DemoEntry | null {
  return DEMOS.find((d) => d.slug === slug) ?? null;
}

export function getAdjacentDemos({ slug }: { slug: string }): {
  prev: DemoEntry | null;
  next: DemoEntry | null;
} {
  const index = DEMOS.findIndex((d) => d.slug === slug);
  return {
    prev: index > 0 ? DEMOS[index - 1] : null,
    next: index < DEMOS.length - 1 ? DEMOS[index + 1] : null,
  };
}
