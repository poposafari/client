import i18next from 'i18next';
import { getSafari } from '../data/overworld';
import { DEPTH } from '../enums/depth';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { PokemonObject } from '../object/pokemon-object';
import { InGameScene } from '../scenes/ingame-scene';
import { isPokedexShiny, trimLastChar } from '../utils/string-util';
import { addBackground, addImage, addText, addWindow, createSprite, delay, getRealBounds, getTextStyle, runFadeEffect, runFlashEffect, runWipeRifghtToLeftEffect, stopPostPipeline, Ui } from './ui';
import { pokemonData } from '../data/pokemon';
import { KEY } from '../enums/key';
import { KeyboardManager } from '../managers';
import { BattleFlowData } from './battle-player-ui';
import { PlayerItem } from '../object/player-item';
import { BATTLE_BEHAVIOR } from '../enums/battle-behavior';
import { EASE } from '../enums/ease';

export interface BattleBehavior {
  type: BATTLE_BEHAVIOR;
  target: PlayerItem | null;
}

export interface BattleInfo {
  overworld: string;
  pokedex: string;
  pokemon: PokemonObject;
}

export interface BattleResult {
  type: 'run' | 'again';
}

export class BattleUi extends Ui {
  private mode: OverworldMode;

  //TODO: battle-player-ui 쪽으로 보내자.
  private targetItem!: PlayerItem;
  private targetPokemon!: PokemonObject;
  private targetPokedex!: string;

  //containers.
  private container!: Phaser.GameObjects.Container;
  private blackContainer!: Phaser.GameObjects.Container;
  private enemyInfoContainer!: Phaser.GameObjects.Container;

  //backgrounds.
  private bgArea!: Phaser.GameObjects.Image;
  private bgBlack!: Phaser.GameObjects.Image;

  //enemy.
  private enemy!: Phaser.GameObjects.Image;
  private enemyBase!: Phaser.GameObjects.Image;
  private enemyInfo!: Phaser.GameObjects.Image;
  private enemyInfoName!: Phaser.GameObjects.Text;
  private enemyInfoGender!: Phaser.GameObjects.Image;
  private enemyInfoShiny!: Phaser.GameObjects.Image;

  //player.
  private player!: Phaser.GameObjects.Sprite;
  private playerBase!: Phaser.GameObjects.Image;
  private throwItem!: Phaser.GameObjects.Sprite;

  //msg.
  private msgWindow!: Phaser.GameObjects.NineSlice;
  private msgText!: Phaser.GameObjects.Text;

