import type { GameScene } from '@poposafari/scenes/game.scene';
import { ANIMATION, DEPTH, EASE, TEXTURE } from '@poposafari/types';
import { addContainer, addImage, addSprite } from '@poposafari/utils';
import { getPokemonTexture } from '@poposafari/utils/string';
import {
  equippedCostumesToParts,
  genderCode,
  idToSuffix,
} from '@poposafari/feats/overworld/overworld-costume-keys';
import type { BattleContext } from '../battle.types';
import {
  PLAYER_BASE,
  PLAYER_CONTAINER,
  PLAYER_SPRITE,
  THROW_ITEM,
  WILD_BASE,
  WILD_CONTAINER,
  WILD_SHADOW,
  WILD_SPRITE,
} from '../battle.constants';

export class BattleSpriteUi extends Phaser.GameObjects.Container {
  private playerContainer!: Phaser.GameObjects.Container;
  private wildContainer!: Phaser.GameObjects.Container;

  private playerBase!: Phaser.GameObjects.Image;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerOutfit: Phaser.GameObjects.Sprite | null = null;
  private playerHair: Phaser.GameObjects.Sprite | null = null;

  private wildBase!: Phaser.GameObjects.Image;
  private wildShadow!: Phaser.GameObjects.Image;
  private wildSprite!: Phaser.GameObjects.Image;
  private throwItem!: Phaser.GameObjects.Sprite;

  constructor(scene: GameScene) {
    super(scene, 0, 0);
    this.setScrollFactor(0);
    this.setDepth(DEPTH.HUD + 1);
    scene.add.existing(this);
  }

  build(ctx: BattleContext): void {
    const scene = this.scene as GameScene;
    const { height } = scene.cameras.main;

    // ── 플레이어 컨테이너 ─────────────────────────────
    this.playerContainer = addContainer(
      scene,
      0,
      PLAYER_CONTAINER.x,
      height / 2 + PLAYER_CONTAINER.yOffset,
    );

    const platformKey = `pb_${ctx.area}_${ctx.time}`;
    this.playerBase = addImage(
      scene,
      platformKey,
      undefined,
      PLAYER_BASE.x,
      PLAYER_BASE.y,
    ).setScale(PLAYER_BASE.scale);
    this.playerContainer.add(this.playerBase);

    const backKeys = this.resolvePlayerBackKeys();
    const backStopFrame = `${ANIMATION.PLAYER_BACK_SKIN}-0`;

    this.playerSprite = addSprite(
      scene,
      backKeys.skin,
      backStopFrame,
      PLAYER_SPRITE.x,
      PLAYER_SPRITE.y,
    ).setScale(PLAYER_SPRITE.scale);
    this.playerContainer.add(this.playerSprite);

    if (backKeys.outfit && scene.textures.exists(backKeys.outfit)) {
      this.playerOutfit = addSprite(
        scene,
        backKeys.outfit,
        backStopFrame,
        PLAYER_SPRITE.x,
        PLAYER_SPRITE.y,
      ).setScale(PLAYER_SPRITE.scale);
      this.playerContainer.add(this.playerOutfit);
    }

    if (backKeys.hair && scene.textures.exists(backKeys.hair)) {
      this.playerHair = addSprite(
        scene,
        backKeys.hair,
        backStopFrame,
        PLAYER_SPRITE.x,
        PLAYER_SPRITE.y,
      ).setScale(PLAYER_SPRITE.scale);
      this.playerContainer.add(this.playerHair);
    }

    this.add(this.playerContainer);

    // ── 야생 컨테이너 ─────────────────────────────────
    this.wildContainer = addContainer(
      scene,
      0,
      WILD_CONTAINER.x,
      height / 2 + WILD_CONTAINER.yOffset,
    );

    const wildBaseKey = `eb_${ctx.area}_${ctx.time}`;
    this.wildBase = addImage(scene, wildBaseKey, undefined, WILD_BASE.x, WILD_BASE.y).setScale(
      WILD_BASE.scale,
    );
    this.wildContainer.add(this.wildBase);

    const wildTex = getPokemonTexture(
      'sprite',
      ctx.wild.pokedexId,
      { isShiny: ctx.wild.isShiny, isFemale: ctx.wild.gender === 2 },
      scene,
    );

    this.wildSprite = addImage(scene, wildTex.key, wildTex.frame, WILD_SPRITE.x, WILD_SPRITE.y)
      .setScale(WILD_SPRITE.scale)
      .setOrigin(0.5, 1);

    this.wildShadow = addImage(scene, wildTex.key, wildTex.frame, WILD_BASE.x, WILD_BASE.y)
      .setScale(WILD_SPRITE.scale, WILD_SPRITE.scale * 0.3)
      .setOrigin(0.5, 0.5)
      .setFlipY(true)
      .setTintFill(0x000000)
      .setAlpha(WILD_SHADOW.alpha);

    this.wildContainer.add(this.wildShadow);
    this.wildContainer.add(this.wildSprite);

    this.add(this.wildContainer);

    // ── 던질 아이템 (볼/먹이/돌 공용 슬롯). 시작 위치 = throw start. ──
    this.throwItem = addSprite(
      scene,
      TEXTURE.SAFARI_BALL_THROW,
      undefined,
      THROW_ITEM.startX,
      THROW_ITEM.startY,
    )
      .setScale(2.4)
      .setVisible(false)
      .setOrigin(0.5, 1);
    this.wildContainer.add(this.throwItem);

    this.setVisible(false);
  }

