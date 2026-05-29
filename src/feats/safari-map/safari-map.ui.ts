import { BaseUi } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import { ANIMATION, DEPTH, KEY, SFX, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addBackground, addImage, addSprite, addText } from '@poposafari/utils';
import i18next from '@poposafari/i18n';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';

const TITLE_X = -560;
const TITLE_Y = -470;
const TITLE_ICON_SCALE = 2.6;
const TITLE_FONT_SIZE = 60;
const TITLE_ANIM_MS = 150;

const CURSOR_SCALE = 1.4;
const CURSOR_OFFSET_X = 20;
const CURSOR_OFFSET_Y = -20;
const CURSOR_SPEED = 600;

const MAP_BOUND_LEFT = -950;
const MAP_BOUND_RIGHT = 920;
const MAP_BOUND_TOP = -500;
const MAP_BOUND_BOTTOM = 530;

const POINT_SCALE = 1.8;
const POINT_HIT_RADIUS = 70;
const SNAP_SPEED = 1200;

const CURSOR_SEL_SCALE = 2;

const EDGE_COLOR = 0xf8b830;
const EDGE_WIDTH = 6;

const UNVISITED_TINT = 0x848884;

const MAP_PLAYER_SCALE = 2;
const MAP_PLAYER_DURATION_MS = 750;
const MAP_PLAYER_OFFSET_X = 0;
const MAP_PLAYER_OFFSET_Y = -30;

const HEADER_Y = -480;
const HEADER_FONT_SIZE = 60;
const HEADER_ICON_SCALE = 2;
const HEADER_ICON_GAP = 40;

const FALLBACK_CURSOR_X = 0;
const FALLBACK_CURSOR_Y = -40;

let lastCursor: { x: number; y: number } | null = null;

type MapPointType = 0 | 1;

interface MapPoint {
  key: string;
  x: number;
  y: number;
  type: MapPointType;
}

const POINT_TEXTURES: Record<MapPointType, { base: TEXTURE; sel: TEXTURE }> = {
  0: { base: TEXTURE.MAP_POINT_0, sel: TEXTURE.MAP_POINT_0_SEL },
  1: { base: TEXTURE.MAP_POINT_1, sel: TEXTURE.MAP_POINT_1_SEL },
};

const POINT_TO_MAPS: Record<string, string[]> = {};

const MAP_LOCATION_TO_POINT: Record<string, string> = {
  s001: 's001',
  s002: 's002',
  s003: 's003',
  s004: 's004',
  s005: 's005',
  s006: 's006',
  s007: 's007',
  s008: 's008',
  s009: 's008',
  s010: 's008',
  s011: 's008',
  s012: 's012',
  s013: 's013',
  s014: 's014',
  s015: 's015',
  s016: 's015',
  s017: 's017',
  s018: 's015',
  s019: 's019',
  s020: 's015',
  s021: 's021',
  s022: 's022',
  s023: 's023',
  s024: 's024',
  s025: 's024',
  s026: 's024',
  s027: 's024',
  s028: 's024',
  s029: 's024',
  s030: 's024',
  s031: 's024',
  s032: 's032',
  s033: 's032',
  s034: 's032',
  s035: 's032',
  s036: 's032',
  s037: 's032',
  s038: 's032',
  s039: 's039',
  s040: 's040',
  s041: 's041',
  s042: 's042',
  s043: 's042',
  s044: 's042',
  s045: 's042',
  s046: 's046',
};

for (const [mapId, pointKey] of Object.entries(MAP_LOCATION_TO_POINT)) {
  (POINT_TO_MAPS[pointKey] ??= []).push(mapId);
}

const EDGES: [string, string][] = [
  ['s046', 's001'],
  ['s001', 's002'],
  ['s002', 's003'],
  ['s003', 's004'],
  ['s004', 's005'],
  ['s004', 's006'],
  ['s006', 's007'],
  ['s006', 's008'],
  ['s008', 's012'],
  ['s003', 's013'],
  ['s013', 's014'],
  ['s014', 's015'],
  ['s015', 's017'],
  ['s017', 's019'],
  ['s019', 's021'],
  ['s021', 's022'],
  ['s021', 's023'],
  ['s023', 's024'],
  ['s013', 's032'],
  ['s032', 's039'],
  ['s039', 's040'],
  ['s040', 's041'],
  ['s040', 's042'],
];

