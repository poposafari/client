const dayNightFragShader = `
precision mediump float;

uniform float timeOfDay; // 0.0 = 밤, 0.5 = 낮, 1.0 = 밤
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main(void) {
    vec4 original = texture2D(uMainSampler, outTexCoord);
    
    // 시간대별 색상 조정
    vec3 color = original.rgb;
    
    if (timeOfDay < 0.25) {
        // 밤 (어두운 파란색 톤)
        color = color * vec3(0.4, 0.5, 0.8);
    } else if (timeOfDay < 0.35) {
        // 새벽 (약간 밝은 파란색)
        color = color * vec3(0.6, 0.7, 0.9);
    } else if (timeOfDay < 0.65) {
        // 낮 (원본 색상)
        color = color * vec3(1.0, 1.0, 1.0);
    } else if (timeOfDay < 0.75) {
        // 해질녘 (주황색 톤)
        color = color * vec3(1.0, 0.8, 0.6);
    } else {
        // 밤
        color = color * vec3(0.4, 0.5, 0.8);
    }
    
    gl_FragColor = vec4(color, original.a);
}
`;

export default class DayNightFilter extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private static _timeOfDay: number = 0.5; // 0.0 ~ 1.0

  constructor(game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader: dayNightFragShader,
    });
  }

  onPreRender() {
    this.set1f('timeOfDay', DayNightFilter._timeOfDay);
  }

  static setTimeOfDay(time: number) {
    DayNightFilter._timeOfDay = Phaser.Math.Clamp(time, 0, 1);
  }

  static getTimeOfDay(): number {
    return DayNightFilter._timeOfDay;
  }
}
