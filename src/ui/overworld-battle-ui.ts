import i18next from 'i18next';
import { getOverworldInfo } from '../data/overworld';
import { getPokemon, Pokemon } from '../data/pokemon';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTSTYLE } from '../enums/textstyle';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager, PlayerInfoManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addText, addWindow, createSprite, delay, getRealBounds, getTextStyle, runFadeEffect, runFlashEffect, runWipeRifghtToLeftEffect, stopPostPipeline, Ui } from './ui';
import { PokemonObject } from '../object/pokemon-object';
import { isPokedexShiny, trimLastChar } from '../utils/string-util';
import { EASE } from '../enums/ease';

export interface Battle {
  overworld: string;
  pokedex: string;
  pokemon: PokemonObject;
}

export interface Behavior {
  key: 'pokeball' | 'berry';
  item: string;
}

export class OverworldBattleUi extends Ui {
  private mode: OverworldMode;
  private pokeball!: Phaser.GameObjects.Sprite;
  private targetPokemon!: PokemonObject;
  private container!: Phaser.GameObjects.Container;
  private blackContainer!: Phaser.GameObjects.Container;
  private behaviorContainer!: Phaser.GameObjects.Container;
  private enemyInfoContainer!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private bgBlack!: Phaser.GameObjects.Image;
  private enemy!: Phaser.GameObjects.Image;
  private enemyBase!: Phaser.GameObjects.Image;
  private enemyInfoWindow!: Phaser.GameObjects.Image;
  private enemyInfoName!: Phaser.GameObjects.Text;
  private enemyInfoGender!: Phaser.GameObjects.Image;
  private enemyInfoShiny!: Phaser.GameObjects.Image;
  private enemyInfoCaptured!: Phaser.GameObjects.Image;
  private enemyInfoType1!: Phaser.GameObjects.Image;
  private enemyInfoType2!: Phaser.GameObjects.Image;
  private player!: Phaser.GameObjects.Sprite;
  private playerBase!: Phaser.GameObjects.Image;
  private systemWindow!: Phaser.GameObjects.NineSlice;
  private behaviorWindow!: Phaser.GameObjects.NineSlice;
  private systemText!: Phaser.GameObjects.Text;
  private behaviorTexts: Phaser.GameObjects.Text[] = [];
  private behaviorDummys: Phaser.GameObjects.Image[] = [];
  private readonly behaviorMenus: string[] = [i18next.t('menu:battleSelect0'), i18next.t('menu:battleSelect1'), i18next.t('menu:battleSelect3')];
  private readonly fixedBallPositionX: number = 500;
  private readonly fixedBallPositionY: number = -260;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.blackContainer = this.scene.add.container(width / 2, height / 2);
    this.bgBlack = addBackground(this.scene, TEXTURE.BLACK, width * 2, height * 4).setOrigin(0.5, 0.5);
    this.blackContainer.add(this.bgBlack);
    this.blackContainer.setVisible(false);
    this.blackContainer.setDepth(DEPTH.BATTLE_UI + 1);
    this.blackContainer.setScrollFactor(0);

    this.container = this.scene.add.container(width / 2, height / 2);

    this.bg = addBackground(this.scene, '', width, height).setOrigin(0.5, 0.5);
    this.bg.setScale(2);
    this.enemy = addImage(this.scene, '', +500, -160).setScale(2).setOrigin(0.5, 0.5);
    this.enemyBase = addImage(this.scene, '', +500, -100).setScale(2);
    this.player = createSprite(this.scene, '', -400, +100).setScale(4).setOrigin(0.5, 0.5);
    this.playerBase = addImage(this.scene, '', -400, +290).setScale(1.6);
    this.pokeball = createSprite(this.scene, '', -350, +180).setVisible(false);
    this.systemWindow = addWindow(this.scene, TEXTURE.WINDOW_8, 0, 440, 490 * 2, 50 * 2, 16, 16, 16, 16).setScale(2);
    this.systemText = addText(this.scene, -460 * 2, +190 * 2, '', TEXTSTYLE.BATTLE_MESSAGE).setOrigin(0, 0);
    this.systemText.setStyle(getTextStyle(TEXTSTYLE.BATTLE_MESSAGE));
    this.systemText.setScale(1);