const MAP_POINTS: MapPoint[] = [
  { key: 's046', x: -140, y: 370, type: 0 },
  { key: 's001', x: -140, y: 300, type: 0 },
  { key: 's002', x: -110, y: 230, type: 0 },
  { key: 's003', x: -110, y: 160, type: 0 },
  { key: 's004', x: -180, y: 140, type: 0 },
  { key: 's005', x: -180, y: 200, type: 0 },
  { key: 's006', x: -250, y: 140, type: 0 },
  { key: 's007', x: -320, y: 140, type: 0 },
  { key: 's008', x: -260, y: 70, type: 1 },
  { key: 's012', x: -260, y: 0, type: 0 },
  { key: 's013', x: -40, y: 160, type: 0 },
  { key: 's014', x: 30, y: 160, type: 0 },
  { key: 's015', x: 50, y: 70, type: 1 },
  { key: 's017', x: -60, y: 50, type: 0 },
  { key: 's019', x: -90, y: -90, type: 0 },
  { key: 's021', x: -50, y: -140, type: 0 },
  { key: 's022', x: -50, y: -200, type: 0 },
  { key: 's023', x: -10, y: -100, type: 0 },
  { key: 's024', x: 40, y: -100, type: 1 },
  { key: 's032', x: 100, y: 160, type: 1 },
  { key: 's039', x: 170, y: 160, type: 0 },
  { key: 's040', x: 240, y: 140, type: 0 },
  { key: 's041', x: 230, y: 90, type: 1 },
  { key: 's042', x: 250, y: 190, type: 1 },
];

export class SafariMapUi extends BaseUi {
  scene: GameScene;
  private bg!: GImage;
  private island!: GImage;
  private edges!: Phaser.GameObjects.Graphics;
  private headerText!: GText;
  private headerIconLeft!: GImage;
  private headerIconRight!: GImage;
  private titleImage!: GImage;
  private titleText!: GText;
  private cursor!: GImage;
  private cursorX = 0;
  private cursorY = 0;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  private pointSprites: GImage[] = [];
  private visitedPoints: Set<string> = new Set();
  private cursorSelSprite: Phaser.GameObjects.Sprite | null = null;
  private playerSprite: Phaser.GameObjects.Sprite | null = null;
  private hoveredIndex = -1;
  private snapping = false;
  private titleTween: Phaser.Tweens.Tween | null = null;
  private inputGuide!: KeyGuideBarContainer;

  private resolveClose: (() => void) | null = null;

  constructor(scene: GameScene) {
    super(scene, scene.getInputManager(), DEPTH.MESSAGE);
    this.scene = scene;
    this.computeVisitedPoints();
    this.initCursorPosition();
    this.createLayout();
    this.cursorKeys = this.scene.input.keyboard?.createCursorKeys() ?? null;
  }

  private computeVisitedPoints(): void {
    const user = this.scene.getUser();
    if (!user) return;
    for (const point of MAP_POINTS) {
      const maps = POINT_TO_MAPS[point.key] ?? [point.key];
      if (maps.some((m) => user.hasVisitedMap(m))) {
        this.visitedPoints.add(point.key);
      }
    }
  }

  private isPointVisited(index: number): boolean {
    if (index < 0 || index >= MAP_POINTS.length) return false;
    return this.visitedPoints.has(MAP_POINTS[index].key);
  }

  private initCursorPosition(): void {
    if (lastCursor) {
      this.cursorX = lastCursor.x;
      this.cursorY = lastCursor.y;
      return;
    }
    const point = this.findPlayerPoint();
    if (point) {
      this.cursorX = point.x;
      this.cursorY = point.y;
    } else {
      this.cursorX = FALLBACK_CURSOR_X;
      this.cursorY = FALLBACK_CURSOR_Y;
    }
  }

  private findPlayerPoint(): MapPoint | null {
    const user = this.scene.getUser();
    if (!user) return null;
    const mapId = user.getProfile().lastLocation.map;
    if (!mapId.startsWith('s')) return null;
    const pointKey = MAP_LOCATION_TO_POINT[mapId];
    if (!pointKey) return null;
    return MAP_POINTS.find((p) => p.key === pointKey) ?? null;
  }

