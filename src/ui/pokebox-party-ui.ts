import i18next from 'i18next';
import { DEPTH } from '../enums/depth';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager } from '../managers';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { MyPokemon } from '../storage/box';
import { MAX_PARTY_SLOT, PlayerInfo } from '../storage/player-info';
import { isPokedexShiny } from '../utils/string-util';
import { PokeboxUi } from './pokebox-ui';
import { addImage, addText, addWindow, playSound, Ui } from './ui';
import { TEXTSTYLE } from '../enums/textstyle';
import { PokemonGender } from '../object/pokemon-object';
import { AUDIO } from '../enums/audio';

export class PokeboxPartyUi extends Ui {
  private mode: OverworldMode;
  private pokeboxUi: PokeboxUi;

  private container!: Phaser.GameObjects.Container;
  private iconContainer!: Phaser.GameObjects.Container;
  private menuContainer!: Phaser.GameObjects.Container;

  private petIcon!: Phaser.GameObjects.Image;
  private shinyIconPet!: Phaser.GameObjects.Image;
  private partyIcons: Phaser.GameObjects.Image[] = [];
  private partyDummys: Phaser.GameObjects.Image[] = [];
  private shinyIcons: Phaser.GameObjects.Image[] = [];
  private menuWindows: Phaser.GameObjects.Image[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];

  private lastStart!: number;

  private readonly menu: string[] = [i18next.t('menu:removeParty'), i18next.t('menu:follow'), i18next.t('menu:cancel')];

  constructor(scene: InGameScene, mode: OverworldMode, pokeboxUi: PokeboxUi) {
    super(scene);
    this.mode = mode;
    this.pokeboxUi = pokeboxUi;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();
    const contentHeight = 55;

    this.setupMenu(width, height);
    this.setupIcon(width, height, contentHeight);

    this.container = this.scene.add.container(width / 2 - 850, height / 2 + 160);

    const petWindow = addWindow(this.scene, TEXTURE.WINDOW_7, 0, -192, contentHeight, contentHeight, 16, 16, 16, 16);
    const partyWindow = addWindow(this.scene, TEXTURE.WINDOW_7, 0, -32, contentHeight, 42 * MAX_PARTY_SLOT, 16, 16, 16, 16);

    this.container.add(petWindow);
    this.container.add(partyWindow);

    this.container.setScale(2.6);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 1);
    this.container.setScrollFactor(0);

