import { TEXTURE } from '../enums/texture';
import { BoxMode } from '../modes';
import { InGameScene } from '../scenes/ingame-scene';
import { addBackground, addImage, addWindow, Ui } from './ui';

export class BoxUi extends Ui {
  private mode: BoxMode;
  private container: Phaser.GameObjects.Container[] = [];
  private bgContainer!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private xboxContainer!: Phaser.GameObjects.Container;
  private xboxBtn!: Phaser.GameObjects.Image;
  private pokemonSlotContainer!: Phaser.GameObjects.Container;
  private pokemonSlotWindow!: Phaser.GameObjects.NineSlice;
  private filterContainer!: Phaser.GameObjects.Container;
  private filterWindow!: Phaser.GameObjects.NineSlice;
  private bottomContainer!: Phaser.GameObjects.Container;
  private bottomWindow!: Phaser.GameObjects.NineSlice;
  private pokemonAllSlotContainer!: Phaser.GameObjects.Container;
  private pokemonAllSlotWindow!: Phaser.GameObjects.Image;
  private pokemonInfoTopContainer!: Phaser.GameObjects.Container;
  private pokemonInfoTop!: Phaser.GameObjects.Image;
  private pokemonInfoSpriteContainer!: Phaser.GameObjects.Container;
  private pokemonInfoSprite!: Phaser.GameObjects.Image;
  private pokemonInfoBottomContainer!: Phaser.GameObjects.Container;
  private pokemonInfoBottom!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene, mode: BoxMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const ui = this.getUi();
    const width = this.getWidth();
    const height = this.getHeight();

    this.bgContainer = this.scene.add.container(width / 4, height / 4);
    this.bg = addBackground(this.scene, TEXTURE.BG_BOX, width, height);
    this.bgContainer.add(this.bg);
    this.bg.setVisible(false);

    this.xboxContainer = this.scene.add.container(width / 4, height / 4);
    this.xboxBtn = addImage(this.scene, TEXTURE.XBOX, 458, -250);
    this.xboxContainer.add(this.xboxBtn);
    this.xboxContainer.setVisible(false);

    this.pokemonSlotContainer = this.scene.add.container(width / 4 + 440, height / 4 - 25);
    this.pokemonSlotWindow = addWindow(this.scene, TEXTURE.WINDOW_BOX, 0, 0, 70, 355, 16, 16, 16, 16);
    this.pokemonSlotContainer.add(this.pokemonSlotWindow);
    this.pokemonSlotContainer.setVisible(false);

    this.filterContainer = this.scene.add.container(width / 4 + 165, height / 4 - 235);
    this.filterWindow = addWindow(this.scene, TEXTURE.WINDOW_BOX, 0, 0, 620, 60, 16, 16, 16, 16);
    this.filterContainer.add(this.filterWindow);
    this.filterContainer.setVisible(false);

    this.bottomContainer = this.scene.add.container(width / 4 + 440, height / 4 + 210);
    this.bottomWindow = addWindow(this.scene, TEXTURE.WINDOW_BOX, 0, 0, 70, 110, 16, 16, 16, 16);
    this.bottomContainer.add(this.bottomWindow);
    this.bottomContainer.setVisible(false);

    this.pokemonAllSlotContainer = this.scene.add.container(width / 4 + 130, height / 4 + 30);
    this.pokemonAllSlotWindow = addImage(this.scene, TEXTURE.WINDOW_BOX_STORAGE, 0, 0).setScale(1.5);
    this.pokemonAllSlotContainer.add(this.pokemonAllSlotWindow);
    this.pokemonAllSlotContainer.setVisible(false);

    this.pokemonInfoTopContainer = this.scene.add.container(width / 4 - 310, height / 4 - 215);
    this.pokemonInfoTop = addImage(this.scene, TEXTURE.BOX_NAME, 0, 0);
    this.pokemonInfoTopContainer.add(this.pokemonInfoTop);

    this.pokemonInfoSpriteContainer = this.scene.add.container(width / 4 - 310, height / 4 - 70);
    this.pokemonInfoSprite = addImage(this.scene, 'pokemon_sprite000', 0, 0);
    this.pokemonInfoSpriteContainer.add(this.pokemonInfoSprite);

    this.pokemonInfoBottomContainer = this.scene.add.container(width / 4 - 310, height / 4 + 150);
    this.pokemonInfoBottom = addImage(this.scene, TEXTURE.BOX_DESC, 0, 0);
    this.pokemonInfoBottomContainer.add(this.pokemonInfoBottom);

    this.container.push(this.bgContainer);
    this.container.push(this.pokemonSlotContainer);
    this.container.push(this.filterContainer);
    this.container.push(this.bottomContainer);
    this.container.push(this.pokemonAllSlotContainer);
    this.container.push(this.xboxContainer);
    this.container.push(this.pokemonInfoTopContainer);
    this.container.push(this.pokemonInfoSpriteContainer);
    this.container.push(this.pokemonInfoBottomContainer);

    ui.add(this.bg);
    ui.add(this.container);
  }

  show(data?: any): void {
    this.bg.setVisible(true);
    for (const container of this.container) {
      container.setVisible(true);
    }

    this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0, to: 1 },
      ease: 'Sine.Linear',
      duration: 200,
    });

    this.xboxBtn.setInteractive({ cursor: 'pointer' });
    this.xboxBtn.on('pointerdown', () => {
      this.mode.changeOverworldMode();
    });
    this.xboxBtn.on('pointerover', () => {
      this.xboxBtn.setAlpha(0.7);
    });
    this.xboxBtn.on('pointerout', () => {
      this.xboxBtn.setAlpha(1);
    });
  }

  clean(): void {
    this.bg.setAlpha(1);
    this.bg.setVisible(false);
    for (const container of this.container) {
      container.setVisible(false);
    }
  }

  pause(onoff: boolean): void {}

  update(time: number, delta: number): void {}
}
