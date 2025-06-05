import { DEPTH } from '../enums/depth';
import { EASE } from '../enums/ease';
import { TEXTURE } from '../enums/texture';
import { OverworldMode } from '../modes-test';
import { InGameScene } from '../scenes/ingame-scene';
import { addImage, addWindow, Ui } from './ui';

export class HiddenMoveUi extends Ui {
  private mode: OverworldMode;

  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private pokemonSprite!: Phaser.GameObjects.Image;

  constructor(scene: InGameScene, mode: OverworldMode) {
    super(scene);
    this.mode = mode;
  }

  setup(): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.scene.add.container(width / 2, height / 2);
    this.bg = addImage(this.scene, TEXTURE.BG_HM, 0, 0);
    this.bg.setDisplaySize(width, 300);
    this.pokemonSprite = addImage(this.scene, `pokemon_sprite000`, 0, 0).setScale(4);

    this.container.add(this.bg);
    this.container.add(this.pokemonSprite);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.BATTLE_UI + 1);
    this.container.setScrollFactor(0);
  }

  show(data?: any): void {
    this.container.setVisible(true);
    this.bg.setDisplaySize(this.getWidth(), 0);
    this.pokemonSprite.setPosition(+1500, 0);

    this.scene.tweens.add({
      targets: this.bg,
      displayHeight: 300,
      duration: 400,
      ease: EASE.QUINT_EASEINOUT,
      onStart: () => {
        this.scene.tweens.add({
          targets: this.pokemonSprite,
          x: 0,
          duration: 500,
          ease: EASE.QUINT_EASEOUT,
        });
      },
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.pokemonSprite,
          x: -1500,
          duration: 500,
          ease: EASE.QUINT_EASEIN,
          onComplete: () => {
            this.scene.tweens.add({
              targets: this.bg,
              displayHeight: 0,
              duration: 400,
              ease: EASE.QUINT_EASEOUT,
              onComplete: () => {},
            });
          },
        });
      },
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  update(time: number, delta: number): void {}

  setPokemonSprite(texture: string) {
    this.pokemonSprite.setTexture(`pokemon_sprite${texture}`);
  }

  private runSurf() {}
}