  private readonly fixedStartBallPosX: number = -300;
  private readonly fixedStartBallPosY: number = 100;
  private readonly fixedEndBallPosX: number = 500;
  private readonly fixedEndBallPosY: number = -260;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);
    this.blackContainer = this.scene.add.container(width / 2, height / 2);
    this.enemyInfoContainer = this.scene.add.container(-400, -250);

    this.bgBlack = addBackground(this.scene, TEXTURE.BLACK).setOrigin(0.5, 0.5);

    this.blackContainer.add(this.bgBlack);

    this.blackContainer.setVisible(false);
    this.blackContainer.setDepth(DEPTH.BATTLE_UI + 1);
    this.blackContainer.setScrollFactor(0);

    this.bgArea = addBackground(this.scene, '').setOrigin(0.5, 0.5).setScale(2);

    this.enemy = addImage(this.scene, '', +500, -110).setScale(4).setOrigin(0.5, 0.5);
    this.enemyBase = addImage(this.scene, '', +500, -100).setScale(2);
    this.enemyInfo = addImage(this.scene, TEXTURE.ENEMY_INFO, 0, 0).setOrigin(0.5, 0.5).setScale(2);
    this.enemyInfoName = addText(this.scene, -220, -65, '리자몽', TEXTSTYLE.BATTLE_MESSAGE).setOrigin(0, 0).setScale(0.8);
    this.enemyInfoShiny = addImage(this.scene, TEXTURE.SHINY, -240, -40).setOrigin(0.5, 0.5).setScale(2);
    this.enemyInfoGender = addImage(this.scene, TEXTURE.GENDER_0, +210, -35).setOrigin(0.5, 0.5).setScale(4);
    this.enemyInfoContainer.add(this.enemyInfo);
    this.enemyInfoContainer.add(this.enemyInfoName);
    this.enemyInfoContainer.add(this.enemyInfoShiny);
    this.enemyInfoContainer.add(this.enemyInfoGender);

    this.player = createSprite(this.scene, '', -400, +100).setScale(4).setOrigin(0.5, 0.5);
    this.playerBase = addImage(this.scene, '', -400, +290).setScale(1.6);
    this.throwItem = createSprite(this.scene, TEXTURE.BLANK, -300, +100).setVisible(false);

    this.msgWindow = addWindow(this.scene, TEXTURE.WINDOW_10, 0, 440, 490 * 4, 50 * 4, 16, 16, 16, 16).setScale(1);
    this.msgText = addText(this.scene, -460 * 2, +190 * 2, '', TEXTSTYLE.BATTLE_MESSAGE)
      .setScale(1)
      .setOrigin(0, 0);
    this.msgText.setStyle(getTextStyle(TEXTSTYLE.BATTLE_MESSAGE));

    this.container.add(this.bgArea);
    this.container.add(this.enemyBase);
    this.container.add(this.playerBase);
    this.container.add(this.msgWindow);
    this.container.add(this.msgText);
    this.container.add(this.enemy);
    this.container.add(this.enemyInfoContainer);
    this.container.add(this.player);
    this.container.add(this.throwItem);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI);
    this.container.setScrollFactor(0);
  }

  show(data?: BattleInfo) {
    if (!data) {
      console.log('Can not found battle data.');
      return;
    }

    const playerInfo = this.mode.getPlayerInfo();
    const playerBack = `${playerInfo?.getGender()}_${playerInfo?.getAvatar()}_back`;
    const overworld = getSafari(data.overworld);
    const time = 'day';

    this.targetPokedex = data.pokedex;
    this.targetPokemon = data.pokemon;

    this.bgArea.setTexture(`bg_${overworld.area}_${time}`);
    this.enemyBase.setTexture(`eb_${overworld.area}_${time}`);
    this.playerBase.setTexture(`pb_${overworld.area}_${time}`);
    this.player.setTexture(playerBack);
    this.enemy.setTexture(`pokemon_sprite${this.targetPokedex}`);

    this.enemyInfoName.setText(i18next.t(`pokemon:${isPokedexShiny(this.targetPokedex) ? trimLastChar(this.targetPokedex) : this.targetPokedex}.name`));
    // this.enemyInfoGender.setTexture(`${`getPokemon`(this.targetPokedex)?.name}`);
    this.enemyInfoShiny.setVisible(isPokedexShiny(this.targetPokedex));
    this.adjustPokemonSpritePos(this.targetPokedex);

    this.encounterEffect(this.targetPokedex);
    this.pause(false);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: BattleBehavior): void {
    if (data as BattleBehavior) {
      this.checkBattleBehavior(data!);
    }

    onoff ? this.block() : this.unblock();
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock() {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.SELECT];

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback(async (key) => {
      try {
        switch (key) {
          case KEY.SELECT:
            this.showBattleMessage(BATTLE_BEHAVIOR.NONE, null);
            this.mode.addUiStackOverlap('BattlePlayerUi', { pokemon: this.targetPokemon, playerSprite: this.player, enemySprite: this.enemy } as BattleFlowData);
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private async checkBattleBehavior(data: BattleBehavior) {
    switch (data.type) {
      case BATTLE_BEHAVIOR.RUN_PLAYER:
        this.resetSystemText();
        await this.showRunMessage();
        runFadeEffect(this.scene, 1200, 'in');
        this.clean();
        this.mode.pauseOverworldSystem(false);
        this.mode.popUiStack();
        break;
      case BATTLE_BEHAVIOR.THROW_POKEBALL:
        this.resetSystemText();
        this.showBattleMessage(data.type, data.target);
        this.targetItem = data.target!;
        this.startThrowPokeballAnimation(this.targetItem);
        break;
    }
  }

  private async encounterEffect(pokedex: string) {
    await runFlashEffect(this.scene, 100);
    await runFlashEffect(this.scene, 100);
    runWipeRifghtToLeftEffect(this.scene);
    await delay(this.scene, 1000);
    await stopPostPipeline(this.scene);
    this.container.setVisible(true);
    this.fadeOutBlackContainer(1000);
    this.showBattleMessage(BATTLE_BEHAVIOR.WELCOME, null);
  }

  private async showRunMessage() {
    const playerInfo = this.mode.getPlayerInfo();

    const showText1 = playerInfo?.getNickname() + i18next.t('message:battle_run');
    await this.mode.startMessage([{ type: 'battle', format: 'talk', content: showText1 }]);
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

  private adjustPokemonSpritePos(pokedex: string) {
    const bounds = getRealBounds(this.enemy, this.scene);
    const height = bounds.height;
    const size = pokemonData[isPokedexShiny(pokedex) ? trimLastChar(pokedex) : pokedex].size;

    if (size === 1) {
      this.enemy.setPosition(500, -160);
    } else if (size === 2) {
      this.enemy.setPosition(500, -175);
    } else if (size === 3) {
      this.enemy.setPosition(500, -200);
    } else {
    }
  }

  private showBattleMessage(behavior: BATTLE_BEHAVIOR, target: PlayerItem | null) {
    const playerInfo = this.mode.getPlayerInfo();
    if (!playerInfo) return;

    let text = playerInfo.getNickname() + i18next.t('message:battle_thinking1') + i18next.t('message:battle_thinking2');

    switch (behavior) {
      case BATTLE_BEHAVIOR.THROW_POKEBALL:
        text = playerInfo.getNickname() + i18next.t('message:battle_thinking1') + '\n' + i18next.t(`item:${target?.getKey()}.name`) + i18next.t('message:battle_use');
        break;
      case BATTLE_BEHAVIOR.WELCOME:
        text =
          i18next.t('message:battle_welcome1') +
          i18next.t(`pokemon:${isPokedexShiny(this.targetPokedex) ? trimLastChar(this.targetPokedex) : this.targetPokedex}.name`) +
          i18next.t('message:battle_welcome2') +
          i18next.t('message:battle_welcome3');
        break;
    }

    let textArrary = text.split('');
    let index = 0;

    this.resetSystemText();
    const addNextChar = () => {
      if (index < text.length) {
        this.msgText.text += textArrary[index];
        index++;
        this.scene.time.delayedCall(10, addNextChar, [], this);
      }
    };
    addNextChar();
  }

  private resetSystemText() {
    this.msgText.text = '';
    this.msgText.setText('');
  }

  private startThrowPokeballAnimation(item: PlayerItem) {
    const playerInfo = this.mode.getPlayerInfo();
    const playerBack = `${playerInfo?.getGender()}_${playerInfo?.getAvatar()}_back`;
    this.targetItem = item;

    this.block();

    this.startPlayerAnimation(playerBack);

    this.player.once('animationcomplete', () => {
      this.startThrowItem(item);
    });
  }

  private startPlayerAnimation(animationKey: string) {
    this.player.anims.play({
      key: animationKey,
      repeat: 0,
      frameRate: 10,
    });
  }

  private async startThrowItem(item: PlayerItem) {
    const startX = this.fixedStartBallPosX;
    const startY = this.fixedStartBallPosY;
    const endX = this.fixedEndBallPosX - 50;
    const endY = this.fixedEndBallPosY;
    const peakHeight = -300; // 포물선의 최고점 값. (더 작은 값일수록 높이 날아간다.)
    const duration = 500; // 총 이동 시간 설정 값.

    this.throwItem.setVisible(true);

    this.throwItem.anims.play({
      key: `${item.getKey()}_launch`,
      repeat: 0,
    });

    this.scene.tweens.add({
      targets: this.throwItem,
      x: endX,
      duration: duration,
      ease: EASE.LINEAR,
      onUpdate: (tween) => {
        const progress = tween.progress;
        const currentX = Phaser.Math.Linear(startX, endX, progress);

        // 포물선 방정식: -4a(x - 0.5)^2 + 1 공식으로 y 값 계산.
        const parabola = -4 * peakHeight * (progress - 0.5) ** 2 + peakHeight;
        this.throwItem.y = startY + (endY - startY) * progress + parabola;
      },
      onComplete: async () => {
        this.throwItem.setVisible(false);

        await this.startEnterItemAnimation(item);
        await delay(this.scene, 500);
        await this.startDropItemAnimation(item);
        await delay(this.scene, 1000);
        const testCnt = 3;
        await this.startShakeItemAnimation(item, testCnt);
        await this.startExitItemAnimation(item, testCnt);
        await delay(this.scene, 1000);
        await this.startCatchItemAnimation(testCnt);
      },
    });
  }

  private async startEnterItemAnimation(item: PlayerItem) {
    this.throwItem.anims.play({
      key: `${item.getKey()}_enter`,
      repeat: 0,
      frameRate: 10,
    });
    this.enterEffect();
    this.throwItem.setVisible(true);
  }

  private enterEffect() {
    this.enemy.setTintFill(0xffffff);

    this.scene.tweens.add({
      targets: this.enemy,
      duration: 300,
      ease: EASE.QUAD_EASEIN,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.enemy,
          scaleX: 0.1,
          scaleY: 0.1,
          alpha: 0,
          duration: 800,
          ease: EASE.CUBIC_EASEIN,
          onComplete: () => {
            this.enemy.setVisible(false);
            this.enemy.setTint(0xffffff);
            this.enemy.setScale(1);
            this.enemy.setAlpha(1);
          },
        });
      },
    });
  }

  private async startDropItemAnimation(item: PlayerItem) {
    this.scene.tweens.add({
      targets: this.throwItem,
      y: this.fixedEndBallPosY + 100,
      duration: 500,
      ease: EASE.BOUNCE_EASEOUT,
      onStart: () => {
        this.throwItem.anims.play({
          key: `${item.getKey()}_drop`,
          repeat: 0,
          frameRate: 30,
        });
      },
      onComplete: () => {},
    });
  }

  private async startShakeItemAnimation(item: PlayerItem, count: number): Promise<void> {
    for (let i = 1; i <= count; i++) {
      await delay(this.scene, 500);
      await new Promise<void>((resolve) => {
        const animationKey = `${item.getKey()}_shake`;

        this.throwItem.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
        this.throwItem.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          resolve();
        });

        this.throwItem.anims.play({
          key: animationKey,
          repeat: 0,
        });
      });
    }
  }

  private async startExitItemAnimation(item: PlayerItem, count: number) {
    if (count >= 3) return;

    this.enemy.setScale(0.1);
    this.enemy.setAlpha(0);
    this.enemy.setVisible(true);
    this.enemy.setTintFill(0xffffff);

    this.scene.tweens.add({
      targets: this.enemy,
      scaleX: 2,
      scaleY: 2,
      alpha: 1,
      duration: 300,
      ease: EASE.LINEAR,
      onStart: () => {
        this.throwItem.anims.play({
          key: `${item.getKey()}_exit`,
          repeat: 0,
          frameRate: 10,
        });
      },
      onComplete: () => {
        this.enemy.clearTint();
        this.throwItem.setVisible(false);
      },
    });
  }

  private async startCatchItemAnimation(count: number) {
    if (count < 3) return;

    this.throwItem.setTint(0x5a5a5a);
  }
}
