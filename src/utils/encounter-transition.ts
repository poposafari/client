export interface EncounterTransitionOptions {
  /** 검정 플래시 횟수. 기본 2 (0이면 깜빡임 phase 생략) */
  flickerCount?: number;
  /** 플래시 1회 지속 시간(ms). 기본 100 */
  flickerDurationMs?: number;
  /** 타일 채우기 phase 전체 시간(ms). 기본 900 */
  durationMs?: number;
  /** 한 변의 픽셀 길이 (정사각형). 1920×1080 기준 240이면 8×5=40 타일. 기본 240 */
  tileSize?: number;
  /**
   * 채워지는 순서.
   * - 'rowMajor': 좌→우, 위→아래
   * - 'diagonal': 좌상단부터 대각선 확장
   * - 'split': 상단 행은 좌→우, 하단 행은 우→좌, 두 반쪽이 동시에 진행
   */
  order?: 'rowMajor' | 'diagonal' | 'split';
  /** 모든 타일이 채워진 후 검정 화면을 유지하는 시간(ms). 기본 200 */
  holdMs?: number;
  /** 각 타일이 등장할 때 alpha 0→1 페이드인 시간(ms). 0이면 즉시 등장. 기본 200 */
  tileFadeInMs?: number;
  /** 트랜지션 시작 시점에 호출 (사운드 트리거용) */
  onStart?: () => void;
}

type ResolvedOptions = Required<Omit<EncounterTransitionOptions, 'onStart'>> &
  Pick<EncounterTransitionOptions, 'onStart'>;

const DEFAULT_OPTIONS: Required<Omit<EncounterTransitionOptions, 'onStart'>> = {
  flickerCount: 2,
  flickerDurationMs: 150,
  durationMs: 1000,
  tileSize: 180,
  order: 'split',
  holdMs: 300,
  tileFadeInMs: 70,
};

const TRANSITION_DEPTH = 99999;

export class EncounterTransition {
  private scene!: Phaser.Scene;
  private onCompleteCallback: (() => void) | null = null;
  private opts: ResolvedOptions;

  private tileRects: Phaser.GameObjects.Rectangle[] = [];
  private holdRect: Phaser.GameObjects.Rectangle | null = null;
  private timers: Phaser.Time.TimerEvent[] = [];

  private playing = false;
  private cancelled = false;
  private dismissed = false;

  constructor(options: EncounterTransitionOptions = {}) {
    this.opts = { ...DEFAULT_OPTIONS, ...options };
  }

  play(scene: Phaser.Scene, onComplete: () => void): void {
    if (this.playing) return;
    this.scene = scene;
    this.onCompleteCallback = onComplete;
    this.playing = true;
    this.cancelled = false;
    this.dismissed = false;
    void this.run();
  }

  dismiss(): void {
    if (this.dismissed) return;
    this.dismissed = true;
    this.cleanup();
  }

  cancel(): void {
    if (!this.playing && !this.holdRect) return;
    this.cancelled = true;
    this.dismissed = true;
    this.cleanup();
    this.playing = false;
  }

  private async run(): Promise<void> {
    this.opts.onStart?.();
    await this.runFlicker();
    if (this.cancelled) return;
    this.startTileFill();
  }

  private async runFlicker(): Promise<void> {
    if (this.opts.flickerCount <= 0) return;
    const cam = this.scene.cameras.main;
    for (let i = 0; i < this.opts.flickerCount; i++) {
      if (this.cancelled) return;
      await new Promise<void>((resolve) => {
        cam.flash(this.opts.flickerDurationMs, 0, 0, 0);
        cam.once('cameraflashcomplete', () => resolve());
      });
    }
  }

