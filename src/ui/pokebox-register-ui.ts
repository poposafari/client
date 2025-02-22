import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { PokeBoxUi } from './pokebox-ui';
import { addBackground, addImage, addText, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { KeyboardManager } from '../managers';
import { KEY } from '../enums/key';
import { Message } from '../interface/sys';
import { PokeBoxSlotUi } from './pokebox-slot-ui';

export class PokeboxRegisterUi extends Ui {
  private mode: OverworldMode;
  private pokeboxUi: PokeBoxUi;
  private pokeboxSlotUi: PokeBoxSlotUi;
  private targetPokedex!: string;

  private container!: Phaser.GameObjects.Container;
  private choiceContainer!: Phaser.GameObjects.Container;
  private btns: Phaser.GameObjects.Image[] = [];
  private registerText!: Phaser.GameObjects.Text;

  constructor(scene: InGameScene, mode: OverworldMode, pokeboxUi: PokeBoxUi, pokeboxSlotUi: PokeBoxSlotUi) {
    super(scene);
    this.mode = mode;
    this.pokeboxUi = pokeboxUi;
    this.pokeboxSlotUi = pokeboxSlotUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2 + 730, height / 2 + 360);

    this.choiceContainer = this.scene.add.container(0, 0);
    const registerWindow = addImage(this.scene, TEXTURE.CHOICE, 0, -20).setScale(1.4);
    this.registerText = addText(this.scene, -80, -20, i18next.t('menu:addParty'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);
    const cancelWindow = addImage(this.scene, TEXTURE.CHOICE, 0, +50).setScale(1.4);
    const cancelText = addText(this.scene, -80, +50, i18next.t('sys:cancel'), TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);
    this.btns.push(registerWindow);
    this.btns.push(cancelWindow);
    this.choiceContainer.add(registerWindow);
    this.choiceContainer.add(cancelWindow);
    this.choiceContainer.add(this.registerText);
    this.choiceContainer.add(cancelText);

    this.container.add(this.choiceContainer);

    this.container.setVisible(false);
    this.container.setScale(2);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.targetPokedex = data;

    this.container.setVisible(true);
    this.pause(false, data);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.pause(true);
  }

  pause(onoff: boolean, data?: any): void {
    const keyboardMananger = KeyboardManager.getInstance();
    const keys = [KEY.UP, KEY.DOWN, KEY.SELECT, KEY.CANCEL];
    const playerInfo = this.mode.getPlayerInfo();

    if (playerInfo!.hasPartySlot(this.targetPokedex)) {
      this.registerText.setText(i18next.t('menu:removeParty'));
    } else {
      this.registerText.setText(i18next.t('menu:addParty'));
    }

    let start = 0;
    let end = 1;
    let choice = start;

    this.btns[choice].setTexture(TEXTURE.CHOICE_S);

    keyboardMananger.setAllowKey(keys);
    keyboardMananger.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            choice = Math.max(start, choice - 1);
            break;
          case KEY.DOWN:
            choice = Math.min(end, choice + 1);
            break;
          case KEY.SELECT:
            if (!playerInfo) return;
            if (choice === 0) {
              if (playerInfo.hasPartySlot(this.targetPokedex)) {
                this.registerText.setText(i18next.t('menu:removeParty'));
                playerInfo.removePartSlot(this.targetPokedex);
                this.pokeboxSlotUi.updateFollowPet(this.targetPokedex);
              } else {
                const result = playerInfo.addPartySlot(this.targetPokedex);
                if (!result) {
                  this.mode.startMessage(this.cautionSlotMessage());
                }
              }
              this.pokeboxSlotUi.update();
            }
          case KEY.CANCEL:
            this.clean();
            this.pokeboxUi.pause(false);
            this.btns[1].setTexture(TEXTURE.CHOICE);
            return;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (choice !== prevChoice) {
        this.btns[prevChoice].setTexture(TEXTURE.CHOICE);
        this.btns[choice].setTexture(TEXTURE.CHOICE_S);
      }
    });
  }

  update(time: number, delta: number): void {}

  private cautionSlotMessage(): Message[] {
    return [{ type: 'sys', format: 'talk', content: i18next.t('message:maxSlot') }];
  }
}
