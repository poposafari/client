import { MAP_MASTER_IDS } from '@poposafari/core/master.data.ts';
import { GameScene } from '@poposafari/scenes';
import { EASE, TEXTCOLOR, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addText } from '@poposafari/utils';
import i18next from 'i18next';
import {
  drawMapEdges,
  ISLAND_OFFSET_X,
  ISLAND_OFFSET_Y,
  ISLAND_SCALE,
  MAP_LOCATION_TO_POINT,
  MAP_POINTS,
  POINT_SCALE,
  POINT_TEXTURES,
} from '@poposafari/feats/safari-map/safari-map.data';

const MISS_TINT = 0x848884;
const BLINK_FADE_DURATION = 700;
const SEA = { x: ISLAND_OFFSET_X + 8, y: ISLAND_OFFSET_Y - 28, width: 3005, height: 1500 };
const ISLAND_SIZE = 7;
const ISLAND_CENTER = { x: ISLAND_OFFSET_X + 10, y: ISLAND_OFFSET_Y + 50 };
const SAFARI_ISLAND_CENTER = { x: 0, y: ISLAND_OFFSET_Y };
const POINT_POS_SCALE = ISLAND_SIZE / ISLAND_SCALE;

function toLocalX(x: number): number {
  return ISLAND_CENTER.x + (x - SAFARI_ISLAND_CENTER.x) * POINT_POS_SCALE;
}

function toLocalY(y: number): number {
  return ISLAND_CENTER.y + (y - SAFARI_ISLAND_CENTER.y) * POINT_POS_SCALE;
}

const MAP_OFFSET = { x: +76, y: +90 };
const MAP_SCALE = 1;

const EMPTY_NOTICE = {
  y: 0,
  width: 3320,
  height: 300,
  bandColor: 0x000000,
  bandAlpha: 0.6,
  fontSize: 130,
};

const ZONE_LIST = {
  x: 1510,
  titleY: -590,
  titleFontSize: 130,
  y: -450,
  rowGap: 120,
  fontSize: 110,
  maxRows: 10,
};

export class PokedexAreaMapContainer extends Phaser.GameObjects.Container {
  /** 지도 뭉치. 이 하나만 움직이면 바다·섬·간선·포인트가 함께 따라온다. */
  private mapGroup: GContainer;
  private sea: GImage;
  private island: GImage;
  private edges: Phaser.GameObjects.Graphics;
  private pointSprites: GImage[] = [];

  private highlightSprites: GImage[] = [];
  private zoneTitle: GText;

  private zoneTexts: GText[] = [];

  private emptyBand: Phaser.GameObjects.Rectangle;
  private emptyText: GText;
  private blinkTween: Phaser.Tweens.Tween | null = null;
  private currentKey: string | null = null;