    this.iconContainer.setVisible(false);
    this.iconContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 2);
    this.iconContainer.setScrollFactor(0);

    this.menuContainer.setVisible(false);
    this.menuContainer.setDepth(DEPTH.OVERWORLD_NEW_PAGE + 3);
    this.menuContainer.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.iconContainer.setVisible(true);

    this.lastStart = 0;
  }

  clean(data?: any): void {
    this.container.setVisible(false);
    this.iconContainer.setVisible(false);
    this.menuContainer.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  handleKeyInput() {
    const keys = [KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.SELECT];
    const keyboardManager = KeyboardManager.getInstance();

    let start = this.lastStart ? this.lastStart : 0;
    let end = MAX_PARTY_SLOT - 1;
    let choice = start;

    this.partyDummys[choice].setTexture(TEXTURE.ARROW_W_R);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
      const prevChoice = choice;

      try {
        switch (key) {
          case KEY.UP:
            if (choice <= MAX_PARTY_SLOT - 1 && choice >= 1) choice--;
            break;
          case KEY.DOWN:
            if (choice < end && choice < MAX_PARTY_SLOT - 1) {
              choice++;
            }
            break;
          case KEY.RIGHT:
            playSound(this.scene, AUDIO.OVERWORD_MENU_SELECT);

            this.lastStart = 0;
            this.partyDummys[choice].setTexture(TEXTURE.BLANK);
            this.pokeboxUi.getPokeboxMainUi().handleKeyInput();
            break;
          case KEY.SELECT:
            const target = PlayerInfo.getInstance().getPartySlot()[choice];
            if (target) {
              playSound(this.scene, AUDIO.BAG_SELECT);

              this.handleMenuKeyInput(target);
            }
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (choice !== prevChoice) {
        playSound(this.scene, AUDIO.OVERWORD_MENU_SELECT);

        this.partyDummys[prevChoice].setTexture(TEXTURE.BLANK);
        this.partyDummys[choice].setTexture(TEXTURE.ARROW_W_R);

        this.lastStart = choice;
      }
    });
  }

  handleMenuKeyInput(target: string) {
    const keys = [KEY.DOWN, KEY.UP, KEY.SELECT, KEY.CANCEL];
    const keyboardManager = KeyboardManager.getInstance();

    let start = 0;
    let end = 2;
    let choice = start;
    let hasPet = this.hasPet(target);

    hasPet ? this.menuTexts[1].setText(i18next.t('menu:removeFollow')) : this.menuTexts[1].setText(i18next.t('menu:follow'));
    this.menuContainer.setVisible(true);

    this.menuWindows[choice].setTexture(TEXTURE.CHOICE_S);

    keyboardManager.setAllowKey(keys);
    keyboardManager.setKeyDownCallback((key) => {
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
            if (choice === 0) {
              playSound(this.scene, AUDIO.BAG_SELECT);

              if (hasPet) PlayerInfo.getInstance().setPet(null);
              this.updatePetIcon();

              const [pokedex, gender] = target.split('_');
              this.removeParty(null, this.lastStart);
              this.pokeboxUi.updatePokemonTint(pokedex, gender as PokemonGender);
              this.mode.updatePartySlotUi();
              this.cleanMenu(choice);
              this.handleKeyInput();
            } else if (choice === 1) {
              playSound(this.scene, AUDIO.BAG_SELECT);

              if (hasPet) {
                PlayerInfo.getInstance().setPet(null);
              } else {
                this.setPet(target);
              }
              this.updatePetIcon();
              this.cleanMenu(choice);
              this.handleKeyInput();
            } else {
              playSound(this.scene, AUDIO.BAG_CLOSE);

              this.cleanMenu(choice);
              this.handleKeyInput();
            }
            break;
          case KEY.CANCEL:
            playSound(this.scene, AUDIO.BAG_CLOSE);

            this.cleanMenu(choice);
            this.handleKeyInput();
            break;
        }
      } catch (error) {
        console.error(`Error handling key input: ${error}`);
      }

      if (choice !== prevChoice) {
        playSound(this.scene, AUDIO.BAG_DECISON);

        this.menuWindows[prevChoice].setTexture(TEXTURE.CHOICE);
        this.menuWindows[choice].setTexture(TEXTURE.CHOICE_S);
      }
    });
  }

  addParty(pokemon: MyPokemon) {
    if (pokemon && PlayerInfo.getInstance().addPartySlot(pokemon)) {
      this.updateParty();
      return true;
    }

    return false;
  }

  removeParty(pokemon: MyPokemon | null, idx?: number) {
    if (!pokemon && idx !== undefined && idx >= 0) {
      PlayerInfo.getInstance().removePartSlot(null, idx);
    } else {
      PlayerInfo.getInstance().removePartSlot(pokemon!);
    }

    this.updateParty();
  }

  private updateParty() {
    const party = PlayerInfo.getInstance().getPartySlot();
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      this.shinyIcons[i].setTexture(TEXTURE.BLANK);
      if (party[i]) {
        const key = party[i]?.split('_')[0];
        this.partyIcons[i].setTexture(`pokemon_icon${key}`);
        if (isPokedexShiny(key!)) this.shinyIcons[i].setTexture(TEXTURE.SHINY);
      } else {
        this.partyIcons[i].setTexture(`pokemon_icon000`);
      }
    }
  }

  private updatePetIcon() {
    const pet = PlayerInfo.getInstance().getPet();

    this.shinyIconPet.setTexture(TEXTURE.BLANK);

    if (pet) {
      const key = pet.split('_')[0];
      this.petIcon.setTexture(`pokemon_icon${key}`);
      if (isPokedexShiny(key!)) this.shinyIconPet.setTexture(TEXTURE.SHINY);
    } else {
      this.petIcon.setTexture(`pokemon_icon000`);
    }
  }

  private setupMenu(width: number, height: number) {
    const contentHeight: number = 40;
    const spacing: number = 10;
    let currentY = 0;

    this.menuContainer = this.scene.add.container(width / 2 + 710, height / 2 + 190);

    for (const info of this.menu) {
      const window = addImage(this.scene, TEXTURE.CHOICE, 0, currentY);
      const text = addText(this.scene, -60, currentY, info, TEXTSTYLE.CHOICE_DEFAULT).setOrigin(0, 0.5);

      this.menuWindows.push(window);
      this.menuTexts.push(text);

      this.menuContainer.add(window);
      this.menuContainer.add(text);

      currentY += contentHeight + spacing;
    }

    this.menuContainer.setScale(2.6);
  }

  private setupIcon(width: number, height: number, contentHeight: number) {
    const spacing = 10;
    let currentY = 0;

    this.iconContainer = this.scene.add.container(width / 2 - 850, height / 2 + 50);

    const petTitle = addText(this.scene, 0, -330, i18next.t('menu:followPokemon'), TEXTSTYLE.INPUT_GUIDE_WHITE);
    this.petIcon = addImage(this.scene, `pokemon_icon000`, 0, -260);
    this.shinyIconPet = addImage(this.scene, TEXTURE.BLANK, -25, -280).setScale(1.1);

    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      const icon = addImage(this.scene, `pokemon_icon000`, 0, currentY - 152);
      const dummy = addImage(this.scene, TEXTURE.BLANK, -45, currentY - 143).setScale(2);
      const shiny = addImage(this.scene, TEXTURE.BLANK, -25, currentY - 170).setScale(1.1);

      this.partyIcons.push(icon);
      this.partyDummys.push(dummy);
      this.shinyIcons.push(shiny);

      this.iconContainer.add(icon);
      this.iconContainer.add(dummy);
      this.iconContainer.add(shiny);

      currentY += contentHeight + spacing;
    }

    this.iconContainer.add(petTitle);
    this.iconContainer.add(this.petIcon);
    this.iconContainer.add(this.shinyIconPet);
    this.iconContainer.setScale(1.5);
  }

  private cleanMenu(choice: number) {
    this.menuContainer.setVisible(false);
    this.menuWindows[choice].setTexture(TEXTURE.CHOICE);
  }

  private hasPet(target: string | null) {
    return PlayerInfo.getInstance().getPet() === target;
  }

  private setPet(pet: string | null) {
    PlayerInfo.getInstance().setPet(pet);
    this.updatePetIcon();
  }
}
