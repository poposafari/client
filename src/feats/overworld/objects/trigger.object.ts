import type { TriggerConfig } from '@poposafari/core/map.registry';

/**
 * 트리거 객체. 플레이어가 (tileX, tileY)에 서 있으면 등록된 콜백이 실행됨.
 * MapConfig.triggers로 설정하고, MapView.setup() 시점에 맵에 생성됨.
 */
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

  /** 한 번 발동 후 다시 발동 가능하도록 초기화 */
  resetTrigger(): void {
    this.triggered = false;
  }

  /** 플레이어가 이 트리거 타일 위에 있는지 */
  isPlayerOnTrigger(playerTileX: number, playerTileY: number): boolean {
    return (
      Math.floor(playerTileX) === this.tileX && Math.floor(playerTileY) === this.tileY
    );
  }

  /** 발동 가능 여부 (위치 일치 && (반복 가능 || 아직 미발동)) */
  canFire(playerTileX: number, playerTileY: number): boolean {
    if (!this.isPlayerOnTrigger(playerTileX, playerTileY)) return false;
    if (!this.oneShot) return true;
    return !this.triggered;
  }
}
