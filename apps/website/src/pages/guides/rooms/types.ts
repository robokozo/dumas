export type Direction = "north" | "south" | "east" | "west";
export type EntryPoint = "center" | `from-${Direction}`;

export interface Exits {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
}

export interface RoomTheme {
  floor: string;
  wall: string;
  pillar: string;
  ambientColor: string;
  ambientIntensity: number;
  lightColor: string;
  lightIntensity: number;
  torchColor: string;
  torchIntensity: number;
}