  createLayout(): void {
    this.bg = addBackground(this.scene, TEXTURE.BG_MAP);
    this.island = addImage(this.scene, TEXTURE.MAP_ISLAND, undefined, 0, +50).setScale(4.6);

    this.edges = this.scene.add.graphics();
    this.drawEdges();

    this.headerText = addText(
      this.scene,
      0,
      HEADER_Y,
      i18next.t('etc:safariMap'),
      HEADER_FONT_SIZE,
      '500',
      'center',
      TEXTSTYLE.WHITE,
      TEXTSHADOW.GRAY,
    );
    const headerHalfWidth = this.headerText.displayWidth / 2;
    this.headerIconLeft = addImage(
      this.scene,
      TEXTURE.ICON_MAP,
      undefined,
      -headerHalfWidth - HEADER_ICON_GAP,
      HEADER_Y,
    ).setScale(HEADER_ICON_SCALE);
    this.headerIconRight = addImage(
      this.scene,
      TEXTURE.ICON_MAP,
      undefined,
      headerHalfWidth + HEADER_ICON_GAP,
      HEADER_Y,
    ).setScale(HEADER_ICON_SCALE);

    this.titleImage = addImage(this.scene, TEXTURE.MAP_TITLE, undefined, TITLE_X, TITLE_Y).setScale(
      0,
    );

    this.titleText = addText(
      this.scene,
      TITLE_X - 320,
      TITLE_Y,
      '',
      TITLE_FONT_SIZE,
      '500',
      'left',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    ).setVisible(false);

    for (let i = 0; i < MAP_POINTS.length; i++) {
      const point = MAP_POINTS[i];
      const sprite = addImage(
        this.scene,
        POINT_TEXTURES[point.type].base,
        undefined,
        point.x,
        point.y,
      ).setScale(POINT_SCALE);
      sprite.setScrollFactor(0);
      if (this.visitedPoints.has(point.key)) {
        sprite.setInteractive({ useHandCursor: true });
        sprite.on('pointerdown', () => this.onPointClick(i));
      } else {
        sprite.setTint(UNVISITED_TINT);
      }
      this.pointSprites.push(sprite);
    }

    this.cursorSelSprite = addSprite(this.scene, TEXTURE.MAP_CURSOR_SEL, 'map_cursor_sel-0', 0, 0)
      .setScale(CURSOR_SEL_SCALE)
      .setVisible(false);

    this.createPlayerMarker();

    this.cursor = addImage(
      this.scene,
      TEXTURE.MAP_CURSOR,
      undefined,
      this.cursorX + CURSOR_OFFSET_X,
      this.cursorY + CURSOR_OFFSET_Y,
    ).setScale(CURSOR_SCALE);

    this.inputGuide = new KeyGuideBarContainer(this.scene);
    this.inputGuide.create({
      entries: [
        { keys: [i18next.t('etc:arrowKey')], description: i18next.t('etc:move') },
        { keys: ['Z', 'ENTER'], description: i18next.t('etc:confirm') },
        { keys: ['X', 'ESC'], description: i18next.t('etc:cancel') },
      ],
      keycapTextSize: 30,
      keycapPaddingX: 50,
      keycapPaddingY: 40,
      keycapScale: 2,
      keycapTextYOffset: -5,
      descriptionTextSize: 50,
      descriptionTextStyle: TEXTSTYLE.WHITE,
      descriptionTextShadow: TEXTSHADOW.GRAY,
      gapKeyToDescription: 5,
      gapBetweenEntries: 25,
      gapInsideEntry: 4,
      align: 'right',
      maxWidth: this.scene.cameras.main.width - 60,
    });
    this.inputGuide.setPosition(+920, +500);

    this.add([
      this.bg,
      this.island,
      this.edges,
      ...this.pointSprites,
      this.cursorSelSprite,
      ...(this.playerSprite ? [this.playerSprite] : []),
      this.headerIconLeft,
      this.headerIconRight,
      this.headerText,
      this.titleImage,
      this.titleText,
      this.cursor,
      this.inputGuide,
    ]);

    this.updateHover();
  }

  private createPlayerMarker(): void {
    const point = this.findPlayerPoint();
    if (!point) return;

    this.playerSprite = addSprite(
      this.scene,
      TEXTURE.MAP_PLAYER,
      'map_player-0',
      point.x + MAP_PLAYER_OFFSET_X,
      point.y + MAP_PLAYER_OFFSET_Y,
    ).setScale(MAP_PLAYER_SCALE);
    this.playerSprite.play({ key: ANIMATION.MAP_PLAYER, duration: MAP_PLAYER_DURATION_MS });
  }

  private drawEdges(): void {
    this.edges.clear();
    this.edges.lineStyle(EDGE_WIDTH, EDGE_COLOR, 1);
    const byKey = new Map(MAP_POINTS.map((p) => [p.key, p]));
    for (const [a, b] of EDGES) {
      const pa = byKey.get(a);
      const pb = byKey.get(b);
      if (!pa || !pb) continue;
      this.edges.lineBetween(pa.x, pa.y, pb.x, pb.y);
    }
  }

  onInput(key: string): void {
    switch (key) {
      case KEY.X:
      case KEY.ESC:
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.close();
        break;
    }
  }

