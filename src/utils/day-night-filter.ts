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

const TIME_OF_DAY_MAP: Record<string, number> = {
  night: 0.0,
  dawn: 0.3,
  day: 0.5,
  dusk: 0.7,
};

export default class DayNightFilter extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  static readonly KEY = 'DayNightFilter';

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

  static timeOfDayToValue(tod: string): number {
    return TIME_OF_DAY_MAP[tod] ?? 0.5;
  }

  /** 현재 timeOfDay 값을 문자열('dawn'|'day'|'dusk'|'night')로 변환 */
  static getCurrentTimeLabel(): 'dawn' | 'day' | 'dusk' | 'night' {
    const t = DayNightFilter._timeOfDay;
    if (t < 0.25) return 'night';
    if (t < 0.35) return 'dawn';
    if (t < 0.65) return 'day';
    if (t < 0.75) return 'dusk';
    return 'night';
  }

  /** 현재 timeOfDay 값을 배틀 에셋용 문자열('day'|'dusk'|'night')로 변환 */
  static getBattleTime(): 'day' | 'dusk' | 'night' {
    const t = DayNightFilter._timeOfDay;
    if (t < 0.25) return 'night';
    if (t < 0.35) return 'day';
    if (t < 0.65) return 'day';
    if (t < 0.75) return 'dusk';
    return 'night';
  }
}
