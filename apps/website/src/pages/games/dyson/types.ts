export interface Orbiter {
  id: number;
  type: "collector" | "swarm" | "station";
  orbitRadius: number;
  orbitSpeed: number;
  startAngle: number;
  energyPerSecond: number;
}

export interface BuildOption {
  type: "collector" | "swarm" | "station";
  label: string;
  cost: number;
  energyPerSecond: number;
  orbitRadius: number;
  color: string;
}

export const BUILD_OPTIONS: Array<BuildOption> = [
  {
    type: "collector",
    label: "Solar Collector",
    cost: 10,
    energyPerSecond: 1,
    orbitRadius: 3,
    color: "#60a0ff",
  },
  {
    type: "swarm",
    label: "Dyson Swarm Segment",
    cost: 50,
    energyPerSecond: 5,
    orbitRadius: 5,
    color: "#ffa040",
  },
  {
    type: "station",
    label: "Space Station",
    cost: 250,
    energyPerSecond: 25,
    orbitRadius: 8,
    color: "#c0c0d0",
  },
] satisfies Array<BuildOption>;
