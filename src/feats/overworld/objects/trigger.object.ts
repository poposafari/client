import type { TriggerConfig } from '@poposafari/core/map.registry';

export class TriggerObject {
  private readonly tileX: number;
  private readonly tileY: number;
  private readonly type: string;
  private readonly params: Record<string, unknown>;
  private readonly oneShot: boolean;
  private triggered = false;

  constructor(config: TriggerConfig) {
    this.tileX = Math.floor(config.tileX);
    this.tileY = Math.floor(config.tileY);
    this.type = config.type;
    this.params = { ...config.params };
    this.oneShot = config.oneShot !== false;
  }

  getTileX(): number {
    return this.tileX;
  }

  getTileY(): number {
    return this.tileY;
  }

  getType(): string {
    return this.type;
  }

  getParams(): Record<string, unknown> {
    return this.params;
  }

  isOneShot(): boolean {
    return this.oneShot;
  }

  isTriggered(): boolean {
    return this.triggered;
  }

  setTriggered(value: boolean): void {
    this.triggered = value;
  }

  resetTrigger(): void {
    this.triggered = false;
  }

  isPlayerOnTrigger(playerTileX: number, playerTileY: number): boolean {
    return Math.floor(playerTileX) === this.tileX && Math.floor(playerTileY) === this.tileY;
  }

  canFire(playerTileX: number, playerTileY: number): boolean {
    if (!this.isPlayerOnTrigger(playerTileX, playerTileY)) return false;
    if (!this.oneShot) return true;
    return !this.triggered;
  }
}
