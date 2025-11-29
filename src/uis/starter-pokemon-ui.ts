import i18next from 'i18next';
import { catchStarterPokemonApi, enterSafariZoneApi } from '../api';
import { ANIMATION, AUDIO, DEPTH, KEY, MessageEndDelay, TEXTSTYLE, TEXTURE } from '../enums';
import { KeyboardManager } from '../core/manager/keyboard-manager';
import { InGameScene } from '../scenes/ingame-scene';
import { Talk, WildRes } from '../types';
import { addBackground, addImage, addText, addWindow, createSprite, playEffectSound, runFadeEffect, Ui } from './ui';
import { getCurrentTimeOfDay, getPokemonType, replacePercentSymbol } from '../utils/string-util';
import { QuestionMessageUi } from './question-message-ui';
import { Option } from '../core/storage/player-option';

export class StarterPokemonUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private contentContainer!: Phaser.GameObjects.Container;

  private questionMessage: QuestionMessageUi;

  private sceneWidth!: number;
  private sceneHeight!: number;
  private balls: Phaser.GameObjects.Sprite[] = [];
  private fingers: Phaser.GameObjects.Sprite[] = [];
  private pokemon!: Phaser.GameObjects.Image;
  private baseWindow!: Phaser.GameObjects.NineSlice;
  private text!: Phaser.GameObjects.Text;
  private textSpeedTimer: Phaser.Time.TimerEvent | null = null;
  private textObjects: Phaser.GameObjects.Text[] = [];
  private lastChoice: number = 0;

  private starterPokemons: WildRes[] = [];

  private readonly baseWindowScale: number = 4;

  constructor(scene: InGameScene) {
    super(scene);

    this.questionMessage = new QuestionMessageUi(scene);
  }

  setup(data?: any): void {
    this.sceneWidth = this.getWidth();
    this.sceneHeight = this.getHeight();

    this.questionMessage.setup();

    this.container = this.createContainer(this.sceneWidth / 2, this.sceneHeight / 2);
    this.contentContainer = this.createContainer(this.sceneWidth / 2, this.sceneHeight / 2);

    const bg = this.addBackground(TEXTURE.BG_TUTORIAL_CHOICE).setOrigin(0.5, 0.5);
    this.pokemon = this.addImage(`pokemon_sprite0000`, 0, -250).setScale(4.8);
    this.baseWindow = this.addWindow(TEXTURE.WINDOW_0, 0, +410, 480, 260 / this.baseWindowScale, 16, 16, 16, 16).setScale(this.baseWindowScale);
    this.text = this.addText(-880, +335, '', TEXTSTYLE.MESSAGE_BLACK).setOrigin(0, 0).setScale(1);

    this.container.add(bg);
    this.container.add(this.pokemon);
    this.container.add(this.baseWindow);
    this.container.add(this.text);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.container.setScrollFactor(0);

    this.contentContainer.setVisible(false);
    this.contentContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.contentContainer.setScrollFactor(0);
  }

  async show(data?: any): Promise<WildRes | null> {
    await this.showPokemon();

    runFadeEffect(this.scene, 1000, 'in');
    this.container.setVisible(true);
    this.contentContainer.setVisible(true);

    const ret = await this.handleKeyInput();

    return new Promise((resolve) => {
      if (ret) {
        this.clean();
        resolve(ret as WildRes);
      } else {
        resolve(null);
      }
    });
  }

  protected onClean(): void {
    runFadeEffect(this.scene, 1000, 'in');
    this.textObjects.forEach((obj) => obj.destroy());
    this.textObjects = [];
    this.lastChoice = 0;
  }

  pause(onoff: boolean, data?: any): void {}

  async handleKeyInput(...data: any[]) {
    return new Promise((resolve) => {
      const keyboard = KeyboardManager.getInstance();
      const keys = [KEY.ARROW_LEFT, KEY.ARROW_RIGHT, KEY.Z, KEY.ENTER];

      let start = 0;
      let end = this.balls.length - 1;
      let choice = this.lastChoice ? this.lastChoice : 0;

      this.renderEffect(0, choice);
      this.renderPokemon(this.starterPokemons[choice]);

      const keyHandler = async (key: KEY) => {
        const prevChoice = choice;

        switch (key) {
          case KEY.ARROW_LEFT:
            if (choice > start) {
              choice--;
            }
            break;
          case KEY.ARROW_RIGHT:
            if (choice < end && choice < this.balls.length - 1) {
              choice++;
            }
            break;
          case KEY.ENTER:
          case KEY.Z: {
            keyboard.setAllowKey([]);
            keyboard.setKeyDownCallback(() => {});
            await this.questionMessage.show({
              type: 'default',
              content: replacePercentSymbol(i18next.t('message:tutorial_choice'), [
                i18next.t(`menu:type${getPokemonType(this.starterPokemons[choice].type1)}`),
                i18next.t(`pokemon:${this.starterPokemons[choice].pokedex}.name`),
              ]),
              speed: Option.getTextSpeed()!,
              yes: async () => {
                const ret = await catchStarterPokemonApi({ idx: this.starterPokemons[choice].idx });
                resolve(ret.result ? this.starterPokemons[choice] : null);
              },
              no: async () => {
                registerHandler();
              },
            });
            return;
          }
        }
        if (key === KEY.ARROW_LEFT || key === KEY.ARROW_RIGHT) {
          if (choice !== prevChoice) {
            playEffectSound(this.scene, `${parseInt(this.starterPokemons[choice].pokedex) ?? '1'}`);
            playEffectSound(this.scene, AUDIO.SELECT_0);

            this.lastChoice = choice;
            this.renderEffect(prevChoice, choice);
            this.renderPokemon(this.starterPokemons[choice]);
          }
        }
      };

      const registerHandler = () => {
        keyboard.setAllowKey(keys);
        keyboard.setKeyDownCallback((key) => {
          void keyHandler(key);
        });
      };

      registerHandler();
    });
  }

  update(time?: number, delta?: number): void {}

  private renderEffect(prev: number, current: number) {
    const prevFinger = this.fingers[prev];
    const currentFinger = this.fingers[current];
    const currentBall = this.balls[current];

    prevFinger.setTexture(TEXTURE.BLANK);
    prevFinger.anims.stop();
    currentFinger.setTexture(TEXTURE.TUTORIAL_CHOICE_FINGER);
    currentFinger.anims.play({ key: ANIMATION.TUTORIAL_CHOICE_FINGER, repeat: -1 });
    currentBall.anims.play({ key: ANIMATION.TUTORIAL_CHOICE_BALL, repeat: 0 });

    currentBall.once('animationcomplete', () => {
      currentBall.setFrame(0);
      currentBall.anims.stop();
    });
  }

  private renderPokemon(wild: WildRes) {
    const shiny = wild.shiny ? 's' : '';
    let gender = wild.gender === 'male' ? 'm' : wild.gender === 'female' ? 'f' : '';
    let pokedex = wild.pokedex;

    this.pokemon.setTexture(`pokemon_sprite${pokedex}_${gender}${shiny}`);
    this.showMessage(
      {
        type: 'default',
        content: replacePercentSymbol(i18next.t('message:tutorial_select'), [i18next.t(`menu:type${getPokemonType(wild.type1)}`), i18next.t(`pokemon:${pokedex}.name`)]),
        speed: Option.getTextSpeed()!,
        endDelay: MessageEndDelay.DEFAULT,
      },
      wild.type1,
    );
  }

  private async showPokemon() {
    const ret = await enterSafariZoneApi({ overworld: 'lab', time: getCurrentTimeOfDay() });

    if (ret.result) {
      const contentWidth = 100;
      const spacing = 20;
      const wilds = ret.data.wilds;

      const sortedWilds = wilds.sort((a, b) => {
        const aNum = parseInt(a.pokedex, 10);
        const bNum = parseInt(b.pokedex, 10);
        return aNum - bNum;
      });

      const calc = (sortedWilds.length / 2) * (contentWidth + spacing);

      this.starterPokemons = sortedWilds;

      this.contentContainer.setPosition(this.sceneWidth / 2 - calc, this.sceneHeight / 2 + 60);

      let currentX = 0;
      for (let i = 0; i < sortedWilds.length; i++) {
        const ball = this.createSprite(TEXTURE.TUTORIAL_CHOICE_BALL, currentX, 0);
        ball.setScale(2.4);
        const finger = this.createSprite(TEXTURE.BLANK, currentX, -170);
        finger.setScale(2);
        this.balls.push(ball);
        this.fingers.push(finger);
        this.contentContainer.add(ball);
        this.contentContainer.add(finger);

        currentX += contentWidth + spacing;
      }
    }
  }

  private showMessage(talk: Talk, type: string) {
    if (this.textSpeedTimer) {
      this.textSpeedTimer.destroy();
      this.textSpeedTimer = null;
    }

    this.textObjects.forEach((obj) => obj.destroy());
    this.textObjects = [];

    const content = talk.content;
    const speed = talk.speed;
    const segments = this.parseBBCode(content);

    let currentX = -880;
    let currentY = 340;
    const startX = -880;
    const lineHeight = 70;

    return new Promise<void>((resolve) => {
      let segmentIndex = 0;
      let charIndex = 0;

      const addNextChar = () => {
        if (segmentIndex >= segments.length) {
          this.textSpeedTimer = null;
          resolve();
          return;
        }

        const segment = segments[segmentIndex];

        if (charIndex === 0) {
          const style = segment.isSpecial && segment.tagType === 'special' ? this.getTextStyleForTag(type) : TEXTSTYLE.MESSAGE_BLACK;
          const textObj = this.addText(currentX, currentY, '', style).setOrigin(0, 0).setScale(1);
          this.container.add(textObj);
          this.textObjects.push(textObj);
        }

        const currentTextObj = this.textObjects[this.textObjects.length - 1];
        const char = segment.text[charIndex];

        if (char === '\n') {
          currentY += lineHeight;
          currentX = startX;
          charIndex++;

          if (charIndex < segment.text.length) {
            const style = segment.isSpecial && segment.tagType === 'special' ? this.getTextStyleForTag(type) : TEXTSTYLE.MESSAGE_BLACK;
            const newTextObj = this.addText(currentX, currentY, '', style).setOrigin(0, 0).setScale(1);
            this.container.add(newTextObj);
            this.textObjects.push(newTextObj);
          }
        } else {
          currentTextObj.text += char;
          charIndex++;
        }

        if (charIndex >= segment.text.length) {
          if (!segment.text.endsWith('\n')) {
            currentX += currentTextObj.displayWidth;
          }
          segmentIndex++;
          charIndex = 0;
        }

        this.textSpeedTimer = this.scene.time.delayedCall(speed, addNextChar, [], this);
      };

      addNextChar();
    });
  }

  private parseBBCode(content: string): { text: string; isSpecial: boolean; tagType?: string }[] {
    const segments: { text: string; isSpecial: boolean; tagType?: string }[] = [];
    const regex = /\[special\](.*?)\[\/special\]/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const normalText = content.substring(lastIndex, match.index);
        segments.push({ text: normalText, isSpecial: false });
      }

      segments.push({ text: match[1], isSpecial: true, tagType: 'special' });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      segments.push({ text: content.substring(lastIndex), isSpecial: false });
    }

    return segments;
  }

  private getTextStyleForTag(type: string): TEXTSTYLE {
    switch (type) {
      case 'blue':
        return TEXTSTYLE.TYPE_WATER;
      case 'red':
        return TEXTSTYLE.TYPE_FIRE;
      case 'green':
      case 'grass':
        return TEXTSTYLE.TYPE_GRASS;
      case 'yellow':
      case 'electric':
        return TEXTSTYLE.TYPE_ELECTRIC;
      case 'fire':
        return TEXTSTYLE.TYPE_FIRE;
      case 'water':
        return TEXTSTYLE.TYPE_WATER;
      case 'psychic':
        return TEXTSTYLE.TYPE_PSYCHIC;
      case 'ice':
        return TEXTSTYLE.TYPE_ICE;
      case 'dragon':
        return TEXTSTYLE.TYPE_DRAGON;
      case 'dark':
        return TEXTSTYLE.TYPE_DARK;
      case 'fairy':
        return TEXTSTYLE.TYPE_FAIRY;
      case 'fighting':
        return TEXTSTYLE.TYPE_FIGHTING;
      case 'poison':
        return TEXTSTYLE.TYPE_POISON;
      case 'ground':
        return TEXTSTYLE.TYPE_GROUND;
      case 'flying':
        return TEXTSTYLE.TYPE_FLYING;
      case 'bug':
        return TEXTSTYLE.TYPE_BUG;
      case 'rock':
        return TEXTSTYLE.TYPE_ROCK;
      case 'ghost':
        return TEXTSTYLE.TYPE_GHOST;
      case 'steel':
        return TEXTSTYLE.TYPE_STEEL;
      case 'normal':
        return TEXTSTYLE.TYPE_NORMAL;
      default:
        return TEXTSTYLE.MESSAGE_BLACK;
    }
  }
}
