import { GameScene } from '@poposafari/scenes';
import { PokemonHiddenMove, PokemonType, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, getPokemonTypeFrame } from '@poposafari/utils';
import i18next from 'i18next';

const HIDDEN_MOVE_TYPE: Record<PokemonHiddenMove, PokemonType> = {
  move_cut: 'normal',
  move_fly: 'flying',
  move_surf: 'water',
  move_strength: 'normal',
  move_flash: 'normal',
  'move_rock-smash': 'fighting',
  move_waterfall: 'water',
  move_dive: 'water',
  'move_mean-look': 'normal',
  move_defog: 'flying',
  'move_ancient-power': 'rock',
  'move_double-hit': 'normal',
  'move_dragon-pulse': 'dragon',
  'move_hyper-drill': 'normal',
  move_mimic: 'normal',
  move_rollout: 'rock',
  move_stomp: 'normal',
  move_taunt: 'dark',
  'move_twin-beam': 'normal',
};

export class PokemonSkillContainer extends Phaser.GameObjects.Container {
  private bg: GImage;
  private label: GText;

  constructor(scene: GameScene, x = 0, y = 0) {
    super(scene, x, y);

    this.bg = addImage(scene, TEXTURE.TYPES_EMPTY, undefined, 0, 0);
    this.label = addText(
      scene,
      0,
      0,
      '파도타기',
      35,
      100,
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );

    this.bg.setDisplaySize(this.label.displayWidth + 100, this.label.displayHeight + 10);

    this.add([this.bg, this.label]);

    scene.add.existing(this);
  }

  setType(move: PokemonHiddenMove): void {
    super.setVisible(true);
    this.label.setText(i18next.t(`pokemonHiddenMove:${move}`)).setVisible(true);
    this.bg.setFrame(getPokemonTypeFrame(HIDDEN_MOVE_TYPE[move])).setVisible(true);
    this.bg.setDisplaySize(this.label.displayWidth + 100, this.label.displayHeight + 10);
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
