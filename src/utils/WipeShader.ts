const fragShader = `
precision mediump float;

uniform float uTime;
uniform float duration;
uniform sampler2D uMainSampler;
uniform vec2 resolution;
varying vec2 outTexCoord;

void main(void) {
    vec2 uv = outTexCoord;
    float speedMultiplier = 2.0;
    float speed = (1.0 / duration) * speedMultiplier;

    float blurAmount = 0.02;

    //오른쪽 -> 왼쪽
    float wipePosition = 1.0 - (uTime * speed);

    float mask = smoothstep(wipePosition - blurAmount, wipePosition + blurAmount, uv.x);

    vec4 original = texture2D(uMainSampler, uv);
    gl_FragColor = mix(original, vec4(0.0, 0.0, 0.0, 1.0), mask);
}
`;

export default class WipeShaderr extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private _time: number = 0;
  private _duration: number = 1.0;

  constructor(game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader: fragShader,
    });
  }

  onPreRender() {
    this._time += 1 / 60;
    this.set1f('uTime', this._time);
    this.set1f('duration', this._duration);
    this.set2f('resolution', this.game.config.width as number, this.game.config.height as number);
  }

  setDuration(duration: number) {
    this._duration = duration;
  }

  resetTime() {
    this._time = 0;
  }
}
