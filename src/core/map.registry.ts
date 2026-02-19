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

export type SpecialNpc = 'professor';

export interface NpcConfig {
  key: string;
  name: string;
  special?: SpecialNpc;
  x: number;
  y: number;
  /** NPC 생성 시 바라보는 방향 */
  direction: DIRECTION;
  /** Z/Enter 시 순차 재생할 대화 스크립트 */
  reaction: ReactionStep[];
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
  area: string;
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