  private startTileFill(): void {
    const cam = this.scene.cameras.main;
    const W = cam.width;
    const H = cam.height;
    const ts = this.opts.tileSize;
    const cols = Math.ceil(W / ts);
    const rows = Math.ceil(H / ts);

    const ordered = this.computeOrder(cols, rows);
    const fadeMs = this.opts.tileFadeInMs;

    for (const { col, row, timeRatio } of ordered) {
      const x = col * ts;
      const y = row * ts;
      const w = Math.min(ts, W - x);
      const h = Math.min(ts, H - y);

      const rect = this.scene.add
        .rectangle(x, y, w, h, 0x000000)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(TRANSITION_DEPTH)
        .setAlpha(fadeMs > 0 ? 0 : 1)
        .setVisible(false);
      this.tileRects.push(rect);

      const t = this.scene.time.delayedCall(timeRatio * this.opts.durationMs, () => {
        if (this.cancelled) return;
        rect.setVisible(true);
        if (fadeMs <= 0) {
          rect.setAlpha(1);
          return;
        }
        rect.setAlpha(0);
        this.scene.tweens.add({
          targets: rect,
          alpha: 1,
          duration: fadeMs,
          ease: 'Linear',
        });
      });
      this.timers.push(t);
    }

    const consolidateTimer = this.scene.time.delayedCall(this.opts.durationMs + fadeMs, () => {
      if (this.cancelled) return;
      this.consolidateToSingleRect();
    });
    this.timers.push(consolidateTimer);

    const holdEndTimer = this.scene.time.delayedCall(
      this.opts.durationMs + fadeMs + this.opts.holdMs,
      () => {
        if (this.cancelled) return;
        this.finish();
      },
    );
    this.timers.push(holdEndTimer);
  }

  private computeOrder(
    cols: number,
    rows: number,
  ): Array<{ col: number; row: number; timeRatio: number }> {
    const out: Array<{ col: number; row: number; timeRatio: number }> = [];

    if (this.opts.order === 'diagonal') {
      const positions: Array<{ col: number; row: number }> = [];
      for (let d = 0; d <= cols + rows - 2; d++) {
        for (let row = 0; row <= d; row++) {
          const col = d - row;
          if (col >= 0 && col < cols && row < rows) {
            positions.push({ col, row });
          }
        }
      }
      const last = Math.max(1, positions.length - 1);
      for (let i = 0; i < positions.length; i++) {
        out.push({ ...positions[i], timeRatio: i / last });
      }
    } else if (this.opts.order === 'split') {
      // 상단: (0,0) 좌상단 시작 → snake 패턴 (한 줄 끝나면 반대 방향)
      //   row 0: 좌→우, row 1: 우→좌, row 2: 좌→우, ...
      // 하단: (cols-1, rows-1) 우하단 시작 → snake 패턴 (아래→위 진행하며 방향 반전)
      //   가장 아래 행: 우→좌, 그 위: 좌→우, ...
      // 두 반쪽이 동시에 진행되어 화면 중앙에서 만남.
      const topRows = Math.ceil(rows / 2);
      const bottomRows = rows - topRows;
      const maxHalfTiles = Math.max(topRows, bottomRows) * cols;
      const last = Math.max(1, maxHalfTiles - 1);

      for (let row = 0; row < topRows; row++) {
        for (let c = 0; c < cols; c++) {
          const idx = row * cols + c;
          // 짝수 행: 좌→우, 홀수 행: 우→좌
          const col = row % 2 === 0 ? c : cols - 1 - c;
          out.push({ col, row, timeRatio: idx / last });
        }
      }
      for (let r = 0; r < bottomRows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          // r=0 (가장 아래 행)부터: 짝수 r은 우→좌, 홀수 r은 좌→우
          const col = r % 2 === 0 ? cols - 1 - c : c;
          out.push({
            col,
            row: rows - 1 - r,
            timeRatio: idx / last,
          });
        }
      }
    } else {
      // rowMajor: 좌→우, 위→아래
      const total = cols * rows;
      const last = Math.max(1, total - 1);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          out.push({ col, row, timeRatio: i / last });
        }
      }
    }

    return out;
  }

  /**
   * 타일 채우기가 끝난 직후 호출. 144개 타일을 단일 풀스크린 검정 사각형으로 합친다.
   * holdRect는 dismiss()가 호출되기 전까지 화면에 남아있다.
   */
  private consolidateToSingleRect(): void {
    const cam = this.scene.cameras.main;
    this.holdRect = this.scene.add
      .rectangle(0, 0, cam.width, cam.height, 0x000000)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(TRANSITION_DEPTH)
      .setAlpha(1);
    for (const r of this.tileRects) r.destroy();
    this.tileRects = [];
  }

  private finish(): void {
    const cb = this.onCompleteCallback;
    this.playing = false;
    cb?.();
    // holdRect는 의도적으로 살려둠. caller가 dismiss()로 제거.
  }

  private cleanup(): void {
    for (const t of this.timers) t.remove();
    this.timers = [];
    for (const r of this.tileRects) r.destroy();
    this.tileRects = [];
    this.holdRect?.destroy();
    this.holdRect = null;
  }
}
