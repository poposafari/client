import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { ModalFormUi } from './modal-form-ui';
import { addImage, addText, addWindow, playSound, startModalAnimation, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { TYPE } from '../enums/type';
import { PokemonData } from '../data/pokemon';
import { AUDIO } from '../enums/audio';
import { RewardForm } from '../types';
import { getBattlePokemonSpriteKey } from '../utils/string-util';
import { KEY } from '../enums/key';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { eventBus } from '../core/event-bus';
import { EVENT } from '../enums/event';

export class BattleRewardUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private rewardContainer!: Phaser.GameObjects.Container;

  private window!: Phaser.GameObjects.NineSlice;
  private overlay!: Phaser.GameObjects.NineSlice;
  private pokedex!: Phaser.GameObjects.Text;
  private name!: Phaser.GameObjects.Text;
  private pokemon!: Phaser.GameObjects.Image;
  private type1!: Phaser.GameObjects.Image;
  private type2!: Phaser.GameObjects.Image;
  private restoreWindowY!: number;
  private rewards: Phaser.GameObjects.Container[] = [];

  private readonly scale: number = 4;
  private readonly windowWidth: number = 800;
  private readonly windowHeight: number = 970;
  private readonly infoWindowWidth: number = 700;
  private readonly infoWindowHeight: number = 350;
  private readonly overlayWidth: number = 752;
  private readonly overlayHeight: number = 110;
  private readonly rewardWindowWidth: number = 300;
  private readonly rewardWindowHeight: number = 100;

  constructor(scene: InGameScene) {
    super(scene);
    this.setup();
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.rewardContainer = this.createContainer(width / 2, height / 2 + 250);
    this.restoreWindowY = this.container.y;
    this.window = addWindow(this.scene, TEXTURE.WINDOW_REWARD, 0, 0, this.windowWidth / this.scale, this.windowHeight / this.scale, 16, 16, 16, 16);
    const title1 = addText(this.scene, 0, -102, i18next.t('menu:battleRewardTitle1'), TEXTSTYLE.MESSAGE_WHITE);
    title1.setScale(0.22);
    this.pokemon = addImage(this.scene, 'pokemon_sprite0146_m', -45, -40).setOrigin(0.5, 0.5);
    this.overlay = addWindow(this.scene, TEXTURE.OVERLAY_0, 0, -102, this.overlayWidth / this.scale, this.overlayHeight / this.scale, 8, 8, 8, 8);
    const windowInfo = addWindow(this.scene, TEXTURE.WINDOW_20, +47, -60, this.infoWindowWidth / this.scale, this.infoWindowHeight / this.scale, 8, 8, 8, 8);
    windowInfo.setScale(0.5);
    const pokedexSymbol = addText(this.scene, +10, -72, 'No.', TEXTSTYLE.MESSAGE_WHITE);
    this.pokedex = addText(this.scene, 30, -71, '0000', TEXTSTYLE.MESSAGE_WHITE);
    this.name = addText(this.scene, 10, -48, '아르세우스', TEXTSTYLE.MESSAGE_BLACK);
    this.type1 = addImage(this.scene, TEXTURE.TYPES, +20, -27).setScale(0.5);
    this.type2 = addImage(this.scene, TEXTURE.TYPES, +55, -27).setScale(0.5);
    const ribbon = addImage(this.scene, TEXTURE.REWARD, 0, +20).setDisplaySize(140, 25);
    const ribbonTitle = addText(this.scene, 0, +16, i18next.t('menu:battleRewardTitle2'), TEXTSTYLE.MESSAGE_BLACK);
    const alert = addText(this.scene, 0, +100, i18next.t('menu:battleRewardTitle3'), TEXTSTYLE.SPECIAL);

    ribbonTitle.setScale(0.22);
    pokedexSymbol.setScale(0.25);
    pokedexSymbol.setOrigin(0, 0.5);
    alert.setScale(0.16);
    this.pokedex.setScale(0.2);
    this.pokedex.setOrigin(0, 0.5);
    this.name.setScale(0.18);
    this.name.setOrigin(0, 0.5);

    this.container.add(this.window);
    this.container.add(this.overlay);
    this.container.add(this.pokemon);
    this.container.add(title1);
    this.container.add(windowInfo);
    this.container.add(pokedexSymbol);
    this.container.add(this.pokedex);
    this.container.add(this.name);
    this.container.add(this.type1);
    this.container.add(this.type2);
    this.container.add(ribbon);
    this.container.add(ribbonTitle);
    this.container.add(alert);

    this.container.setScale(this.scale);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 10);
    this.container.setScrollFactor(0);

    this.rewardContainer.setScale(this.scale);
    this.rewardContainer.setVisible(false);
    this.rewardContainer.setDepth(DEPTH.BATTLE + 10);
    this.rewardContainer.setScrollFactor(0);
  }

  show(data: RewardForm): void {
    this.setupRewardInfo(data);

    playSound(this.scene, AUDIO.REWARD);

    this.container.y += 48;
    this.container.setAlpha(0);
    this.container.setVisible(true);
    this.rewardContainer.setVisible(true);

    startModalAnimation(this.scene, [this.container, this.rewardContainer], 700);
    this.handleKeyInput();
  }

  clean(data?: any): void {
    this.container.y = this.restoreWindowY;
    this.container.setAlpha(1);
    this.container.setVisible(false);
    this.rewardContainer.setVisible(false);
    this.cleanReward();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {
    const keys = [KEY.SELECT];
    const keyboard = KeyboardHandler.getInstance();
    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback((key) => {
      try {
        switch (key) {
          case KEY.SELECT:
            this.clean();
            eventBus.emit(EVENT.POP_MODE);
            eventBus.emit(EVENT.BATTLE_FINISH);
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  update(time?: number, delta?: number): void {}

  private updateTypes(pokedex: string) {
    let type1: TYPE | null = TYPE.NONE;
    let type2: TYPE | null = TYPE.NONE;

    type1 = PokemonData[Number(pokedex)].type1;
    type2 = PokemonData[Number(pokedex)].type2;

    type1 ? this.type1.setTexture(TEXTURE.TYPES, `types-${type1}`) : this.type1.setTexture(TEXTURE.BLANK);
    type2 ? this.type2.setTexture(TEXTURE.TYPES, `types-${type2}`) : this.type2.setTexture(TEXTURE.BLANK);
  }

  private setupRewardInfo(data: RewardForm) {
    this.pokemon.setTexture(`${getBattlePokemonSpriteKey(data.pokedex, data.shiny, data.gender)}`);
    this.name.setText(i18next.t(`pokemon:${data.pokedex}.name`));
    this.updateTypes(data.pokedex);
    this.pokedex.setText(data.pokedex);

    const spacing = 40;

    this.cleanReward();

    const obj = new Reward(this.scene, TEXTURE.MENU_CANDY, data.candy);
    const rewardObj = obj.show();
    this.rewardContainer.add(rewardObj);
    this.rewards.push(rewardObj);

    for (const reward of data.rewards) {
      const obj = new Reward(this.scene, reward.item, reward.stock);
      const rewardObj = obj.show();
      this.rewardContainer.add(rewardObj);
      this.rewards.push(rewardObj);
    }

    const totalWidth = (this.rewards.length - 1) * spacing;
    for (let i = 0; i < this.rewards.length; i++) {
      this.rewards[i].x = -totalWidth / 2 + i * spacing;
    }
  }

  private cleanReward() {
    for (const container of this.rewards) {
      container.removeAll(true);
      container.destroy();
    }

    this.rewards = [];
  }
}

class Reward extends Ui {
  private container!: Phaser.GameObjects.Container;
  private item!: string;
  private stock!: number;
  private icon!: Phaser.GameObjects.Image;
  private stockText!: Phaser.GameObjects.Text;

  private readonly iconScale: number = 0.5;
  private readonly candyScale: number = 1;
  private readonly textScale: number = 0.15;
  private readonly stockScale: number = 0.15;

  constructor(scene: InGameScene, item: string, stock: number) {
    super(scene);

    this.container = this.createContainer(0, 0);

    const iconTexture = item === TEXTURE.MENU_CANDY ? TEXTURE.MENU_CANDY : `item${item}`;
    const nameValue = item === TEXTURE.MENU_CANDY ? i18next.t(`menu:candyName`) : i18next.t(`item:${item}.name`);

    const icon = addImage(this.scene, iconTexture, 0, 0);
    const nameText = addText(this.scene, 0, +18, nameValue, TEXTSTYLE.MESSAGE_BLACK);
    const stockSymbolText = addText(this.scene, +3, +8, 'x', TEXTSTYLE.MESSAGE_BLACK);
    const stockText = addText(this.scene, +8, +8, stock.toString(), TEXTSTYLE.MESSAGE_BLACK);

    stockSymbolText.setOrigin(0, 0.5);
    stockText.setOrigin(0, 0.5);

    icon.setScale(item === TEXTURE.MENU_CANDY ? this.candyScale : this.iconScale);
    nameText.setScale(this.textScale);
    stockSymbolText.setScale(this.stockScale);
    stockText.setScale(this.stockScale);

    this.container.add(icon);
    this.container.add(nameText);
    this.container.add(stockSymbolText);
    this.container.add(stockText);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE + 10);
    this.container.setScrollFactor(0);
  }

  setup(data?: any): void {}

  show(data?: any): Phaser.GameObjects.Container {
    this.container.setVisible(true);

    return this.container;
  }

  clean(data?: any): void {}

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}
}
