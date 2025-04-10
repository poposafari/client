import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { PokeBoxUi } from './pokebox-ui';
import { addImage, addText, addWindow, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { getGenderAndShinyInfo, getOriginPokedex, getPokemonOverworldOrIconKey, isPokedexShiny, trimLastChar } from '../utils/string-util';
import { MyPokemon } from '../storage/box';

export class PokeBoxSlotUi extends Ui {
  private mode: OverworldMode;
  private pokeboxUi: PokeBoxUi;

  private container!: Phaser.GameObjects.Container;
  private iconPet!: Phaser.GameObjects.Image;
  private icons: Phaser.GameObjects.Image[] = [];
  private dummys: Phaser.GameObjects.Image[] = [];

  private readonly MaxSlot: number = 6;

  constructor(scene: InGameScene, mode: OverworldMode, pokeboxUi: PokeBoxUi) {
    super(scene);
    this.mode = mode;
    this.pokeboxUi = pokeboxUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const spacing = 30;
    const contentHeight = 65;
    let currentY = 0;

    this.container = this.scene.add.container(width / 2 - 855, height / 2);
    const windowParty = addWindow(this.scene, TEXTURE.WINDOW_5, 0, 20, contentHeight + 30, contentHeight * this.MaxSlot, 16, 16, 16, 16).setScale(1.6);
    this.container.add(windowParty);

    const textPet = addText(this.scene, 0, -440, i18next.t('menu:followPet'), TEXTSTYLE.BOX_CAPTURE_TITLE).setScale(0.4);
    const windowPet = addWindow(this.scene, TEXTURE.WINDOW_5, 0, -390, contentHeight + 30, contentHeight + 30, 16, 16, 16, 16).setScale(1.6);
    this.iconPet = addImage(this.scene, `pokemon_icon000`, 0, -390).setScale(2);
    this.container.add(windowPet);
    this.container.add(textPet);
    this.container.add(this.iconPet);

    for (let i = 0; i < this.MaxSlot; i++) {
      const icon = addImage(this.scene, `pokemon_icon000`, 0, currentY - 230).setScale(1.6);
      const dummy = addImage(this.scene, TEXTURE.BLANK, +80, currentY - 220)
        .setScale(3)
        .setFlipX(true);

      this.icons.push(icon);
      this.dummys.push(dummy);

      this.container.add(icon);
      this.container.add(dummy);

      currentY += contentHeight + spacing;
    }

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {
    onoff ? this.block() : this.unblock();
  }

  update(time?: number, delta?: number): void {
    const playerInfo = this.mode.getPlayerInfo();

    if (!playerInfo) return;

    const slots = playerInfo.getPartySlot();

    for (let i = 0; i < this.MaxSlot; i++) {
      const slotInfo = slots[i];
      if (slotInfo) {
        const iconKey = getPokemonOverworldOrIconKey(slotInfo);
        this.icons[i].setTexture(`pokemon_icon${iconKey}`);
      } else {
        this.icons[i].setTexture(`pokemon_icon000`);
      }
    }
  }

  private block() {}

  private unblock() {
    const keys = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.SELECT];
    const keyboardManager = KeyboardManager.getInstance();
    const playerInfo = this.mode.getPlayerInfo();

    if (!playerInfo) return;

    const slots = playerInfo.getPartySlot();

    let start = 0;
    let end = this.MaxSlot - 1;
    let choice = start;

    this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice > start) {
              choice--;
            }
            break;
          case KEY.DOWN:
            if (choice < end && choice < this.MaxSlot - 1) {
              choice++;
            }
            break;
          case KEY.RIGHT:
            this.dummys[choice].setTexture(TEXTURE.BLANK);
            this.pokeboxUi.pause(false);
            return;
          case KEY.SELECT:
            this.updateFollowPet(slots[choice]);
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (choice !== prevChoice) {
        this.dummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.dummys[choice].setTexture(TEXTURE.ARROW_W_R);
      }
    });
  }

  updateFollowPet(pokemon: MyPokemon) {
    const playerInfo = this.mode.getPlayerInfo();
    const iconKey = getPokemonOverworldOrIconKey(pokemon);

    if (!playerInfo) return;

    if (playerInfo.getPet() === pokemon) {
      playerInfo.setPet(null);
      this.iconPet.setTexture(`pokemon_icon000`);
      return;
    } else {
      if (playerInfo.hasPartySlot(pokemon)) {
        playerInfo.setPet(pokemon);
        this.iconPet.setTexture(`pokemon_icon${iconKey}`);
      } else {
        if (playerInfo.getPet() === pokemon) {
          playerInfo.setPet(null);
          this.iconPet.setTexture(`pokemon_icon000`);
        }
      }
    }
  }
}
