import { GameScene } from '@poposafari/scenes';
import { PokemonType, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, getPokemonTypeFrame } from '@poposafari/utils';
import i18next from 'i18next';

export class PokemonTypeContainer extends Phaser.GameObjects.Container {
  private bg: GImage;
  private label: GText;

  constructor(scene: GameScene, x = 0, y = 0) {
    super(scene, x, y);

    this.bg = addImage(scene, TEXTURE.TYPES_EMPTY, undefined, 0, 0);
    this.label = addText(scene, 0, 0, '', 45, 100, 'center', TEXTSTYLE.WHITE, TEXTSHADOW.GRAY);

    this.bg.setDisplaySize(this.label.displayWidth + 130, this.label.displayHeight + 10);

    this.add([this.bg, this.label]);

    scene.add.existing(this);
  }

  setType(type: PokemonType): void {
    super.setVisible(true);
    this.label.setText(i18next.t(`pokemonType:${type}`)).setVisible(true);
    this.bg.setFrame(getPokemonTypeFrame(type)).setVisible(true);
  }

  override setVisible(value: boolean): this {
    super.setVisible(value);
    this.label.setVisible(value);
    this.bg.setVisible(value);
    return this;
  }

  clear(): void {
    this.setVisible(false);
    this.label.setText('');
  }
}
