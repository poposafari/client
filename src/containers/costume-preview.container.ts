import { GameScene } from '@poposafari/scenes';
import { ANIMATION, TEXTURE } from '@poposafari/types';
import { addImage, addSprite } from '@poposafari/utils';

export class CostumePreview extends Phaser.GameObjects.Container {
  private characterSlots: GSprite[][] = [];

  private arrowLeft!: GImage;
  private arrowRight!: GImage;

  private selectedSkin: string = 'skin_0';
  private selectedHair: string = 'hair_0';
  private selectedHairColor: string = 'c0';
  private selectedOutfit: string = 'outfit_0';
  private selectedGender: 'm' | 'f' = 'm';

  private currentPage: number = 0;
  private readonly pageSize: number = 4;
  private readonly contentWidth = 140;
  private readonly frameIndex = [0, 4, 8, 12, 0];

  private get isBackPage(): boolean {
    return this.currentPage === 1;
  }

  private get texturePrefix(): string {
    return this.isBackPage ? 'player_back' : 'player_overworld';
  }

  private get animationKey(): string {
    return this.isBackPage ? ANIMATION.PLAYER_BACK_SKIN : ANIMATION.PLAYER_OVERWORLD_SKIN;
  }

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.setScrollFactor(0);
    this.setVisible(true);
    scene.add.existing(this);
  }

  create(totalSlots: number, spriteScale: number) {
    this.createArrows();
    this.initCharacterSlots(totalSlots, spriteScale);
    this.refreshLayout();
  }

  private createArrows() {
    this.arrowLeft = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, -320, -20)
      .setScale(2.8)
      .setFlipX(true)
      .setInteractive({ cursor: 'pointer' });

    this.arrowRight = addImage(this.scene, TEXTURE.CURSOR_WHITE, undefined, +320, -20)
      .setScale(2.8)
      .setInteractive({ cursor: 'pointer' });

    this.add([this.arrowLeft, this.arrowRight]);

    this.arrowLeft.on('pointerup', () => this.changePage(-1));
    this.arrowRight.on('pointerup', () => this.changePage(1));
  }

  private initCharacterSlots(totalCount: number, scale: number) {
    for (let i = 0; i < totalCount; i++) {
      let skin = null;
      let hair = null;
      let outfit = null;

      if (i === totalCount - 1) {
        skin = this.createBaseSprite(4.2);
        outfit = this.createBaseSprite(4.2);
        hair = this.createBaseSprite(4.2);
      } else {
        skin = this.createBaseSprite(scale);
        outfit = this.createBaseSprite(scale);
        hair = this.createBaseSprite(scale);
      }

      const layers = [hair, outfit, skin];

      this.characterSlots.push(layers);
      this.add(layers);
    }

    this.refreshAllTextures();
  }

  private createBaseSprite(scale: number): GSprite {
    const sprite = addSprite(this.scene, '', undefined, 0, -50);
    sprite.setScale(scale);
    return sprite;
  }

  private changePage(delta: number) {
    const totalPages = Math.ceil(this.characterSlots.length / this.pageSize);
    this.currentPage = (this.currentPage + delta + totalPages) % totalPages;

    this.refreshAllTextures();
    this.refreshLayout();
  }

  private refreshLayout() {
    this.characterSlots.forEach((layers) => {
      layers.forEach((sprite) => sprite.setVisible(false));
    });

    const startIndex = this.currentPage * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.characterSlots.length);
    const countOnPage = endIndex - startIndex;
    const totalWidth = (countOnPage - 1) * this.contentWidth;
    let currentX = -(totalWidth / 2);

    for (let i = startIndex; i < endIndex; i++) {
      const layers = this.characterSlots[i];
      layers.forEach((sprite) => {
        sprite.setVisible(true);
        sprite.setX(currentX);
      });
      currentX += this.contentWidth;
    }
  }

  private refreshAllTextures() {
    for (let i = 0; i < this.characterSlots.length; i++) {
      this.updateSlotTextures(i);
    }
  }

  private updateSlotTextures(slotIndex: number) {
    if (!this.characterSlots[slotIndex]) return;

    let skinKey = '';
    if (this.texturePrefix === 'player_overworld') {
      skinKey = `${this.texturePrefix}_${this.selectedSkin}`;
    } else {
      skinKey = `${this.texturePrefix}_${this.selectedGender}_${this.selectedSkin}`;
    }

    let hairKey = `${this.texturePrefix}_${this.selectedGender}_${this.selectedHair}_${this.selectedHairColor}`;
    if (!this.scene.textures.exists(hairKey)) {
      hairKey = `${this.texturePrefix}_${this.selectedGender}_${this.selectedHair}_${this.selectedGender === 'f' ? 'c1' : 'c0'}`;
    }

    const outfitKey = `${this.texturePrefix}_${this.selectedGender}_${this.selectedOutfit}`;

    const frameIdx = this.frameIndex[slotIndex % this.frameIndex.length];
    const frameName = `${this.animationKey}-${frameIdx}`;

    this.applyTexture(slotIndex, 0, skinKey, frameName);
    this.applyTexture(slotIndex, 1, outfitKey, frameName);
    this.applyTexture(slotIndex, 2, hairKey, frameName);
  }

  private applyTexture(
    slotIndex: number,
    layerIndex: number,
    textureKey: string,
    frameName: string,
  ) {
    const sprite = this.characterSlots[slotIndex][layerIndex];
    if (!sprite) return;

    if (this.scene.textures.exists(textureKey)) {
      sprite.setTexture(textureKey);

      if (this.scene.textures.get(textureKey).has(frameName)) {
        sprite.setFrame(frameName);
      } else {
        const fallbackFrame = `${this.animationKey}-0`;
        if (this.scene.textures.get(textureKey).has(fallbackFrame)) {
          sprite.setFrame(fallbackFrame);
        }
      }
    } else {
      console.warn(`Texture missing: ${textureKey}`);
    }
  }

  public updateGender(gender: 'female' | 'male') {
    if (gender === 'female') {
      this.selectedGender = 'f';
    } else {
      this.selectedGender = 'm';
    }

    this.refreshAllTextures();
  }

  public updateAllSkin(itemId: string) {
    this.selectedSkin = itemId;
    this.refreshAllTextures();
  }

  public updateAllHair(itemId: string) {
    this.selectedHair = itemId;
    this.refreshAllTextures();
  }

  public updateAllHairColor(colorId: string) {
    this.selectedHairColor = colorId;
    this.refreshAllTextures();
  }

  public updateAllOutfit(itemId: string) {
    this.selectedOutfit = itemId;
    this.refreshAllTextures();
  }

  public getCurrentPage(): number {
    return this.currentPage;
  }
}
