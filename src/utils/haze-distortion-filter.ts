const hazeFragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform vec2 uStrength;
uniform float uTime;
varying vec2 outTexCoord;

void main(void) {
    vec2 uv = outTexCoord;
    float wave = sin(uv.y * 40.0 + uTime * 2.5) * 0.5 + 0.5;
    vec2 offset = vec2(
        sin(uv.y * 30.0 + uTime * 1.7) * uStrength.x,
        cos(uv.x * 25.0 + uTime * 1.3) * uStrength.y
    ) * wave;
    gl_FragColor = texture2D(uMainSampler, uv + offset);
}
`;

export default class HazeDistortionFilter extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  static readonly KEY = 'HazeDistortionFilter';

  private static _strengthX = 0;
  private static _strengthY = 0;
  private static _time = 0;

  constructor(game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader: hazeFragShader,
    });
  }

  onPreRender() {
    this.set2f('uStrength', HazeDistortionFilter._strengthX, HazeDistortionFilter._strengthY);
    this.set1f('uTime', HazeDistortionFilter._time);
  }

  static setStrength(x: number, y: number): void {
    HazeDistortionFilter._strengthX = x;
    HazeDistortionFilter._strengthY = y;
  }

  static setTime(seconds: number): void {
    HazeDistortionFilter._time = seconds;
  }

  static reset(): void {
    HazeDistortionFilter._strengthX = 0;
    HazeDistortionFilter._strengthY = 0;
    HazeDistortionFilter._time = 0;
  }
}
