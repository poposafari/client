import { DEPTH, SFX } from '@poposafari/types';
import { AudioManager, SeamlessLoopHandle } from '@poposafari/core/audio.manager';
import HazeDistortionFilter from '@poposafari/utils/haze-distortion-filter';

export type WeatherBiome = 'normal' | 'snow' | 'desert';
export const RAIN_TEXTURE_KEY = 'rain';
export const SNOW_TEXTURE_KEYS = ['snow_1', 'snow_2', 'snow_3', 'snow_4'] as const;
export const SNOW_TILE_TEXTURE_KEY = 'snow_tile';
export const SAND_TEXTURE_KEYS = ['sand_1', 'sand_2', 'sand_3', 'sand_4'] as const;
export const SAND_TILE_TEXTURE_KEY = 'sand_tile';
export const FOG_TEXTURE_KEYS = ['fog_0', 'fog_1'] as const;
export const RAIN_ANIM_KEY = 'weather_overlay_rain_anim';

export const RAIN_FALLBACK = {
  width: 2,
  height: 14,
  color: 0xcfe2ff,
  alpha: 1,
};

export const SNOW_FALLBACK = {
  size: 6,
  color: 0xffffff,
  alpha: 1,
};

export const SAND_FALLBACK = {
  width: 14,
  height: 2,
  color: 0xd2a85a,
  alpha: 0.85,
};

export interface NoiseFallback {
  size: number;
  baseColor: number;
  baseAlpha: number;
  blobs: {
    color: number;
    alpha: number;
    cxRatio: number;
    cyRatio: number;
    radiusRatio: number;
  }[];
}

export const FOG_FALLBACK: NoiseFallback = {
  size: 128,
  baseColor: 0xeef0f3,
  baseAlpha: 0.06,
  blobs: [
    { color: 0xd9dde2, alpha: 0.18, cxRatio: 0.35, cyRatio: 0.4, radiusRatio: 0.32 },
    { color: 0xc8ccd1, alpha: 0.14, cxRatio: 0.7, cyRatio: 0.65, radiusRatio: 0.28 },
    { color: 0xffffff, alpha: 0.06, cxRatio: 0.2, cyRatio: 0.75, radiusRatio: 0.1 },
    { color: 0xffffff, alpha: 0.06, cxRatio: 0.85, cyRatio: 0.25, radiusRatio: 0.08 },
  ],
};

const LIGHTNING_COLOR = 0xfff04d;
const HAZE_TINT = 0xffd9a0;
const SNOW_HAZE_TINT = 0xffffff;

const HAZE_INTENSITY_SUNNY = 1.3;
const HAZE_INTENSITY_FOGGY = 0.6;

export function landToBiome(land: string | undefined): WeatherBiome {
  if (!land) return 'normal';
  if (land === 'snow' || land === 'ice') return 'snow';
  if (land === 'sand' || land === 'desert') return 'desert';
  return 'normal';
}

interface ParticleLaunchOptions {
  textureKey: string;

  animKey?: string;
  startX: number;
  startY: number;
  scale: number;
  alpha: number;

  travel?: {
    targetX: number;
    targetY: number;
    speed: number;
    endAlpha?: number;
  };
  fallbackLifespanMs?: number;

  worldSpace?: boolean;
}

export class WeatherOverlay {
  private scene: Phaser.Scene;
  private biome: WeatherBiome;

  private fogTile: Phaser.GameObjects.TileSprite | null = null;
  private snowTile: Phaser.GameObjects.TileSprite | null = null;
  private sandTile: Phaser.GameObjects.TileSprite | null = null;
  private flashRect: Phaser.GameObjects.Rectangle | null = null;

  private particles!: Phaser.GameObjects.Group;
  private spawnTimers: Phaser.Time.TimerEvent[] = [];

  private flashTimer: Phaser.Time.TimerEvent | null = null;
  private currentWeather = 'sunny';
  private resizeBound = false;

  private audio: AudioManager | null = null;
  private rainLoop: SeamlessLoopHandle | null = null;
  private stormLoop: SeamlessLoopHandle | null = null;
  private windLoop: SeamlessLoopHandle | null = null;

  private fogIsHaze = false;
  private hazePhase = 0;
  private hazeActive = false;
  private hazeIntensity = 1;
  private hazeTargets: Phaser.GameObjects.Container[] = [];

  private mapBounds: { x: number; y: number; width: number; height: number } | null = null;

