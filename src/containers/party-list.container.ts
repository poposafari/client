import type { GameScene } from '@poposafari/scenes';
import { PokemonSlotContainer } from './pokemon-slot.container';
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
  heldItemScale?: number;
  heldItemOffset?: { x: number; y: number };
}

export class PartyListContainer extends Phaser.GameObjects.Container {
  scene: GameScene;
  private strip!: WindowStripContainer;
  private slots: PokemonSlotContainer[] = [];

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
      heldItemScale = 2,
      heldItemOffset,
    } = options;

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
      const slot = new PokemonSlotContainer(this.scene, pos.x, pos.y);
      slot.create({
        iconScale,
        showLevel,
        levelOffsetY: slotSize / 2 - 4,
        levelSize,
        heldItemScale,
        heldItemOffset,
      });
      this.slots.push(slot);
      this.add(slot);
    }
  }

  /** UserManager.getParty() 를 읽어 파티 아이콘을 갱신한다. */
  refresh(): void {
    const party = this.scene.getUser()?.getParty() ?? [];
    const sorted = [...party].sort((a, b) => (a.partySlot ?? 0) - (b.partySlot ?? 0));

    for (let i = 0; i < MAX_PARTY_SIZE; i++) {
      this.slots[i]?.setPokemon(sorted[i] ?? null);
    }
  }
}
