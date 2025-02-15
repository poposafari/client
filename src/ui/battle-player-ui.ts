import i18next from 'i18next';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addText, addWindow, createSprite, delay, Ui } from './ui';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { TEXTSTYLE } from '../enums/textstyle';
import { PokemonObject } from '../object/pokemon-object';
import { PlayerItem } from '../object/player-item';
import { EASE } from '../enums/ease';
import { BattleBehavior } from './battle-ui';
import { BATTLE_BEHAVIOR } from '../enums/battle-behavior';

export interface BattleFlowData {
  pokemon: PokemonObject;
}

export interface UseItemInfo {
  type: 'pokeball' | 'berry';
  item: PlayerItem;
}

export class BattlePlayerUi extends Ui {
  private mode: OverworldMode;
  private container!: Phaser.GameObjects.Container;
  private targetPokemon!: PokemonObject;
  private throwItem!: Phaser.GameObjects.Sprite;

  private texts: Phaser.GameObjects.Text[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];

  private readonly menus: string[] = [i18next.t('menu:battleSelect0'), i18next.t('menu:battleSelect1'), i18next.t('menu:battleSelect3')];

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    let offsetX = 550;
    let offsetY = 410;

    this.container = this.scene.add.container(width / 2, height / 2);

    const window = addWindow(this.scene, TEXTURE.WINDOW_10, +720, 440, 120, 50, 8, 8, 8, 8).setScale(4);

    this.texts[0] = addText(this.scene, 0 + offsetX, 0 + offsetY, this.menus[0], TEXTSTYLE.BATTLE_MENU).setOrigin(0, 0.5);
    this.texts[1] = addText(this.scene, +200 + offsetX, 0 + offsetY, this.menus[1], TEXTSTYLE.BATTLE_MENU).setOrigin(0, 0.5);
    this.texts[2] = addText(this.scene, 0 + offsetX, +60 + offsetY, this.menus[2], TEXTSTYLE.BATTLE_MENU).setOrigin(0, 0.5);

    this.dummys[0] = addImage(this.scene, TEXTURE.BLANK, -10 + offsetX, 0 + offsetY).setScale(1.5);
    this.dummys[1] = addImage(this.scene, TEXTURE.BLANK, +180 + offsetX, 0 + offsetY).setScale(1.5);
    this.dummys[2] = addImage(this.scene, TEXTURE.BLANK, -10 + offsetX, +60 + offsetY).setScale(1.5);

    this.throwItem = createSprite(this.scene, TEXTURE.BLANK, -300, +100).setVisible(false);

    this.container.add(window);
    this.container.add(this.texts);
    this.container.add(this.dummys);
    this.container.add(this.throwItem);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: BattleFlowData): void {
    if (data) {
      this.targetPokemon = data.pokemon;
    }

    this.container.setVisible(true);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: BattleBehavior): void {
    if (data) {
      this.clean();
      this.mode.popUiStack({ type: data.type, target: data.target } as BattleBehavior);
    }

    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT];
    const keyboardManager = KeyboardManager.getInstance();

    let choice = 0;
    const maxChoice = 2;
    const cols = 2;

    this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice - cols >= 0) choice -= cols;
            break;
          case KEY.DOWN:
            if (choice + cols <= maxChoice) choice += cols;
            break;
          case KEY.LEFT:
            if (choice % cols !== 0) choice--;
            break;
          case KEY.RIGHT:
            if ((choice + 1) % cols !== 0 && choice + 1 <= maxChoice) choice++;
            break;
          case KEY.SELECT:
            const target = this.menus[choice];
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            if (target === i18next.t('menu:battleSelect0')) {
              this.mode.addUiStackOverlap('BattlePokeballUi');
            } else if (target === i18next.t('menu:battleSelect1')) {
              //add ui battle-berry-ui
            } else if (target === i18next.t('menu:battleSelect3')) {
              this.targetPokemon.scheduleRandomMovement();
              this.clean();
              this.mode.popUiStack({ type: BATTLE_BEHAVIOR.RUN_PLAYER, target: null });
            }
            break;
        }

        if (choice !== prevChoice) {
          this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }
}
