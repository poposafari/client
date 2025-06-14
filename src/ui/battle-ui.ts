import { BATTLE_STATUS } from '../enums/battle-status';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes-test';
import { PlayerItem } from '../object/player-item';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { BattleBaseUi, BattleInfo } from './battle-base-ui';
import { BattleMenuUi } from './battle-menu-ui';
import { BattleMenuPokeballUi } from './battle-menu-pokeball-ui';
import { BattleMessageUi } from './battle-message-ui';
import { BattleSpriteUi } from './battle-sprite-ui';
import { addBackground, delay, runFadeEffect, runFlashEffect, runWipeRifghtToLeftEffect, stopPostPipeline, Ui } from './ui';
import { Battle } from '../storage/battle';
import { BattleMenuBerryUi } from './battle-menu-berry-ui';

export class BattleUi extends Ui {
  private mode: OverworldMode;
  private currentStatus: BATTLE_STATUS;
  private targetPokemon!: PokemonObject;
  private battle!: Battle | null;

  private blackContainer!: Phaser.GameObjects.Container;
  private bgBlack!: Phaser.GameObjects.Image;

  private battleMessageUi: BattleMessageUi;
  private battleBaseUi: BattleBaseUi;
  private battleSpriteUi: BattleSpriteUi;
  private battleMenuUi: BattleMenuUi;
  private battleMenuPokeballUi: BattleMenuPokeballUi;
  private battleMenuBerryUi: BattleMenuBerryUi;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
    this.currentStatus = BATTLE_STATUS.WELCOME;

    this.battleMessageUi = new BattleMessageUi(scene, mode);
    this.battleBaseUi = new BattleBaseUi(scene, mode);
    this.battleSpriteUi = new BattleSpriteUi(scene, mode, this);
    this.battleMenuUi = new BattleMenuUi(scene, mode, this);
    this.battleMenuPokeballUi = new BattleMenuPokeballUi(scene, mode, this);
    this.battleMenuBerryUi = new BattleMenuBerryUi(scene, mode, this);
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.blackContainer = this.scene.add.container(width / 2, height / 2);

