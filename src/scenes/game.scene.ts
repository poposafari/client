import {
  ApiManager,
  AudioManager,
  IGamePhase,
  InputManager,
  OptionManager,
} from '@poposafari/core';
import { MapRegistry } from '@poposafari/core/map.registry';
import { MasterData } from '@poposafari/core/master.data.ts';
import { UserManager } from '@poposafari/core/user.manager';
import { LoadingPhase, MessageUi, NoticeMessageUi, TalkMessageUi } from '@poposafari/feats';
import { QuestionMessageUi } from '@poposafari/feats/message/question-message.ui';
import type { InitPosConfig } from '@poposafari/feats/overworld/maps/door';
import { MapBuilder, OverworldPhase } from '@poposafari/feats/overworld';
import { BaseScene } from '@poposafari/scenes';
import { GetUserRes, TEXTURE } from '@poposafari/types';
import { debugLog } from '@poposafari/utils/debug';
import { FadeToBlackPipeline } from '@poposafari/utils/fade-to-black.pipeline';

export enum GameEvent {
  LANGUAGE_CHANGED = 'LANGUAGE_CHANGED',
  WINDOW_CHANGED = 'WINDOW_CHANGED',
}

export class GameScene extends BaseScene {
  private inputManager!: InputManager;
  private api!: ApiManager;
  private audio!: AudioManager;
  private option!: OptionManager;
  private masterData!: MasterData;
  private user: UserManager | null = null;
  private mapRegistry!: MapRegistry;
  private mapBuilder!: MapBuilder;

  private phaseStack: IGamePhase[] = [];

  private talkUi!: TalkMessageUi;
  private noticeUi!: NoticeMessageUi;
  private questionUi!: QuestionMessageUi;

  /** 맵 전환 후 다음 오버월드 진입 시 페이드 인 실행 여부 */
  private fadeInOnNextOverworldEnter = false;

  constructor() {
    super('GameScene');
  }

  preload() {
    //Loading에만 필요한 에셋들을 먼저 로드함.
    this.loadImage(TEXTURE.BG_0, 'ui/bgs', 'bg_0');
    this.loadImage(TEXTURE.LOGO_0, 'ui', 'logo_0');
    this.loadImage(TEXTURE.WINDOW_0, 'ui/windows', 'window_0');
    this.loadImage(TEXTURE.CURSOR_WHITE, 'ui', 'cursor_w');
  }

  create() {
    this.audio = new AudioManager(this);
    this.option = new OptionManager(this.audio);
    this.inputManager = new InputManager(this);
    this.api = new ApiManager();
    this.mapRegistry = new MapRegistry();
    this.mapBuilder = new MapBuilder(this, this.mapRegistry);
    this.masterData = new MasterData();

    this.talkUi = new TalkMessageUi(this);
    this.noticeUi = new NoticeMessageUi(this);
    this.questionUi = new QuestionMessageUi(this);

    this.events.on(GameEvent.LANGUAGE_CHANGED, () => {
      this.phaseStack.forEach((phase) => {
        if (phase.onRefreshLanguage) phase.onRefreshLanguage();
      });
    });
    this.events.on(GameEvent.WINDOW_CHANGED, () => {
      this.phaseStack.forEach((phase) => {
        if (phase.onRefreshWindow) phase.onRefreshWindow();
      });
    });

    const renderer = this.sys.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    if (renderer?.pipelines?.addPostPipeline) {
      renderer.pipelines.addPostPipeline(FadeToBlackPipeline.KEY, FadeToBlackPipeline);
      this.cameras.main.setPostPipeline(FadeToBlackPipeline.KEY);
    }

    this.switchPhase(new LoadingPhase(this));
  }

  update(_time: number, delta: number) {
    this.inputManager.update();
    this.getCurrentPhase()?.update?.(_time, delta);
  }

  createUserManager(data: GetUserRes) {
    this.user = new UserManager();
    this.user.init(data);
  }

  getInputManager() {
    return this.inputManager;
  }

  getApi() {
    return this.api;
  }

  getAudio() {
    return this.audio;
  }

  getUser(): UserManager | null {
    return this.user;
  }

  clearUser() {
    this.user = null;
  }

  getOption(): OptionManager {
    return this.option;
  }

  getMasterData(): MasterData {
    return this.masterData;
  }

