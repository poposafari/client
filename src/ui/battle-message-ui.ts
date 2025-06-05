import i18next, { t } from 'i18next';
import { BATTLE_STATUS } from '../enums/battle-status';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { addText, addWindow, Ui } from './ui';
import { KeyboardManager } from '../managers';
import { PlayerItem } from '../object/player-item';
import { isPokedexShiny, trimLastChar } from '../utils/string-util';

export class BattleMessageUi extends Ui {
  private mode: OverworldMode;
  private keyboardManager!: KeyboardManager;

  private container!: Phaser.GameObjects.Container;
  private window!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);

    this.window = addWindow(this.scene, TEXTURE.WINDOW_2, 0, 440, 490 * 4, 50 * 4, 16, 16, 16, 16).setScale(1);
    this.text = addText(this.scene, -460 * 2, +190 * 2, '', TEXTSTYLE.BATTLE_MESSAGE)
      .setScale(1)
      .setOrigin(0, 0);

    this.container.add(this.window);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 3);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  showBattleMessage(status: BATTLE_STATUS, target?: string | PlayerItem) {
    const playerInfo = this.mode.getPlayerInfo();
    if (!playerInfo) {
      throw Error('PlayerInfo does not exist.');
    }

    this.resetBattleMessage();

    let text = '';

    switch (status) {
      case BATTLE_STATUS.WELCOME:
        text =
          i18next.t('message:battle_welcome1') +
          i18next.t(`pokemon:${isPokedexShiny(target as string) ? trimLastChar(target as string) : target}.name`) +
          i18next.t('message:battle_welcome2') +
          i18next.t('message:battle_welcome3');
        break;
      case BATTLE_STATUS.MENU:
        text = playerInfo.getNickname() + i18next.t('message:battle_thinking1') + i18next.t('message:battle_thinking2');
        break;
      case BATTLE_STATUS.RUN_PLAYER:
        text = playerInfo.getNickname() + i18next.t('message:battle_run');
        break;
      case BATTLE_STATUS.THROW_BERRY:
      case BATTLE_STATUS.THROW_POKEBALL:
        text = playerInfo.getNickname() + i18next.t('message:battle_thinking1') + '\n' + i18next.t(`item:${target}.name`) + i18next.t('message:battle_use');
        break;
      case BATTLE_STATUS.CATCH_SUCCESS:
        text = i18next.t(`pokemon:${isPokedexShiny(target as string) ? trimLastChar(target as string) : target}.name`) + i18next.t('message:battle_catch_success');
        break;
      case BATTLE_STATUS.CATCH_FAIL:
        text = i18next.t(`pokemon:${isPokedexShiny(target as string) ? trimLastChar(target as string) : target}.name`) + i18next.t('message:battle_catch_fail');
        break;
      case BATTLE_STATUS.RUN_ENEMY:
        text = i18next.t(`pokemon:${isPokedexShiny(target as string) ? trimLastChar(target as string) : target}.name`) + i18next.t('message:battle_run');
        break;
    }

    let textArr = text.length > 0 ? text.split('') : [];
    let idx = 0;

    const addNextChar = () => {
      if (idx < text.length) {
        this.text.text += textArr[idx];
        idx++;
        this.scene.time.delayedCall(10, addNextChar, [], this);
      }
    };
    addNextChar();
  }

  private resetBattleMessage() {
    this.text.text = '';
    this.text.setText('');
  }
}