  constructor(scene: GameScene, x = 0, y = 0) {
    super(scene, x, y);

    this.sea = addImage(scene, TEXTURE.BG_MAP, undefined, SEA.x, SEA.y).setDisplaySize(
      SEA.width,
      SEA.height,
    );
    this.island = addImage(
      scene,
      TEXTURE.MAP_ISLAND,
      undefined,
      ISLAND_CENTER.x,
      ISLAND_CENTER.y,
    ).setScale(ISLAND_SIZE);

    this.edges = scene.add.graphics();
    drawMapEdges(this.edges, { x: toLocalX, y: toLocalY });

    for (const point of MAP_POINTS) {
      const px = toLocalX(point.x);
      const py = toLocalY(point.y);

      const sprite = addImage(scene, POINT_TEXTURES[point.type].base, undefined, px, py).setScale(
        POINT_SCALE * POINT_POS_SCALE,
      );
      this.pointSprites.push(sprite);

      const highlight = addImage(scene, POINT_TEXTURES[point.type].sel, undefined, px, py)
        .setScale(POINT_SCALE * POINT_POS_SCALE)
        .setAlpha(0);
      this.highlightSprites.push(highlight);
    }

    this.zoneTitle = addText(
      scene,
      ZONE_LIST.x,
      ZONE_LIST.titleY,
      i18next.t('etc:pokedexHabitat'),
      ZONE_LIST.titleFontSize,
      'bold',
      'left',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.zoneTitle.setOrigin(1, 0.5);

    for (let row = 0; row < ZONE_LIST.maxRows; row++) {
      const label = addText(
        scene,
        ZONE_LIST.x,
        ZONE_LIST.y + row * ZONE_LIST.rowGap,
        '',
        ZONE_LIST.fontSize,
        '100',
        'left',
        TEXTSTYLE.WHITE,
        TEXTSHADOW.GRAY,
      );
      label.setOrigin(1, 0.5);
      label.setVisible(false);
      this.zoneTexts.push(label);
    }

    this.mapGroup = scene.add.container(MAP_OFFSET.x, MAP_OFFSET.y);
    this.mapGroup.setScale(MAP_SCALE);
    this.mapGroup.add([
      this.sea,
      this.island,
      this.edges,
      ...this.pointSprites,
      ...this.highlightSprites,
    ]);

    this.emptyBand = scene.add
      .rectangle(0, EMPTY_NOTICE.y, EMPTY_NOTICE.width, EMPTY_NOTICE.height, EMPTY_NOTICE.bandColor)
      .setAlpha(EMPTY_NOTICE.bandAlpha)
      .setVisible(false);

    this.emptyText = addText(
      scene,
      0,
      EMPTY_NOTICE.y,
      i18next.t('etc:pokedexNoHabitat'),
      EMPTY_NOTICE.fontSize,
      '100',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    this.emptyText.setOrigin(0.5, 0.5);
    this.emptyText.setVisible(false);

    this.add([this.mapGroup, this.zoneTitle, ...this.zoneTexts, this.emptyBand, this.emptyText]);
    scene.add.existing(this);
  }

  setMapOffset(x: number, y: number): this {
    this.mapGroup.setPosition(x, y);
    return this;
  }

  setMapScale(scale: number): this {
    this.mapGroup.setScale(scale);
    return this;
  }

  setPokemon(pokedexKey: string): void {
    this.currentKey = pokedexKey;
    const hitPoints = this.findAppearingPoints(pokedexKey);

    this.stopBlink();

    const fadeTargets: GImage[] = [];
    for (let i = 0; i < MAP_POINTS.length; i++) {
      const isHit = hitPoints.has(MAP_POINTS[i].key);
      if (isHit) {
        this.pointSprites[i].clearTint();
        fadeTargets.push(this.highlightSprites[i]);
      } else {
        this.pointSprites[i].setTint(MISS_TINT);
      }
    }

    this.updateZoneList(hitPoints);

    const isEmpty = hitPoints.size === 0;
    this.emptyBand.setVisible(isEmpty);
    this.emptyText.setVisible(isEmpty);

    if (fadeTargets.length === 0) return;

    this.blinkTween = this.scene.tweens.add({
      targets: fadeTargets,
      alpha: { from: 0, to: 1 },
      duration: BLINK_FADE_DURATION,
      ease: EASE.SINE_EASEINOUT,
      yoyo: true,
      repeat: -1,
    });
  }

  private updateZoneList(hitPoints: Set<string>): void {
    const names = MAP_POINTS.filter((p) => hitPoints.has(p.key)).map((p) =>
      i18next.t(`map:${p.key}`),
    );

    for (let row = 0; row < this.zoneTexts.length; row++) {
      const label = this.zoneTexts[row];
      const isLastRow = row === this.zoneTexts.length - 1;
      const overflow = names.length - this.zoneTexts.length;

      if (isLastRow && overflow > 0) {
        label.setText(`+${overflow + 1}`);
        label.setColor(TEXTCOLOR.GRAY);
        label.setVisible(true);
        continue;
      }

      label.setText(names[row] ?? '');
      label.setColor(TEXTCOLOR.YELLOW);
      label.setVisible(row < names.length);
    }
  }

  private findAppearingPoints(pokedexKey: string): Set<string> {
    const masterData = (this.scene as GameScene).getMasterData();
    const points = new Set<string>();

    for (const mapId of MAP_MASTER_IDS) {
      const pointKey = MAP_LOCATION_TO_POINT[mapId];
      if (!pointKey || points.has(pointKey)) continue;
      if (masterData.getWildPokedexIdsForMap(mapId).includes(pokedexKey)) {
        points.add(pointKey);
      }
    }

    return points;
  }

  private stopBlink(): void {
    this.blinkTween?.stop();
    this.blinkTween = null;
    for (const highlight of this.highlightSprites) highlight.setAlpha(0);
  }

  override setVisible(value: boolean): this {
    super.setVisible(value);
    if (!value) this.stopBlink();
    else if (this.currentKey && !this.blinkTween) this.setPokemon(this.currentKey);
    return this;
  }

  override destroy(fromScene?: boolean): void {
    this.stopBlink();
    super.destroy(fromScene);
  }
}