    this.enemyInfoContainer = this.scene.add.container(-400, -250);
    this.enemyInfoWindow = addImage(this.scene, TEXTURE.ENEMY_INFO, 0, 0).setOrigin(0.5, 0.5).setScale(2);
    this.enemyInfoName = addText(this.scene, -220, -65, '리자몽', TEXTSTYLE.BATTLE_MESSAGE).setOrigin(0, 0).setScale(0.8);
    this.enemyInfoShiny = addImage(this.scene, TEXTURE.SHINY, -240, -40).setOrigin(0.5, 0.5).setScale(2);
    this.enemyInfoGender = addImage(this.scene, TEXTURE.GENDER_0, +210, -35).setOrigin(0.5, 0.5).setScale(4);
    this.enemyInfoContainer.add(this.enemyInfoWindow);
    this.enemyInfoContainer.add(this.enemyInfoName);
    this.enemyInfoContainer.add(this.enemyInfoShiny);
    this.enemyInfoContainer.add(this.enemyInfoGender);

    this.container.add(this.bg);
    this.container.add(this.enemyBase);
    this.container.add(this.playerBase);
    this.container.add(this.systemWindow);
    this.container.add(this.systemText);
    this.container.add(this.enemy);
    this.container.add(this.player);
    this.container.add(this.enemyInfoContainer);
    this.container.add(this.pokeball);
    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI);
    this.container.setScrollFactor(0);

    let offsetX = 550;
    let offsetY = 410;
    this.behaviorContainer = this.scene.add.container(width / 2, height / 2);
    this.behaviorWindow = addWindow(this.scene, TEXTURE.WINDOW_5, +715, 440, 120, 50, 16, 16, 16, 16).setScale(4);
    this.behaviorTexts.push(addText(this.scene, 0 + offsetX, 0 + offsetY, this.behaviorMenus[0], TEXTSTYLE.BATTLE_MENU).setOrigin(0, 0.5));
    this.behaviorTexts.push(addText(this.scene, +200 + offsetX, 0 + offsetY, this.behaviorMenus[1], TEXTSTYLE.BATTLE_MENU).setOrigin(0, 0.5));
    this.behaviorTexts.push(addText(this.scene, 0 + offsetX, +60 + offsetY, this.behaviorMenus[2], TEXTSTYLE.BATTLE_MENU).setOrigin(0, 0.5));
    // this.behaviorTexts.push(addText(this.scene, +200 + offsetX, +60 + offsetY, this.behaviorMenus[3], TEXTSTYLE.BATTLE_MENU).setOrigin(0, 0.5));
    this.behaviorDummys.push(addImage(this.scene, TEXTURE.BLANK, -10 + offsetX, 0 + offsetY).setScale(1.5));
    this.behaviorDummys.push(addImage(this.scene, TEXTURE.BLANK, +180 + offsetX, 0 + offsetY).setScale(1.5));
    this.behaviorDummys.push(addImage(this.scene, TEXTURE.BLANK, -10 + offsetX, +60 + offsetY).setScale(1.5));
    // this.behaviorDummys.push(addImage(this.scene, TEXTURE.BLANK, +180 + offsetX, +60 + offsetY).setScale(1.5));

    this.behaviorContainer.add(this.behaviorWindow);
    this.behaviorContainer.add(this.behaviorTexts);
    this.behaviorContainer.add(this.behaviorDummys);
    this.behaviorContainer.setVisible(false);
    this.behaviorContainer.setDepth(DEPTH.BATTLE_UI + 1);
    this.behaviorContainer.setScrollFactor(0);
  }

  show(data?: Battle): void {
    if (!data) {
      console.log('Can not found battle data.');
      return;
    }

    const playerInfoManager = this.mode.getPlayerInfoManager();
    const playerInfo = playerInfoManager.getInfo();
    const playerBack = `${playerInfo.gender}_${playerInfo.avatarType}_back`;
    const overworld = getOverworldInfo(data.overworld);
    const pokedex = data.pokedex;
    const time = 'day';

    this.targetPokemon = data.pokemon;

    this.bg.setTexture(`bg_${overworld?.area}_${time}`);
    this.enemyBase.setTexture(`eb_${overworld?.area}_${time}`);
    this.playerBase.setTexture(`pb_${overworld?.area}_${time}`);
    this.player.setTexture(playerBack);
    this.enemy.setTexture(`pokemon_sprite${pokedex}`);
    this.enemyInfoName.setText(`${getPokemon(isPokedexShiny(pokedex) ? trimLastChar(pokedex) : pokedex)?.name}`);
    // this.enemyInfoGender.setTexture(`${getPokemon(pokedex)?.name}`);
    this.enemyInfoShiny.setVisible(isPokedexShiny(pokedex));
    this.adjustPokemonSpritePos();

    this.encounterEffect(pokedex);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.behaviorContainer.setVisible(false);
    this.blackContainer.setVisible(false);
    this.systemText.setText('');
    this.pause(true);
  }

  async pause(onoff: boolean, data?: any): Promise<void> {
    if (data) {
      const behavior = data.behavior;
      const item = data.item;
      if (behavior === 'pokeball') {
        await this.throwPokeball(item);
      }
    }

    onoff ? this.block() : this.unblock(data);
  }

  update(time: number, delta: number): void {}

  private block() {}

  private unblock(data: Behavior) {
    const keys = [KEY.UP, KEY.DOWN, KEY.LEFT, KEY.RIGHT, KEY.SELECT];
    const keyboardManager = KeyboardManager.getInstance();

    let choice = 0;
    const maxChoice = 2;
    const cols = 2;

    this.behaviorDummys[choice].setTexture(TEXTURE.ARROW_W_R);

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
            const target = this.behaviorMenus[choice];
            this.behaviorDummys[choice].setTexture(TEXTURE.BLANK);
            if (target === i18next.t('menu:battleSelect0')) {
              this.mode.addUiStackOverlap('OverworldBattlePokeballUi');
            } else if (target === i18next.t('menu:battleSelect3')) {
              const playerInfo = this.mode.getPlayerInfoManager().getInfo();
              const runText = playerInfo.nickname + i18next.t('message:battle_thinking1') + i18next.t('message:battle_run');
              this.resetSystemText();
              this.targetPokemon.scheduleRandomMovement();
              await this.mode.startMessage([{ type: 'battle', format: 'talk', content: runText }]);
              this.clean();
              await runFadeEffect(this.scene, 1000, 'in');
              this.mode.pauseOverworldSystem(false);
              this.mode.popUiStack();
            }
            break;
        }

        if (choice !== prevChoice) {
          this.behaviorDummys[prevChoice].setTexture(TEXTURE.BLANK);
          this.behaviorDummys[choice].setTexture(TEXTURE.ARROW_W_R);
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }
    });
  }

  private adjustPokemonSpritePos() {
    const bounds = getRealBounds(this.enemy, this.scene);
    const height = bounds.height;

    if (height >= 136) {
      this.enemy.setPosition(500, -240);
    } else {
      this.enemy.setPosition(500, -160);
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
    await this.showWelcomeMessage(pokedex);
    this.showThinkingMessage();
    this.pause(false);
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

  private async showWelcomeMessage(pokedex: string) {
    if (isPokedexShiny(pokedex)) {
      pokedex = pokedex.slice(0, -1);
    }

    let pokemon = getPokemon(pokedex);

    const showText1 = i18next.t('message:battle_welcome1') + pokemon?.name + i18next.t('message:battle_welcome2') + i18next.t('message:battle_welcome3');
    await this.mode.startMessage([{ type: 'battle', format: 'talk', content: showText1 }]);
  }

  private showThinkingMessage() {
    const playerInfo = PlayerInfoManager.getInstance().getInfo();
    if (!playerInfo) return;

    this.behaviorContainer.setVisible(true);

    const showText2 = playerInfo.nickname + i18next.t('message:battle_thinking1') + i18next.t('message:battle_thinking2');
    let showText2Arrary = showText2.split('');
    let index = 0;
    this.resetSystemText();

    const addNextChar = () => {
      if (index < showText2.length) {
        this.systemText.text += showText2Arrary[index];
        index++;
        this.scene.time.delayedCall(10, addNextChar, [], this);
      }
    };
    addNextChar();
  }

  private resetSystemText() {
    this.systemText.setText('');
  }
  private async throwPokeball(pokeball: string) {
    const playerInfoManager = this.mode.getPlayerInfoManager();
    const playerInfo = playerInfoManager.getInfo();
    const playerBack = `${playerInfo.gender}_${playerInfo.avatarType}_back`;

    this.pokeball.setPosition(this.player.x + 50, this.player.y - 20);
    this.pokeball.anims.play({
      key: `${pokeball}_launch`,
      repeat: 0,
    });
    this.pokeball.setVisible(true);

    const startX = this.pokeball.x;
    const startY = this.pokeball.y;
    // const endX = this.enemyBase.x;
    // const endY = this.enemyBase.y;
    const endX = this.fixedBallPositionX;
    const endY = this.fixedBallPositionY;

    const peakHeight = -300; // 포물선의 최고점 값. (더 작은 값일수록 높이 날아간다.)
    const duration = 500; // 총 이동 시간 설정 값.

    this.player.anims.play({
      key: playerBack,
      repeat: 0,
      frameRate: 10,
    });

    this.scene.tweens.add({
      targets: this.pokeball,
      x: endX - 50,
      duration: duration,
      ease: 'Linear',
      onUpdate: (tween) => {
        const progress = tween.progress;
        const currentX = Phaser.Math.Linear(startX, endX, progress);

        // 포물선 방정식: -4a(x - 0.5)^2 + 1 공식으로 y 값 계산.
        const parabola = -4 * peakHeight * (progress - 0.5) ** 2 + peakHeight;

        this.pokeball.y = startY + (endY - startY) * progress + parabola;
      },
      onComplete: async () => {
        this.pokeball.setVisible(false);

        const textureKey = this.player.texture.key;
        const frameKeys = this.player.scene.textures.get(textureKey).getFrameNames();
        this.player.setFrame(frameKeys[0]);

        await this.enterPokeball(pokeball);
        await delay(this.scene, 500);
        await this.dropPokeball(pokeball);
        await delay(this.scene, 1000);
        //TODO: `const ret` 포획 성공 여부에 대해서는 axios로 받도록 하자 :)
        await this.shakePokeball(pokeball, 3);
      },
    });
  }

  private async enterPokeball(pokeball: string) {
    this.pokeball.anims.play({
      key: `${pokeball}_enter`,
      repeat: 0,
      frameRate: 10,
    });
    this.enterEffect();
    this.pokeball.setVisible(true);
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
          ease: 'Cubic.easeIn',
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

  private async dropPokeball(pokeball: string) {
    this.scene.tweens.add({
      targets: this.pokeball,
      y: this.pokeball.y + 130,
      duration: 500,
      ease: EASE.BOUNCE_EASEOUT,
      onStart: () => {
        this.pokeball.anims.play({
          key: `${pokeball}_drop`,
          repeat: 0,
          frameRate: 30,
        });
      },
      onComplete: () => {},
    });
  }

  private async shakePokeball(pokeball: string, count: number): Promise<void> {
    for (let i = 1; i <= count; i++) {
      await delay(this.scene, 500);
      await new Promise<void>((resolve) => {
        const animationKey = `${pokeball}_shake`;

        this.pokeball.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
        this.pokeball.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          resolve();
        });

        this.pokeball.anims.play({
          key: animationKey,
          repeat: 0,
        });
      });
    }
  }
}