  constructor(
    scene: Phaser.Scene,
    biome: WeatherBiome = 'normal',
    hazeTargets: Phaser.GameObjects.Container[] = [],
    audio: AudioManager | null = null,
  ) {
    this.scene = scene;
    this.biome = biome;
    this.audio = audio;
    this.hazeTargets = hazeTargets.filter((c): c is Phaser.GameObjects.Container => !!c);
    this.ensureTextures();
    this.buildPersistentLayers();
    this.particles = scene.add.group();
    this.scene.scale.on('resize', this.onResize, this);
    this.resizeBound = true;
  }

  private ensureTextures(): void {
    const s = this.scene;
    if (!s.textures.exists(RAIN_TEXTURE_KEY))
      this.generateRectTexture(RAIN_TEXTURE_KEY, RAIN_FALLBACK);
    for (const key of SNOW_TEXTURE_KEYS) {
      if (!s.textures.exists(key)) this.generateCircleTexture(key, SNOW_FALLBACK);
    }
    if (!s.textures.exists(SNOW_TILE_TEXTURE_KEY))
      this.generateNoiseTexture(SNOW_TILE_TEXTURE_KEY, FOG_FALLBACK);
    for (const key of SAND_TEXTURE_KEYS) {
      if (!s.textures.exists(key)) this.generateRectTexture(key, SAND_FALLBACK);
    }
    if (!s.textures.exists(SAND_TILE_TEXTURE_KEY))
      this.generateNoiseTexture(SAND_TILE_TEXTURE_KEY, FOG_FALLBACK);
    for (const key of FOG_TEXTURE_KEYS) {
      if (!s.textures.exists(key)) this.generateNoiseTexture(key, FOG_FALLBACK);
    }
  }

  private generateRectTexture(
    key: string,
    cfg: { width: number; height: number; color: number; alpha: number },
  ): void {
    const g = this.scene.add.graphics({ x: 0, y: 0 });
    g.fillStyle(cfg.color, cfg.alpha);
    g.fillRect(0, 0, cfg.width, cfg.height);
    g.generateTexture(key, cfg.width, cfg.height);
    g.destroy();
  }

  private generateCircleTexture(key: string, cfg: typeof SNOW_FALLBACK): void {
    const g = this.scene.add.graphics({ x: 0, y: 0 });
    g.fillStyle(cfg.color, cfg.alpha);
    g.fillCircle(cfg.size / 2, cfg.size / 2, cfg.size / 2);
    g.generateTexture(key, cfg.size, cfg.size);
    g.destroy();
  }

  private generateNoiseTexture(key: string, cfg: NoiseFallback): void {
    const g = this.scene.add.graphics({ x: 0, y: 0 });
    g.fillStyle(cfg.baseColor, cfg.baseAlpha);
    g.fillRect(0, 0, cfg.size, cfg.size);
    for (const b of cfg.blobs) {
      g.fillStyle(b.color, b.alpha);
      g.fillCircle(cfg.size * b.cxRatio, cfg.size * b.cyRatio, cfg.size * b.radiusRatio);
    }
    g.generateTexture(key, cfg.size, cfg.size);
    g.destroy();
  }

  private buildPersistentLayers(): void {
    const s = this.scene;
    const cam = s.cameras.main;
    const w = cam.width;
    const h = cam.height;

    this.fogTile = s.add
      .tileSprite(w / 2, h / 2, w, h, FOG_TEXTURE_KEYS[0])
      .setScrollFactor(0)
      .setDepth(DEPTH.WEATHER)
      .setAlpha(0)
      .setVisible(false)
      .setScale(2);

    this.snowTile = s.add
      .tileSprite(w / 2, h / 2, w, h, SNOW_TILE_TEXTURE_KEY)
      .setScrollFactor(0)
      .setDepth(DEPTH.WEATHER)
      .setAlpha(0)
      .setVisible(false)
      .setScale(4);

    this.sandTile = s.add
      .tileSprite(w / 2, h / 2, w, h, SAND_TILE_TEXTURE_KEY)
      .setScrollFactor(0)
      .setDepth(DEPTH.WEATHER)
      .setAlpha(0)
      .setVisible(false)
      .setScale(6);

    this.flashRect = s.add
      .rectangle(w / 2, h / 2, w, h, LIGHTNING_COLOR, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.WEATHER + 0.05)
      .setVisible(false);
  }

  setMapBounds(x: number, y: number, width: number, height: number): void {
    this.mapBounds = { x, y, width, height };
    this.applyTileLayout();
  }

