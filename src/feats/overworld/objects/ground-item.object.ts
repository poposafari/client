import { GameScene } from '@poposafari/scenes';
import { TEXTCOLOR, TEXTURE } from '@poposafari/types';
import { DIRECTION } from '../overworld.constants';
import { InteractiveObject } from './interactive.object';

export class GroundItemObject extends InteractiveObject {
  private readonly uid: string;
  private readonly itemId: string;

  constructor(scene: GameScene, uid: string, itemId: string, tileX: number, tileY: number) {
    super(scene, TEXTURE.GROUND_ITEM, tileX, tileY, { text: 'blank', color: TEXTCOLOR.WHITE }, 0);
    this.uid = uid;
    this.itemId = itemId;

    // 이름 라벨 숨김 (ground item은 라벨이 필요 없음)
    this.name.setVisible(false);
    this.sprite.setScale(1.4);
    // 그림자: sprite 가로폭에 비례시키되 원본 종횡비는 보존(납작한 타원 유지).
    this.shadow.setVisible(true);
    const shadowWidth = this.sprite.displayWidth * 0.9;
    const ratio = this.shadow.height / this.shadow.width;
    this.shadow.displayWidth = shadowWidth;
    this.shadow.displayHeight = shadowWidth * ratio;
  }

  getUid(): string {
    return this.uid;
  }

  getItemId(): string {
    return this.itemId;
  }

  override getPhaseRequest(): string | null {
    return null;
  }

  override reaction(_direction: DIRECTION) {
    return [];
  }
}
