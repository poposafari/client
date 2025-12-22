import i18next from 'i18next';
import { Event } from '../core/manager/event-manager';
import { AUDIO, DEPTH, EVENT, TEXTSTYLE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { playEffectSound, runFadeEffect, Ui } from './ui';
import { PlayerItem } from '../obj/player-item';
import { getItemTexture } from '../utils/string-util';

export class BagBaseUi extends Ui {
  protected descUi!: BagDescUi;
  protected pocketTitles: string[] = [i18next.t('menu:bag1'), i18next.t('menu:bag2'), i18next.t('menu:bag3'), i18next.t('menu:bag4'), i18next.t('menu:bag5')];

  private container!: Phaser.GameObjects.Container;
  private pocketContainer!: Phaser.GameObjects.Container;
  private pocketTitleContainer!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;

  private pocketTitleText!: Phaser.GameObjects.Text;
  private pocketSprites: Phaser.GameObjects.Sprite[] = [];
  private pokeballPocket!: Phaser.GameObjects.Sprite;
  private berryPocket!: Phaser.GameObjects.Sprite;
  private etcPocket!: Phaser.GameObjects.Sprite;
  private keyPocket!: Phaser.GameObjects.Sprite;
  private tmHmPocket!: Phaser.GameObjects.Sprite;

  constructor(scene: InGameScene) {
    super(scene);

    this.descUi = new BagDescUi(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();
    this.setupPocket(width, height);

    this.descUi.setup();
    this.container = this.createTrackedContainer(width / 2, height / 2);
    this.bg = this.addBackground(TEXTURE.BG_BAG).setOrigin(0.5, 0.5);

    this.container.add(this.bg);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE);
    this.container.setScrollFactor(0);
  }

  show(data?: any) {
    Event.emit(EVENT.DISABLE_DAY_NIGHT_FILTER);

    runFadeEffect(this.scene, 1000, 'in');

    this.container.setVisible(true);
    this.pocketContainer.setVisible(true);
    this.pocketTitleContainer.setVisible(true);

    this.runPocketAnimation(0);
  }

  protected onClean(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
    if (this.pocketContainer) {
      this.pocketContainer.setVisible(false);
    }
    if (this.pocketTitleContainer) {
      this.pocketTitleContainer.setVisible(false);
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private setupPocket(width: number, height: number) {
    this.pocketContainer = this.createTrackedContainer(width / 2 - 960, height / 2 - 100);
    this.pocketTitleContainer = this.createTrackedContainer(width / 2 - 600, height / 2 + 100);

    const bar = this.addImage(TEXTURE.BLANK, 0, 0);
    const arrowLeft = this.addImage(TEXTURE.ARROW_R, -150, +15).setAngle(90).setScale(1.4);
    const arrowRight = this.addImage(TEXTURE.ARROW_R, +140, +15).setAngle(270).setFlipX(true).setScale(1.4);
    this.pocketTitleText = this.addText(0, +15, '', TEXTSTYLE.ONLY_WHITE).setScale(0.4).setStroke('#696969', 12);
    this.pocketTitleContainer.add(bar);
    this.pocketTitleContainer.add(this.pocketTitleText);
    this.pocketTitleContainer.add(arrowLeft);
    this.pocketTitleContainer.add(arrowRight);

    this.pokeballPocket = this.createSprite(TEXTURE.BAG_POCKET_BALL, 0, -290);
    this.etcPocket = this.createSprite(TEXTURE.BAG_POCKET_ETC, 0, -70);
    this.berryPocket = this.createSprite(TEXTURE.BAG_POCKET_BERRY, 140, -55);
    this.tmHmPocket = this.createSprite(TEXTURE.BAG_POCKET_TM_HM, 230, -160);
    this.keyPocket = this.createSprite(TEXTURE.BAG_POCKET_KEY, +240, -335);
    this.pocketSprites.push(this.pokeballPocket);
    this.pocketSprites.push(this.etcPocket);
    this.pocketSprites.push(this.berryPocket);
    this.pocketSprites.push(this.tmHmPocket);
    this.pocketSprites.push(this.keyPocket);
    this.pocketContainer.add(this.pokeballPocket);
    this.pocketContainer.add(this.etcPocket);
    this.pocketContainer.add(this.berryPocket);
    this.pocketContainer.add(this.keyPocket);
    this.pocketContainer.add(this.tmHmPocket);

    this.pocketContainer.setScale(1.3);
    this.pocketContainer.setVisible(false);
    this.pocketContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.pocketContainer.setScrollFactor(0);

    this.pocketTitleContainer.setScale(2.2);
    this.pocketTitleContainer.setVisible(false);
    this.pocketTitleContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.pocketTitleContainer.setScrollFactor(0);
  }

  private runPocketAnimation(current: number) {
    const pockets = ['ball', 'etc', 'berry', 'tms_hms', 'key'];

    playEffectSound(this.scene, AUDIO.SELECT_2);
    this.pocketTitleText.setText(this.pocketTitles[current]);
    this.pocketSprites[current].anims.play({
      key: `bag_pocket_${pockets[current]}`,
      repeat: 0,
      frameRate: 10,
      delay: 0,
    });
  }

  runSwitchPocketAnimation(prev: number, current: number) {
    const pockets = ['ball', 'etc', 'berry', 'tms_hms', 'key'];

    this.pocketSprites[prev].anims.playReverse({ key: `bag_pocket_${pockets[prev]}`, repeat: 0 });
    this.runPocketAnimation(current);
  }
}

export class BagDescUi extends Ui {
  private container!: Phaser.GameObjects.Container;

  private items: PlayerItem[] = [];
  private icon!: Phaser.GameObjects.Image;
  private text!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2 - 200, height / 2 + 400);

    this.icon = this.addImage(`item000`, -575, +10);
    this.text = this.addText(-400, -65, '', TEXTSTYLE.MESSAGE_WHITE);

    this.icon.setScale(4.4);
    this.text.setOrigin(0, 0);
    this.text.setScale(1);

    this.container.add(this.icon);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);
  }

  show(data: PlayerItem[]): void {
    this.items = data;
    this.container.setVisible(true);
    this.handleKeyInput(0);
  }

  protected onClean(): void {
    if (this.container) {
      this.container.setVisible(false);
    }
    if (this.icon) {
      this.icon.setTexture(TEXTURE.BLANK);
    }
    if (this.text) {
      this.text.setText('');
    }
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any) {
    const item = this.items[data];

    if (!item) {
      this.icon.setTexture(TEXTURE.BLANK);
      this.text.setText('');
      return;
    }

    this.icon.setTexture(getItemTexture(item.getKey()));
    this.text.setText(i18next.t(`item:${item.getKey()}.description`));
  }

  updateData(data: PlayerItem[], index: number) {
    this.items = data;
    this.handleKeyInput(index);
  }

  update(time?: number, delta?: number): void {}
}