  show(): void {
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }

  /** 플랫폼 이미지를 새 시간대로 크로스페이드 전환한다. */
  crossfadePlatforms(area: string, newTime: string, duration: number = 2000): void {
    const scene = this.scene as GameScene;
    this.crossfadeImage(
      this.playerContainer,
      this.playerBase,
      `pb_${area}_${newTime}`,
      duration,
      (img) => {
        this.playerBase = img;
      },
    );
    this.crossfadeImage(
      this.wildContainer,
      this.wildBase,
      `eb_${area}_${newTime}`,
      duration,
      (img) => {
        this.wildBase = img;
      },
    );
  }

  private crossfadeImage(
    container: Phaser.GameObjects.Container,
    oldImg: Phaser.GameObjects.Image,
    newKey: string,
    duration: number,
    setter: (img: Phaser.GameObjects.Image) => void,
  ): void {
    const scene = this.scene as GameScene;
    if (!scene.textures.exists(newKey)) return;
    if (oldImg.texture.key === newKey) return;

    const newImg = addImage(scene, newKey, undefined, oldImg.x, oldImg.y).setScale(oldImg.scaleX);
    newImg.setAlpha(0);
    const idx = container.getIndex(oldImg);
    container.addAt(newImg, idx + 1);

    scene.tweens.add({
      targets: newImg,
      alpha: 1,
      duration,
      ease: 'Linear',
      onComplete: () => {
        oldImg.destroy();
        setter(newImg);
      },
    });
  }

  // Step 3 연출에서 직접 다룰 핸들들 노출.
  getPlayerContainer() {
    return this.playerContainer;
  }
  getWildContainer() {
    return this.wildContainer;
  }
  getWildSprite() {
    return this.wildSprite;
  }
  getWildShadow() {
    return this.wildShadow;
  }
  getWildBase() {
    return this.wildBase;
  }
  getThrowItem() {
    return this.throwItem;
  }