  clearMapBounds(): void {
    this.mapBounds = null;
    this.applyTileLayout();
  }

  private applyTileLayout(): void {
    const cam = this.scene.cameras.main;
    const bounds = this.mapBounds;

    const apply = (
      tile: Phaser.GameObjects.TileSprite | null,
      tileScaleWhenWorld: number,
      scaleWhenViewport: number,
    ): void => {
      if (!tile) return;
      if (bounds) {
        tile
          .setScrollFactor(1)
          .setSize(bounds.width, bounds.height)
          .setPosition(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
          .setScale(1)
          .setTileScale(tileScaleWhenWorld);
      } else {
        tile
          .setScrollFactor(0)
          .setSize(cam.width, cam.height)
          .setPosition(cam.width / 2, cam.height / 2)
          .setScale(scaleWhenViewport)
          .setTileScale(1);
      }
    };

    apply(this.fogTile, 2, 2);
    apply(this.snowTile, 4, 4);
    apply(this.sandTile, 2, 2);
  }

  setBiome(biome: WeatherBiome): void {
    if (this.biome === biome) return;
    this.biome = biome;
    const cur = this.currentWeather;
    this.currentWeather = '__force__';
    this.setWeather(cur);
  }

  setWeather(weather: string): void {
    if (this.currentWeather === weather) return;
    this.currentWeather = weather;
    this.resetAllLayers();
    this.updateWeatherAudio();

    if (weather === 'sunny') {
      // desert는 sunny일 때 뿌연 오버레이 없이 화면 일렁임만 — foggy보다 살짝 강하게.
      if (this.biome === 'desert') this.enableHeatHaze(HAZE_INTENSITY_SUNNY);
      return;
    }

    if (weather === 'foggy') {
      this.showFog();
      return;
    }

    if (weather !== 'rainy' && weather !== 'stormy') return;

    const heavy = weather === 'stormy';

    switch (this.biome) {
      case 'snow':
        this.showHazeOverlay();
        this.startSnow(heavy);
        if (heavy) this.showBlizzard();
        break;
      case 'desert':
        this.showHazeOverlay();
        this.startSand(heavy);
        if (heavy) this.showSandstorm();
        break;
      default:
        this.startRain(heavy);
        if (heavy) this.startNormalStormFlashes();
        break;
    }
  }

  private updateWeatherAudio(): void {
    const rainOn =
      this.biome === 'normal' &&
      (this.currentWeather === 'rainy' || this.currentWeather === 'stormy');
    const stormOn = this.biome === 'normal' && this.currentWeather === 'stormy';
    const windOn =
      this.biome === 'desert' &&
      (this.currentWeather === 'rainy' || this.currentWeather === 'stormy');

    if (rainOn && !this.rainLoop) {
      this.rainLoop = this.audio?.playEffectSeamlessLoop(SFX.RAIN, { overlapMs: 500 }) ?? null;
    } else if (!rainOn && this.rainLoop) {
      this.rainLoop.stop();
      this.rainLoop = null;
    }

    if (stormOn && !this.stormLoop) {
      this.stormLoop = this.audio?.playEffectSeamlessLoop(SFX.STORM, { overlapMs: 500 }) ?? null;
    } else if (!stormOn && this.stormLoop) {
      this.stormLoop.stop();
      this.stormLoop = null;
    }

    if (windOn && !this.windLoop) {
      this.windLoop = this.audio?.playEffectSeamlessLoop(SFX.WIND, { overlapMs: 500 }) ?? null;
    } else if (!windOn && this.windLoop) {
      this.windLoop.stop();
      this.windLoop = null;
    }
  }

  private stopWeatherAudio(): void {
    this.rainLoop?.stop();
    this.rainLoop = null;
    this.stormLoop?.stop();
    this.stormLoop = null;
    this.windLoop?.stop();
    this.windLoop = null;
  }

  tick(delta: number): void {
    if (this.fogIsHaze || this.hazeActive) {
      this.hazePhase += delta;
      const t = this.hazePhase * 0.0015;
      if (this.hazeActive) {
        HazeDistortionFilter.setStrength(
          Math.sin(t) * 0.005 * this.hazeIntensity,
          Math.sin(t * 1.4 + 0.3) * 0.003 * this.hazeIntensity,
        );
        HazeDistortionFilter.setTime(this.hazePhase * 0.001);
      }
      if (this.fogIsHaze && this.fogTile) {
        this.fogTile.alpha = 0.4 + Math.sin(t * 0.8) * 0.1;
      }
    }
    if (this.fogTile && this.fogTile.visible && !this.fogIsHaze) {
      this.fogTile.tilePositionX += delta * 0.012;
      this.fogTile.tilePositionY += delta * 0.004;
    }
    if (this.snowTile && this.snowTile.visible) {
      this.snowTile.tilePositionX += delta * 0.18;
      this.snowTile.tilePositionY += delta * 0.08;
    }
    if (this.sandTile && this.sandTile.visible) {
      this.sandTile.tilePositionX += delta * 0.22;
      this.sandTile.tilePositionY += delta * 0.03;
    }
  }

  destroy(): void {
    this.stopWeatherAudio();
    this.stopSpawnTimers();
    for (const child of this.particles.getChildren()) {
      this.scene.tweens.killTweensOf(child);
    }
    this.particles.clear(true, true);
    if (this.flashTimer) {
      this.flashTimer.remove(false);
      this.flashTimer = null;
    }
    if (this.resizeBound) {
      this.scene.scale.off('resize', this.onResize, this);
      this.resizeBound = false;
    }
    this.disableHeatHaze();
    this.fogTile?.destroy();
    this.fogTile = null;
    this.snowTile?.destroy();
    this.snowTile = null;
    this.sandTile?.destroy();
    this.sandTile = null;
    this.flashRect?.destroy();
    this.flashRect = null;
  }

  private launchParticle(opts: ParticleLaunchOptions): void {
    const sprite = this.scene.add
      .sprite(opts.startX, opts.startY, opts.textureKey)
      .setDepth(DEPTH.WEATHER)
      .setScale(opts.scale)
      .setAlpha(opts.alpha);
    if (!opts.worldSpace) sprite.setScrollFactor(0);

    this.particles.add(sprite);

    const animExists = !!opts.animKey && this.scene.anims.exists(opts.animKey);
    if (animExists) sprite.play(opts.animKey!);

    if (opts.travel) {
      const { targetX, targetY, speed, endAlpha } = opts.travel;
      const dx = targetX - opts.startX;
      const dy = targetY - opts.startY;
      const distance = Math.hypot(dx, dy) || 1;
      const duration = (distance / speed) * 1000;
      this.scene.tweens.add({
        targets: sprite,
        x: targetX,
        y: targetY,
        alpha: endAlpha ?? opts.alpha,
        duration,
        ease: 'Linear',
        onComplete: () => sprite.destroy(),
      });
    } else if (animExists) {
      sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sprite.destroy());
    } else {
      // anim-only 모드인데 anim이 없으면 그대로 둘 수 없으니 fallback 수명 후 제거.
      this.scene.time.delayedCall(opts.fallbackLifespanMs ?? 500, () => {
        if (sprite.active) sprite.destroy();
      });
    }
  }