  getMapRegistry(): MapRegistry {
    return this.mapRegistry;
  }

  getMapBuilder(): MapBuilder {
    return this.mapBuilder;
  }

  getMessage(type: 'talk'): TalkMessageUi;
  getMessage(type: 'notice'): NoticeMessageUi;
  getMessage(type: 'question'): QuestionMessageUi;
  getMessage(type: 'talk' | 'notice' | 'question'): MessageUi {
    if (type === 'talk') return this.talkUi;
    else if (type === 'notice') return this.noticeUi;
    else return this.questionUi;
  }

  switchPhase(newPhase: IGamePhase) {
    while (this.phaseStack.length > 0) {
      const top = this.phaseStack.pop();
      if (top) top.exit();
    }
    this.phaseStack = [newPhase];
    this.logPhaseStack('switchPhase', newPhase);
    newPhase.enter();
  }

  pushPhase(newPhase: IGamePhase) {
    const current = this.getCurrentPhase();
    if (current && current.onPause) {
      current.onPause();
    }

    this.phaseStack.push(newPhase);
    this.logPhaseStack('pushPhase', newPhase);
    newPhase.enter();
  }

  popPhase() {
    this.logPhaseStack('popPhase (before)');
    if (this.phaseStack.length < 1) {
      debugLog('[PhaseStack] popPhase early return (length <= 1)');
      return;
    }

    const top = this.phaseStack.pop();
    if (top) {
      top.exit();
    }
    const current = this.getCurrentPhase();
    if (current && current.onResume) {
      current.onResume();
    }
    this.logPhaseStack('popPhase (after)');
  }

  private logPhaseStack(tag: string, added?: IGamePhase): void {
    const names = this.phaseStack.map((p) => (p as any).constructor?.name ?? '?');
    const msg = added ? `${tag} + ${(added as any).constructor?.name}` : tag;
    debugLog(`[PhaseStack] ${msg} | length=${this.phaseStack.length} | [${names.join(', ')}]`);
  }

  getCurrentPhase(): IGamePhase | undefined {
    return this.phaseStack.length > 0 ? this.phaseStack[this.phaseStack.length - 1] : undefined;
  }

  emitEvent(event: GameEvent) {
    switch (event) {
      case GameEvent.LANGUAGE_CHANGED:
      case GameEvent.WINDOW_CHANGED:
        this.events.emit(event);
        break;
    }
  }

  getFadeToBlackPipeline(): FadeToBlackPipeline | null {
    const cam = this.cameras.main as Phaser.Cameras.Scene2D.Camera & { postPipelines?: unknown[] };
    const list = cam?.postPipelines;
    if (!Array.isArray(list)) return null;
    return (list.find((p) => p instanceof FadeToBlackPipeline) as FadeToBlackPipeline) ?? null;
  }

  /** 다음 오버월드 진입 시 페이드 인 실행 여부를 소비 (한 번만 true 반환) */
  consumeFadeInOnOverworldEnter(): boolean {
    const v = this.fadeInOnNextOverworldEnter;
    this.fadeInOnNextOverworldEnter = false;
    return v;
  }

  /**
   * 맵 전환: 검정으로 페이드 아웃 → 전환 → 새 맵에서 검정에서 페이드 인.
   * 문 트리거 등에서 requestMapTransition 대신 이 메서드 호출.
   */
  startMapTransitionWithFade(initPosConfig: InitPosConfig, fadeMs = 300): void {
    const pipeline = this.getFadeToBlackPipeline();
    if (!pipeline) {
      this.requestMapTransition(initPosConfig);
      return;
    }
    pipeline.setProgress(0);
    this.tweens.add({
      targets: pipeline,
      progress: 1,
      duration: fadeMs,
      ease: 'Linear',
      onComplete: () => {
        this.fadeInOnNextOverworldEnter = true;
        this.requestMapTransition(initPosConfig);
      },
    });
  }

  /** 문 트리거 등으로 맵 전환 요청 시: lastLocation 갱신 후 오버월드 재진입 */
  requestMapTransition(initPosConfig: InitPosConfig): void {
    const user = this.getUser();
    if (!user) return;
    user.getProfile().lastLocation = {
      map: initPosConfig.location,
      x: initPosConfig.x,
      y: initPosConfig.y,
    };
    this.switchPhase(new OverworldPhase(this));
  }
}