    this.bgBlack = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5);

    this.blackContainer.add(this.bgBlack);

    this.blackContainer.setVisible(false);
    this.blackContainer.setDepth(DEPTH.BATTLE_UI + 5);
    this.blackContainer.setScrollFactor(0);

    this.battleMessageUi.setup();
    this.battleBaseUi.setup();
    this.battleSpriteUi.setup();
    this.battleMenuUi.setup();
    this.battleMenuPokeballUi.setup();
    this.battleMenuBerryUi.setup();
  }

  async show(data?: BattleInfo): Promise<void> {
    if (data) {
      this.targetPokemon = data.pokemon;
    }

    this.battle = new Battle();

    await this.encounterEffect();
    this.battleMessageUi.show();
    this.battleBaseUi.show(data);
    this.battleSpriteUi.show(data);
    this.battleMenuUi.onoffBerryMenu(true);

    this.battleMessageUi.showBattleMessage(BATTLE_STATUS.WELCOME, data?.pokedex);
    this.startKeyDownSelect();
  }

  clean(data?: any): void {
    this.battleMessageUi.clean();
    this.battleBaseUi.clean();
    this.battleSpriteUi.clean();
    this.battle = null;
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  private exitBattle() {
    runFadeEffect(this.scene, 1200, 'in');
    this.clean();
    this.mode.pauseOverworldSystem(false);
    this.mode.popUiStack();
  }

  private startKeyDownSelect() {
    if (!this.battle) {
      throw Error('battle does not exist.');
    }

    const keys = [KEY.SELECT];
    const keyboardManager = KeyboardManager.getInstance();
    const status = this.battle.getStatus();

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback(async (key) => {
      switch (key) {
        case KEY.SELECT:
          if (status === BATTLE_STATUS.WELCOME) {
            this.handleBattleStatus(BATTLE_STATUS.MENU);
          } else if (status === BATTLE_STATUS.RUN_PLAYER) {
            this.handleBattleStatus(BATTLE_STATUS.WELCOME);
            this.targetPokemon.scheduleRandomMovement();
            this.exitBattle();
          } else if (status === (BATTLE_STATUS.RUN_ENEMY || BATTLE_STATUS.CATCH_SUCCESS)) {
            this.handleBattleStatus(BATTLE_STATUS.WELCOME);
            this.targetPokemon.capture();
            this.targetPokemon.destroy();
            this.exitBattle();
          } else if (status === BATTLE_STATUS.CATCH_FAIL) {
            if (this.battle?.getIsRunAway()) {
              this.handleBattleStatus(BATTLE_STATUS.RUN_ENEMY);
              return;
            } else {
              this.handleBattleStatus(BATTLE_STATUS.MENU);
            }
          } else if (status === BATTLE_STATUS.FEED) {
            this.handleBattleStatus(BATTLE_STATUS.MENU);
          }
          break;
      }
    });
  }

  handleBattleStatus(status: BATTLE_STATUS, data?: PlayerItem | null | any) {
    if (!this.battle) {
      throw Error('battle does not exist.');
    }

    this.battle.setStatus(status);

    switch (status) {
      case BATTLE_STATUS.MENU:
        this.battleMessageUi.showBattleMessage(BATTLE_STATUS.MENU);
        this.battleMenuUi.show(this.battle);
        break;
      case BATTLE_STATUS.RUN_PLAYER:
        this.battleMessageUi.showBattleMessage(BATTLE_STATUS.RUN_PLAYER);
        this.battleMenuUi.clean();
        this.startKeyDownSelect();
        break;
      case BATTLE_STATUS.RUN_ENEMY:
        this.battleMessageUi.showBattleMessage(BATTLE_STATUS.RUN_ENEMY, this.targetPokemon.getPokedex());
        this.startKeyDownSelect();
        break;
      case BATTLE_STATUS.CATCH_SUCCESS:
        this.battleMessageUi.showBattleMessage(BATTLE_STATUS.CATCH_SUCCESS, this.targetPokemon.getPokedex());
        this.startKeyDownSelect();
        break;
      case BATTLE_STATUS.CATCH_FAIL:
        this.battleMessageUi.showBattleMessage(BATTLE_STATUS.CATCH_FAIL, this.targetPokemon.getPokedex());
        this.startKeyDownSelect();
        if (data) this.battle.setRunAway();
        break;
      case BATTLE_STATUS.MENU_POKEBALL:
        this.battleMenuPokeballUi.show();
        break;
      case BATTLE_STATUS.MENU_BERRY:
        this.battleMenuBerryUi.show();
        break;
      case BATTLE_STATUS.THROW_POKEBALL:
        this.battleMessageUi.showBattleMessage(BATTLE_STATUS.THROW_POKEBALL, data.getKey() as PlayerItem);
        this.battleMenuPokeballUi.clean();
        this.battleMenuUi.clean();
        this.battleSpriteUi.throwBerryOrPokeball(data as PlayerItem, 'pokeball');
        this.startKeyDownSelect();
        break;
      case BATTLE_STATUS.THROW_BERRY:
        this.battleMessageUi.showBattleMessage(BATTLE_STATUS.THROW_BERRY, data.getKey() as PlayerItem);
        this.battleMenuBerryUi.clean();
        this.battleMenuUi.clean();
        this.battle.setBerry(data as PlayerItem);
        this.battleSpriteUi.throwBerryOrPokeball(data as PlayerItem, 'berry');
        this.startKeyDownSelect();
        break;
      case BATTLE_STATUS.FEED:
        this.battleBaseUi.updateFeedIcon(data);
        this.startKeyDownSelect();
        break;
      case BATTLE_STATUS.WELCOME:
        break;
    }
  }

  private async encounterEffect() {
    await runFlashEffect(this.scene, 100);
    await runFlashEffect(this.scene, 100);
    runWipeRifghtToLeftEffect(this.scene);
    await delay(this.scene, 1000);
    await stopPostPipeline(this.scene);
    this.fadeOutBlackContainer(1000);
  }

  private fadeOutBlackContainer(duration: number) {
    this.blackContainer.setVisible(true);
    this.blackContainer.setAlpha(1);

    this.scene.tweens.add({
      targets: this.blackContainer,
      alpha: 0,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.blackContainer.setVisible(false);
      },
    });
  }
}