  private startRain(heavy: boolean): void {
    const interval = heavy ? 14 : 22;
    const baseQuantity = heavy ? 6 : 3;

    this.spawnTimers.push(
      this.scene.time.addEvent({
        delay: interval,
        loop: true,
        callback: () => {
          const cam = this.scene.cameras.main;
          const bounds = this.mapBounds;

          const densityScale = bounds
            ? Math.min(16, Math.max(1, (bounds.width * bounds.height) / (cam.width * cam.height)))
            : 1;
          const quantity = Math.max(1, Math.round(baseQuantity * densityScale));

          for (let i = 0; i < quantity; i++) {
            let x: number;
            let y: number;
            if (bounds) {
              x = bounds.x + Math.random() * bounds.width;
              y = bounds.y + Math.random() * bounds.height;
            } else {
              x = Phaser.Math.FloatBetween(0, cam.width);
              y = Phaser.Math.FloatBetween(0, cam.height);
            }
            this.launchParticle({
              textureKey: RAIN_TEXTURE_KEY,
              animKey: RAIN_ANIM_KEY,
              startX: x,
              startY: y,
              scale: 2,
              alpha: heavy ? 1 : 0.9,
              worldSpace: !!bounds,
            });
          }
        },
      }),
    );
  }

  private startSnow(heavy: boolean): void {
    const interval = heavy ? 16 : 30;
    const baseQuantity = heavy ? 4 : 2;

    this.spawnTimers.push(
      this.scene.time.addEvent({
        delay: interval,
        loop: true,
        callback: () => {
          const cam = this.scene.cameras.main;
          const bounds = this.mapBounds;

          const densityScale = bounds ? Math.min(8, Math.max(1, bounds.width / cam.width)) : 1;
          const quantity = Math.max(1, Math.round(baseQuantity * densityScale));

          for (let i = 0; i < quantity; i++) {
            const textureKey =
              SNOW_TEXTURE_KEYS[Math.floor(Math.random() * SNOW_TEXTURE_KEYS.length)];

            let worldX: number;
            let startY: number;
            let targetY: number;

            if (bounds) {
              // 한 입자의 낙하 거리는 한 화면 정도로 짧게 — lifespan을 viewport 기반으로 묶어서 활성 수 방어.
              const fallDistance = cam.height + 100;
              worldX = bounds.x + Math.random() * bounds.width;
              startY = Phaser.Math.FloatBetween(bounds.y - 50, bounds.y + bounds.height - 50);
              targetY = startY + fallDistance;
            } else {
              worldX = cam.scrollX + Phaser.Math.FloatBetween(-50, cam.width + 50);
              startY = cam.scrollY - 20;
              targetY = cam.scrollY + cam.height + 50;
            }

            this.launchParticle({
              textureKey,
              startX: worldX,
              startY,
              scale: Phaser.Math.FloatBetween(1.8, 2.2),
              alpha: heavy ? 0.95 : 0.9,
              travel: {
                targetX: worldX,
                targetY,
                speed: heavy
                  ? Phaser.Math.FloatBetween(350, 600)
                  : Phaser.Math.FloatBetween(100, 220),
                endAlpha: heavy ? 0.8 : 0.6,
              },
              worldSpace: true,
            });
          }
        },
      }),
    );
  }