  private resolvePlayerBackKeys(): {
    skin: string;
    outfit: string | null;
    hair: string | null;
  } {
    const scene = this.scene as GameScene;
    const user = scene.getUser();
    const profile = user?.getProfile();
    const gender = profile?.gender ?? 'male';
    const g = genderCode(gender);

    const equipped = user?.getEquippedCostumes();
    const parts = equipped?.length ? equippedCostumesToParts(equipped) : null;

    // ── skin ─────────────────────────────────────────────
    let skinKey = '';
    if (parts?.skin) {
      skinKey = `player_back_${g}_skin_${idToSuffix(parts.skin)}`;
    }
    if (!skinKey || !scene.textures.exists(skinKey)) {
      const master = scene.getMasterData?.().getCostume?.();
      const first = master?.skin?.[0];
      if (first) {
        skinKey = `player_back_${g}_skin_${idToSuffix(first)}`;
      }
    }

    // ── outfit ───────────────────────────────────────────
    let outfitKey: string | null = null;
    if (parts?.outfit) {
      const raw = parts.outfit;
      // outfit id 가 "m_outfit_0" / "f_outfit_0" 처럼 gender prefix 를 포함할 수도,
      // 단순히 "outfit_0" 일 수도 있다. 후자는 현재 gender 를 붙여 사용.
      if (/^[mf]_outfit_/.test(raw)) {
        outfitKey = `player_back_${raw}`;
      } else {
        outfitKey = `player_back_${g}_outfit_${idToSuffix(raw)}`;
      }
    }

    // ── hair ─────────────────────────────────────────────
    let hairKey: string | null = null;
    if (parts?.hair) {
      const raw = parts.hair;
      // "m_hair_0_c0" 또는 "f_hair_0_c0" 처럼 gender prefix 포함
      if (/^[mf]_hair_/.test(raw)) {
        hairKey = `player_back_${raw}`;
      } else {
        // "hair_0_c0" → suffix + color 형태로 그대로 붙이기
        const suffix = raw.replace(/^hair_/, '');
        hairKey = `player_back_${g}_hair_${suffix}`;
      }
    }

    return { skin: skinKey, outfit: outfitKey, hair: hairKey };
  }

  async playPlayerBackThrowAnim(duration: number = 650): Promise<void> {
    const scene = this.scene as GameScene;
    const layers: Phaser.GameObjects.Sprite[] = [this.playerSprite];
    if (this.playerOutfit) layers.push(this.playerOutfit);
    if (this.playerHair) layers.push(this.playerHair);
    if (layers.length === 0) return;

    const prefix = ANIMATION.PLAYER_BACK_SKIN;
    const frameCount = 5; // `player_back_skin-0` ~ `player_back_skin-4`
    const stopFrame = `${prefix}-0`;

    const proxy = { t: 0 };
    let lastIdx = -1;

    await new Promise<void>((resolve) => {
      scene.tweens.add({
        targets: proxy,
        t: 1,
        duration,
        // ease,
        onUpdate: () => {
          // ease 로 구부러진 t 를 정수 프레임 인덱스(0..frameCount-1)에 매핑.
          const idx = Math.min(frameCount - 1, Math.max(0, Math.floor(proxy.t * frameCount)));
          if (idx === lastIdx) return;
          lastIdx = idx;
          const frameName = `${prefix}-${idx}`;
          for (const layer of layers) layer.setFrame(frameName);
        },
        onComplete: () => {
          // 마지막 프레임 유지 — 이 상태에서 아이템이 throw 된다.
          // 투척 완료 후 `resetPlayerBackFrame()` 으로 복귀.
          const lastFrame = `${prefix}-${frameCount - 1}`;
          for (const layer of layers) layer.setFrame(lastFrame);
          resolve();
        },
      });
    });
  }

  /** 플레이어 뒷모습을 정지 프레임(0)으로 되돌린다. 투척 완료 후 호출. */
  resetPlayerBackFrame(): void {
    const stopFrame = `${ANIMATION.PLAYER_BACK_SKIN}-0`;
    this.playerSprite.setFrame(stopFrame);
    this.playerOutfit?.setFrame(stopFrame);
    this.playerHair?.setFrame(stopFrame);
  }

  async playWildEatAnim(): Promise<void> {
    const scene = this.scene as GameScene;
    const sprite = this.wildSprite;
    const origY = sprite.y;
    await new Promise<void>((resolve) => {
      scene.tweens.add({
        targets: sprite,
        y: origY - 30,
        duration: 200,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          sprite.y = origY;
          resolve();
        },
      });
    });
  }

  async playWildAngryAnim(): Promise<void> {
    const scene = this.scene as GameScene;
    const sprite = this.wildSprite;
    const origX = sprite.x;

    sprite.setTint(0xff6666);
    await new Promise<void>((resolve) => {
      scene.tweens.add({
        targets: sprite,
        x: origX - 20,
        duration: 60,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          sprite.x = origX;
          sprite.clearTint();
          resolve();
        },
      });
    });
  }
}
