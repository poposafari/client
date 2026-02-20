import { GameScene } from '@poposafari/scenes';
import type { InitPosConfig } from '../maps/door';
import { DOOR, INIT_POS, OVERWORLD_DOOR, OVERWORLD_INIT_POS } from '../maps/door';
import { BaseObject } from './base.object';
import { SFX, TEXTCOLOR, TEXTSTYLE, TEXTURE } from '@poposafari/types';

export const DoorAudio: Record<string, SFX> = {
  door0: SFX.DOOR_0,
  door2: SFX.DOOR_1,
  door3: SFX.DOOR_2,
};

export class DoorObject extends BaseObject {
  private readonly destId: INIT_POS;
  private readonly initPosConfig: InitPosConfig;
  private readonly offsetY: number;
  private readonly textureKey: string;

  private triggered = false;

  constructor(scene: GameScene, doorKey: DOOR, destId: INIT_POS) {
    const config = OVERWORLD_DOOR[doorKey];
    if (!config) {
      throw new Error(`Door config not found: ${doorKey}`);
    }
    const initPos = OVERWORLD_INIT_POS[destId];
    if (!initPos) {
      throw new Error(`InitPos config not found: ${destId}`);
    }

    super(
      scene,
      config.door,
      config.x,
      config.y,
      { text: config.name, color: TEXTCOLOR.YELLOW },
      80,
    );

    this.destId = destId;
    this.initPosConfig = { ...initPos };
    this.offsetY = config.offsetY;
    this.textureKey = config.door;

    this.refreshPosition();

    const dw = config.displayWidth;
    const dh = config.displayHeight;
    if (dw != null && dh != null && dw > 0 && dh > 0) {
      this.getSprite().setDisplaySize(dw, dh);
    }

    this.shadow.setVisible(false);
  }

  getDestId(): INIT_POS {
    return this.destId;
  }

  getOffsetY(): number {
    return this.offsetY;
  }

  trigger(): Promise<InitPosConfig | null> {
    if (this.triggered) {
      return Promise.resolve(null);
    }

    this.triggered = true;
    const result: InitPosConfig = { ...this.initPosConfig };

    if (this.textureKey === TEXTURE.BLANK) {
      this.playAudio();

      return Promise.resolve(result);
    }

    this.playAudio();
    this.getSprite().play(this.textureKey);
    return new Promise((resolve) => {
      this.getSprite().once('animationcomplete', () => resolve(result));
    });
  }

  playAudio(): void {
    let audio: SFX = SFX.DOOR_2;

    if (this.textureKey === 'blank') {
      audio = SFX.DOOR_0;
    } else if (this.textureKey === 'door0') {
      audio = SFX.DOOR_1;
    }

    this.scene.getAudio().playEffect(audio);
  }

  resetTrigger(): void {
    this.triggered = false;
  }

  override refreshPosition(): void {
    const { x, y } = this.getTilePos();
    const baseY = this.tileY * 48 + 48;
    const baseX = this.tileX * 48 + 24;
    this.getSprite().setPosition(Math.round(baseX), Math.round(baseY) + this.offsetY);
    this.getSprite().setDepth(this.tileY);
    this.name.setPosition(Math.round(baseX), Math.round(baseY) - this.nameOffsetY);
    this.name.setDepth(this.tileY + 1);
  }
}