  update(_time: number, delta: number): void {
    if (!this.cursorKeys) return;
    if (!this.scene.getInputManager().isTop(this)) return;

    let dx = 0;
    let dy = 0;
    if (this.cursorKeys.up.isDown) dy -= 1;
    if (this.cursorKeys.down.isDown) dy += 1;
    if (this.cursorKeys.left.isDown) dx -= 1;
    if (this.cursorKeys.right.isDown) dx += 1;

    const inputActive = dx !== 0 || dy !== 0;

    if (inputActive) {
      this.snapping = false;
      const step = (CURSOR_SPEED * delta) / 1000;
      this.cursorX = Math.max(MAP_BOUND_LEFT, Math.min(MAP_BOUND_RIGHT, this.cursorX + dx * step));
      this.cursorY = Math.max(MAP_BOUND_TOP, Math.min(MAP_BOUND_BOTTOM, this.cursorY + dy * step));
      this.cursor.setPosition(this.cursorX + CURSOR_OFFSET_X, this.cursorY + CURSOR_OFFSET_Y);
      this.updateHover();
      return;
    }

    if (this.hoveredIndex < 0) return;

    const target = MAP_POINTS[this.hoveredIndex];
    const diffX = target.x - this.cursorX;
    const diffY = target.y - this.cursorY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

    if (dist < 1) {
      this.cursorX = target.x;
      this.cursorY = target.y;
      this.cursor.setPosition(this.cursorX + CURSOR_OFFSET_X, this.cursorY + CURSOR_OFFSET_Y);
      this.snapping = false;
      return;
    }

    this.snapping = true;
    const snapStep = (SNAP_SPEED * delta) / 1000;
    if (snapStep >= dist) {
      this.cursorX = target.x;
      this.cursorY = target.y;
    } else {
      this.cursorX += (diffX / dist) * snapStep;
      this.cursorY += (diffY / dist) * snapStep;
    }
    this.cursor.setPosition(this.cursorX + CURSOR_OFFSET_X, this.cursorY + CURSOR_OFFSET_Y);
  }

  private updateHover(): void {
    let nearest = -1;
    let nearestDist = POINT_HIT_RADIUS;

    for (let i = 0; i < MAP_POINTS.length; i++) {
      if (!this.isPointVisited(i)) continue;
      const p = MAP_POINTS[i];
      const dist = Math.sqrt((this.cursorX - p.x) ** 2 + (this.cursorY - p.y) ** 2);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    }

    this.setHovered(nearest);
  }

  private setHovered(newIndex: number): void {
    if (newIndex === this.hoveredIndex) return;

    if (this.hoveredIndex >= 0) {
      const prev = MAP_POINTS[this.hoveredIndex];
      this.pointSprites[this.hoveredIndex].setTexture(POINT_TEXTURES[prev.type].base);
      this.scene.getAudio().playEffect(SFX.CURSOR_1);
    }

    this.hoveredIndex = newIndex;

    if (this.hoveredIndex >= 0) {
      const curr = MAP_POINTS[this.hoveredIndex];
      const targetIndex = this.hoveredIndex;
      this.pointSprites[this.hoveredIndex].setTexture(POINT_TEXTURES[curr.type].sel);
      this.titleText.setText(i18next.t(`map:${curr.key}`));
      this.titleText.setVisible(false);
      this.tweenTitle(TITLE_ICON_SCALE, 'Back.Out', () => {
        if (this.hoveredIndex === targetIndex) {
          this.titleText.setVisible(true);
        }
      });

      this.cursorSelSprite?.setPosition(curr.x, curr.y);
      this.cursorSelSprite?.setVisible(true);
      this.cursorSelSprite?.play(ANIMATION.MAP_CURSOR_SEL);
    } else {
      this.titleText.setVisible(false);
      this.tweenTitle(0, 'Back.In');
      this.cursorSelSprite?.setVisible(false);
      this.cursorSelSprite?.stop();
    }
  }

  private onPointClick(index: number): void {
    if (!this.scene.getInputManager().isTop(this)) return;
    if (!this.isPointVisited(index)) return;
    this.setHovered(index);
  }

  private tweenTitle(targetScale: number, ease: string, onComplete?: () => void): void {
    if (this.titleTween) {
      this.titleTween.stop();
      this.titleTween = null;
    }
    this.titleTween = this.scene.tweens.add({
      targets: this.titleImage,
      scale: targetScale,
      duration: TITLE_ANIM_MS,
      ease,
      onComplete: () => {
        this.titleTween = null;
        onComplete?.();
      },
    });
  }

  private close(): void {
    if (this.resolveClose) {
      const resolve = this.resolveClose;
      this.resolveClose = null;
      resolve();
    }
  }

  errorEffect(_errorMsg: string): void {}

  waitForInput(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveClose = resolve;
    });
  }

  destroy(fromScene?: boolean): void {
    lastCursor = { x: this.cursorX, y: this.cursorY };
    if (this.titleTween) {
      this.titleTween.stop();
      this.titleTween = null;
    }
    this.cursorKeys = null;
    super.destroy(fromScene);
  }
}
