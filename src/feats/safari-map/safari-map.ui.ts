import { BaseUi } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import {
  ANIMATION,
  DEPTH,
  GameAction,
  SFX,
  TEXTSHADOW,
  TEXTSTYLE,
  TEXTURE,
} from '@poposafari/types';
import { addBackground, addImage, addSprite, addText } from '@poposafari/utils';
import i18next from '@poposafari/i18n';
import { KeyGuideBarContainer } from '@poposafari/containers/key-guide-bar.container';
import {
  drawMapEdges,
  ISLAND_OFFSET_Y,
  ISLAND_SCALE,
  MAP_LOCATION_TO_POINT,
  MAP_POINTS,
  POINT_SCALE,
  POINT_TEXTURES,
  POINT_TO_MAPS,
  type MapPoint,
} from './safari-map.data';

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

const POINT_HIT_RADIUS = 70;
const SNAP_SPEED = 1200;

const CURSOR_SEL_SCALE = 2;


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

  private resolveClose: ((mapId: string | null) => void) | null = null;

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
    this.island = addImage(
      this.scene,
      TEXTURE.MAP_ISLAND,
      undefined,
      0,
      ISLAND_OFFSET_Y,
    ).setScale(ISLAND_SCALE);

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
        { actions: [GameAction.CONFIRM], description: i18next.t('etc:confirm') },
        { actions: [GameAction.CANCEL], description: i18next.t('etc:cancel') },
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
    drawMapEdges(this.edges);
  }

  onInput(key: string, action: GameAction | null): void {
    if (action === GameAction.CONFIRM) {
      if (this.hoveredIndex >= 0 && this.isPointVisited(this.hoveredIndex)) {
        this.scene.getAudio().playEffect(SFX.CURSOR_0);
        this.close(MAP_POINTS[this.hoveredIndex].key);
      }
      return;
    }
    if (action === GameAction.CANCEL || action === GameAction.MAP) {
      this.scene.getAudio().playEffect(SFX.CURSOR_0);
      this.close(null);
      return;
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

  private close(mapId: string | null = null): void {
    if (this.resolveClose) {
      const resolve = this.resolveClose;
      this.resolveClose = null;
      resolve(mapId);
    }
  }

  errorEffect(_errorMsg: string): void {}

  /** 선택된 목적지 mapId를 반환한다. 취소(X/ESC) 시 null. */
  waitForInput(): Promise<string | null> {
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