  private startSand(heavy: boolean): void {
    const interval = heavy ? 18 : 32;
    const baseQuantity = heavy ? 5 : 2;

    this.spawnTimers.push(
      this.scene.time.addEvent({
        delay: interval,
        loop: true,
        callback: () => {
          const cam = this.scene.cameras.main;
          const camW = cam.width;
          const camH = cam.height;
          const bounds = this.mapBounds;

          const densityScale = bounds ? Math.min(8, Math.max(1, bounds.width / cam.width)) : 1;
          const quantity = Math.max(1, Math.round(baseQuantity * densityScale));

          for (let i = 0; i < quantity; i++) {
            const textureKey =
              SAND_TEXTURE_KEYS[Math.floor(Math.random() * SAND_TEXTURE_KEYS.length)];
            const fall = Phaser.Math.FloatBetween(camH * 0.2, camH * 0.6);

            let startX: number;
            let startY: number;
            let targetX: number;
            let targetY: number;

            if (bounds) {
              const sweepDistance = camW + 100;
              startX = Phaser.Math.FloatBetween(bounds.x - 50, bounds.x + bounds.width + 50);
              startY = Phaser.Math.FloatBetween(bounds.y - 50, bounds.y + bounds.height - 50);
              targetX = startX - sweepDistance;
              targetY = startY + fall;
            } else {
              startX = camW + 50;
              startY = Phaser.Math.FloatBetween(-50, camH * 0.9);
              targetX = -50;
              targetY = startY + fall;
            }

            this.launchParticle({
              textureKey,
              startX,
              startY,
              scale: Phaser.Math.FloatBetween(1.4, 2.0),
              alpha: heavy ? 0.85 : 0.55,
              travel: {
                targetX,
                targetY,
                speed: heavy
                  ? Phaser.Math.FloatBetween(800, 1200)
                  : Phaser.Math.FloatBetween(450, 700),
                endAlpha: 0.2,
              },
              worldSpace: !!bounds,
            });
          }
        },
      }),
    );
  }

  private resetAllLayers(): void {
    this.stopSpawnTimers();
    for (const child of this.particles.getChildren()) {
      this.scene.tweens.killTweensOf(child);
    }
    this.particles.clear(true, true);

    if (this.fogTile) {
      this.scene.tweens.killTweensOf(this.fogTile);
      this.fogTile.setVisible(false).setAlpha(0).clearTint();
      this.fogTile.tilePositionX = 0;
      this.fogTile.tilePositionY = 0;
    }
    this.disableHeatHaze();
    this.fogIsHaze = false;
    this.hazePhase = 0;
    if (this.snowTile) {
      this.scene.tweens.killTweensOf(this.snowTile);
      this.snowTile.setVisible(false).setAlpha(0);
    }
    if (this.sandTile) {
      this.scene.tweens.killTweensOf(this.sandTile);
      this.sandTile.setVisible(false).setAlpha(0);
    }
    if (this.flashRect) {
      this.scene.tweens.killTweensOf(this.flashRect);
      this.flashRect.setVisible(false).setFillStyle(LIGHTNING_COLOR, 0);
    }
    if (this.flashTimer) {
      this.flashTimer.remove(false);
      this.flashTimer = null;
    }
  }

