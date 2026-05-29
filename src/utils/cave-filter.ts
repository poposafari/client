const caveFragShader = `
precision mediump float;

uniform vec3 tintColor;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main(void) {
    vec4 original = texture2D(uMainSampler, outTexCoord);
    gl_FragColor = vec4(original.rgb * tintColor, original.a);
}
`;

export type CaveVariant = 'dark' | 'blue' | 'ice' | 'desertDark' | 'red';

const CAVE_TINTS: Record<CaveVariant, [number, number, number]> = {
  dark: [0.55, 0.55, 0.6], // 약간 검정색 (살짝 차가운 톤)
  blue: [0.55, 0.7, 0.95], // 약간 푸르스름
  ice: [0.8, 0.95, 1.1], // 얼음 동굴 밝은 하늘색
  desertDark: [0.55, 0.48, 0.4], // 사막 동굴 (살짝 따뜻한 어둠)
  red: [0.95, 0.55, 0.5], // 약간 붉은색
};

export default class CaveFilter extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  static readonly KEY = 'CaveFilter';

  private static _variant: CaveVariant = 'dark';

  constructor(game: Phaser.Game) {
    super({
      game,
      renderTarget: true,
      fragShader: caveFragShader,
    });
  }

  onPreRender() {
    const [r, g, b] = CAVE_TINTS[CaveFilter._variant];
    this.set3f('tintColor', r, g, b);
  }

  static setVariant(variant: CaveVariant): void {
    CaveFilter._variant = variant;
  }

  static getVariant(): CaveVariant {
    return CaveFilter._variant;
  }
}
