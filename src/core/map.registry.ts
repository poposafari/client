import { DIRECTION } from '@poposafari/feats/overworld';
import { DOOR, INIT_POS } from '@poposafari/feats/overworld/maps/door';
import { TEXTURE } from '@poposafari/types';

export interface LayerConfig {
  idx: number;
  texture: string;
  depth: number;
}

export interface ForegroundConfig {
  idx: number;
  texture: string[];
  depth: number;
}

export interface DoorConfig {
  startId: DOOR;
  destId: INIT_POS;
}

/** talk 단계: TalkMessageUi.showMessage(content, config)에 넣을 데이터 */
export interface TalkStepContent {
  text: string;
  name?: string;
  speed?: number;
  resolveWhen?: 'close' | 'displayed';
}

/** question 단계: QuestionMessageUi용. 추후 choices·선택 인덱스 반환 확장 가능 */
export interface QuestionStepContent {
  text: string;
  name?: string;
  speed?: number;
  resolveWhen?: 'close' | 'displayed';
  choices?: string[];
}

export interface NoticeStepContent {
  text: string;
  name?: string;
  speed?: number;
  resolveWhen?: 'close' | 'displayed';
  window?: TEXTURE;
}

export type ReactionStep =
  | { key: 'talk'; content: TalkStepContent }
  | { key: 'question'; content: QuestionStepContent }
  | { key: 'notice'; content: NoticeStepContent };

export type SpecialNpc = 'professor' | 'safari' | 'mart';

export type NpcType = 'human' | 'pokemon';

/** MovingNpc 경로 한 스텝 */
export interface NpcPathStep {
  direction: DIRECTION;
  /** 이동할 타일 수 (1 이상) */
  tiles: number;
  /** 이 스텝 시작 전 대기 시간 (ms). 0 이상. */
  delayMs: number;
}

export interface NpcConfig {
  key: string;
  name: string;
  special?: SpecialNpc;
  /** special === 'mart'일 때 상점이 판매하는 아이템 id 목록 */
  martItems?: string[];
  x: number;
  y: number;
  /** NPC 생성 시 바라보는 방향 */
  direction: DIRECTION;
  /** Z/Enter 시 순차 재생할 대화 스크립트 */
  reaction: ReactionStep[];
  /**
   * 이동 NPC 타입. 생략 시 기존 정적 NpcObject로 생성된다.
   * - 'human': 일반 사람 NPC. key를 텍스처로 사용.
   * - 'pokemon': 포켓몬 NPC. pokemon.overworld 텍스처 + 대화 시 cry 재생.
   */
  type?: NpcType;
  /** type이 지정된 경우 순환 이동 경로. 생략/빈 배열이면 제자리 대기. */
  path?: NpcPathStep[];
  /** type === 'pokemon'일 때 필수. 예: '0025', '0025_galar'. */
  pokedexId?: string;
  /** type === 'pokemon'일 때 선택. shiny 여부. */
  isShiny?: boolean;
}

export interface TriggerConfig {
  tileX: number;
  tileY: number;
  /** 트리거 타입 (예: 'forceWalk') */
  type: string;
  /** 타입별 파라미터 */
  params: Record<string, unknown>;
  /** true면 한 번만 발동 (기본 true) */
  oneShot?: boolean;
}

export interface MapConfig {
  key: string;
  //   sound: BGM;
  isIndoor: boolean;

  area: { land: string; water: string };
  type: 'plaza' | 'gate' | 'safari';
  dayNightFilter?: boolean;
  allowRide?: boolean;
  battleArea?: string;

  tilesets: string[];
  layers: LayerConfig[];
  foreground: ForegroundConfig[];

  doors: DoorConfig[];
  npcs?: NpcConfig[];
  triggers?: TriggerConfig[];

  //   signs?: SignConfig[];
}

export class MapRegistry {
  private configs = new Map<string, MapConfig>();

  register(config: MapConfig): void {
    this.configs.set(config.key, config);
  }

  get(key: string): MapConfig | undefined {
    return this.configs.get(key);
  }

  getAllKeys(): string[] {
    return [...this.configs.keys()];
  }
}
