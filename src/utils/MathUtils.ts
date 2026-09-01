export class MathUtils {
  public static clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }

  public static lerp(start: number, end: number, amt: number): number {
    return (1 - amt) * start + amt * end;
  }

  public static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  public static radToDeg(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  public static checkAABBCollision(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }
}
