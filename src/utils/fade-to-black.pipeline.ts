const fragShader = `
precision mediump float;

uniform float uProgress;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main(void) {
    vec4 original = texture2D(uMainSampler, outTexCoord);
    vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
    gl_FragColor = mix(original, black, uProgress);
}
`;

/**
 * Fade to/from black PostFX.
 * uProgress 0 = 풀 화면, 1 = 완전 검정.
 * 맵 전환: 페이드 아웃(0→1) → 맵 전환 → 페이드 인(1→0).
 */
export class FadeToBlackPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  static readonly KEY = 'FadeToBlack';

  private _progress = 0;

  constructor(game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader,
    });
  }

  onPreRender(): void {
    this.set1f('uProgress', this._progress);
  }

  getProgress(): number {
    return this._progress;
  }

  setProgress(value: number): void {
    this._progress = Phaser.Math.Clamp(value, 0, 1);
  }

  /** Tween용: progress 0~1 직접 대입 가능 */
  get progress(): number {
    return this._progress;
  }

  set progress(value: number) {
    this.setProgress(value);
  }
}
