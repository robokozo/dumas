export interface DebrisConfig {
  id: number;
  x: number;
  z: number;
  size: number;
  color: string;
  tumbleSpeedX: number;
  tumbleSpeedY: number;
  tumbleSpeedZ: number;
  type: "rock" | "panel" | "hull" | "crystal";
}