  private stopSpawnTimers(): void {
    for (const t of this.spawnTimers) t.remove(false);
    this.spawnTimers = [];
  }

  private showHazeOverlay(): void {
    if (!this.fogTile) return;
    this.fogIsHaze = true;
    this.fogTile.setTexture(FOG_TEXTURE_KEYS[0]);
    this.fogTile.setTint(
      this.biome === 'desert' ? HAZE_TINT : this.biome === 'snow' ? SNOW_HAZE_TINT : undefined,
    );
    this.fogTile.setAlpha(0.4);
    this.fogTile.setVisible(true);
  }

  private enableHeatHaze(intensity: number = 1): void {
    if (this.biome !== 'desert') return;
    if (this.hazeActive) {
      // 이미 활성 — 같은 호출이 두 번 들어와도 강도만 갱신해 weather 전환을 부드럽게 처리.
      this.hazeIntensity = intensity;
      return;
    }
    if (this.hazeTargets.length === 0) return;
    for (const target of this.hazeTargets) {
      target.setPostPipeline(HazeDistortionFilter.KEY);
    }
    HazeDistortionFilter.reset();
    this.hazeIntensity = intensity;
    this.hazeActive = true;
  }

  private disableHeatHaze(): void {
    if (!this.hazeActive) return;
    for (const target of this.hazeTargets) {
      target.removePostPipeline(HazeDistortionFilter.KEY);
    }
    HazeDistortionFilter.reset();
    this.hazeActive = false;
  }

  private showFog(): void {
    if (!this.fogTile) return;

    if (this.biome === 'desert' || this.biome === 'snow') {
      this.showHazeOverlay();
      if (this.biome === 'desert') this.enableHeatHaze(HAZE_INTENSITY_FOGGY);
      return;
    }

    this.fogIsHaze = false;
    const pick = FOG_TEXTURE_KEYS[Math.floor(Math.random() * FOG_TEXTURE_KEYS.length)];
    this.fogTile.setTexture(pick);
    this.fogTile.clearTint();
    this.fogTile.setVisible(true);
    this.scene.tweens.add({
      targets: this.fogTile,
      alpha: 0.5,
      duration: 1200,
      ease: 'Linear',
    });
  }

  private showBlizzard(): void {
    if (!this.snowTile) return;
    this.snowTile.setVisible(true);
    this.scene.tweens.add({
      targets: this.snowTile,
      alpha: 0.6,
      duration: 100,
      ease: 'Linear',
    });
  }

  private showSandstorm(): void {
    if (!this.sandTile) return;
    this.sandTile.setVisible(true);
    this.scene.tweens.add({
      targets: this.sandTile,
      alpha: 0.7,
      duration: 100,
      ease: 'Linear',
    });
  }

  private startNormalStormFlashes(): void {
    const schedule = () => {
      if (this.currentWeather !== 'stormy' || this.biome !== 'normal' || !this.flashRect) return;
      this.flashTimer = this.scene.time.delayedCall(Phaser.Math.Between(3000, 9000), () => {
        if (this.currentWeather !== 'stormy' || this.biome !== 'normal' || !this.flashRect) {
          return;
        }
        this.flashRect.setVisible(true);
        this.audio?.playEffect(SFX.THUNDER);
        this.scene.tweens.add({
          targets: this.flashRect,
          fillAlpha: 0.5,
          duration: 70,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            if (!this.flashRect) return;
            this.flashRect.setFillStyle(LIGHTNING_COLOR, 0);
            if (this.currentWeather !== 'stormy') {
              this.flashRect.setVisible(false);
            }
          },
        });
        schedule();
      });
    };
    schedule();
  }

  private onResize = (gameSize: Phaser.Structs.Size): void => {
    const w = gameSize.width;
    const h = gameSize.height;
    if (this.flashRect) this.flashRect.setSize(w, h).setPosition(w / 2, h / 2);
    if (!this.mapBounds) {
      if (this.fogTile) this.fogTile.setSize(w, h).setPosition(w / 2, h / 2);
      if (this.snowTile) this.snowTile.setSize(w, h).setPosition(w / 2, h / 2);
      if (this.sandTile) this.sandTile.setSize(w, h).setPosition(w / 2, h / 2);
    }
  };
}
