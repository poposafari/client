import type { GameScene } from '@poposafari/scenes';
import { TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText, getPokemonTexture } from '@poposafari/utils';
import { WindowStripContainer, WindowStripOrientation } from './window-strip.container';

const MAX_PARTY_SIZE = 6;

export interface PartyListOptions {
  orientation: WindowStripOrientation;
  slotSize?: number;
  spacing?: number;
  iconScale?: number;
  showLevel?: boolean;
  frameVisible?: boolean;
  nineSlice?: { left: number; right: number; top: number; bottom: number };
  levelSize?: number;
}

export class PartyListContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private strip!: WindowStripContainer;
  private icons: GImage[] = [];
  private levels: GText[] = [];
  private showLevel = false;
  private iconScale = 2;
  private slotSize = 60;

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.scene = scene;
    this.setScrollFactor(0);
    scene.add.existing(this);
  }

  create(options: PartyListOptions): void {
    const {
      orientation,
      slotSize = 60,
      spacing = 10,
      iconScale = 2,
      showLevel = false,
      frameVisible = true,
      levelSize = 50,
      nineSlice = { left: 8, right: 8, top: 8, bottom: 8 },
    } = options;

    this.showLevel = showLevel;
    this.iconScale = iconScale;
    this.slotSize = slotSize;

    this.strip = new WindowStripContainer(this.scene);
    this.strip.create({
      orientation,
      slotCount: MAX_PARTY_SIZE,
      slotSize,
      spacing,
      nineSlice,
    });

    this.strip.getFrame().setTexture(this.scene.getOption().getWindow()).setVisible(frameVisible);
    for (const w of this.strip.getSlotWindows()) {
      w.setVisible(false);
    }
    this.add(this.strip);

    for (let i = 0; i < MAX_PARTY_SIZE; i++) {
      const pos = this.strip.getSlotCenter(i);
      const icon = addImage(this.scene, TEXTURE.BLANK, undefined, pos.x, pos.y)
        .setScale(iconScale)
        .setVisible(false);
      this.icons.push(icon);
      this.add(icon);

      if (showLevel) {
        const lv = addText(
          this.scene,
          pos.x,
          pos.y + slotSize / 2 - 4,
          '',
          levelSize,
          '150',
          'center',
          TEXTSTYLE.YELLOW,
          TEXTSHADOW.GRAY,
        ).setVisible(false);
        this.levels.push(lv);
        this.add(lv);
      }
    }
  }

  /** UserManager.getParty() 를 읽어 파티 아이콘을 갱신한다. */
  refresh(): void {
    const party = this.scene.getUser()?.getParty() ?? [];
    const sorted = [...party].sort((a, b) => (a.partySlot ?? 0) - (b.partySlot ?? 0));

    for (let i = 0; i < MAX_PARTY_SIZE; i++) {
      const p = sorted[i];
      const icon = this.icons[i];
      if (!icon) continue;

      if (p) {
        const tex = getPokemonTexture('icon', String(p.pokedexId), { isShiny: p.isShiny });
        icon
          .setTexture(tex.key, tex.frame + '_0')
          .setScale(this.iconScale)
          .setVisible(true);
        if (this.showLevel && this.levels[i]) {
          this.levels[i].setText(`(+${p.level})`).setVisible(true);
        }
      } else {
        icon.setVisible(false);
        if (this.levels[i]) this.levels[i].setVisible(false);
      }
    }
  }
}
