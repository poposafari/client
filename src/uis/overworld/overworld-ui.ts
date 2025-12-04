import { Event } from '../../core/manager/event-manager';
import { DEPTH, DIRECTION, EVENT, MessageEndDelay, MODE, OBJECT, OVERWORLD_ACTION, OVERWORLD_TYPE, PLAYER_STATUS, TEXTURE, TIME } from '../../enums';
import { Keyboard } from '../../core/manager/keyboard-manager';
import { InGameScene } from '../../scenes/ingame-scene';
import { NoticeUi } from '../notice-ui';
import { QuestionMessageUi } from '../question-message-ui';
import { TalkMessageUi } from '../talk-message-ui';
import { delay, playBackgroundMusic, runFadeEffect, Ui } from '../ui';
import { OverworldGlobal } from '../../core/storage/overworld-storage';
import { PlayerGlobal } from '../../core/storage/player-storage';
import { Game } from '../../core/manager/game-manager';
import { ErrorCode } from '../../core/errors';
import { throwError } from '../../core/errors';
import { PlayerOverworldObj } from '../../obj/player-overworld-obj';
import { PC } from '../../core/storage/pc-storage';
import { OverworldHUDUi } from './overworld-hud-ui';
import { OverworldMenuUi } from './overworld-menu-ui';
import { OverworldActionQueue } from './overworld-action-queue';
import { OverworldMap } from './overworld-map';
import { OverworldNpc } from './overworld-npc';
import { OverworldSafari } from './overworld-safari';
import { OverworldStatue } from './overworld-statue';
import { OverworldOtherPlayer } from './overworld-other-player';
import { OverworldPlayerInputHandler, OverworldPlayerInputContext } from './overworld-player-input-handler';
import { OverworldPlayerInteractionHandler, OverworldPlayerInteractionContext } from './overworld-player-interaction-handler';
import { OverworldTriggerObj } from '../../obj/overworld-trigger-obj';
import { Option } from '../../core/storage/player-option';
import DayNightFilter from '../../utils/day-night-filter';
import { getCurrentTimeOfDay, getCurrentTimeOfDayValue, replacePercentSymbol } from '../../utils/string-util';
import { LampOverworldObj } from '../../obj/lamp-overworld-obj';
import i18next from 'i18next';
import { QuickSlotItemUi } from '../quick-slot-item-ui';
import { OVERWORLD_ZOOM } from '../../constants';
import { ConnectBaseUi } from '../connect-base-ui';

export class OverworldUi extends Ui {
  private type!: OVERWORLD_TYPE;
  private areaTexture!: TEXTURE | string;
  private areaLocation!: string;
  private tutorialMessage: TalkMessageUi;
  private lastTimeUpdate: number = 0;
  private readonly TIME_UPDATE_INTERVAL: number = 60000;

  protected map: OverworldMap;
  protected player: OverworldPlayer;
  protected npc: OverworldNpc;
  protected safari: OverworldSafari;
  protected statue: OverworldStatue;
  protected otherPlayers: OverworldOtherPlayer;
  protected hud: OverworldHUDUi;

  protected lamp: LampOverworldObj[] = [];

  protected isDayNightFilterEnabled: boolean = true;
  private disableFilterCallback!: () => void;
  private enableFilterCallback!: () => void;
  private languageChangedCallback!: () => void;
  private dayNightOverlay: Phaser.GameObjects.Rectangle | null = null;

  protected isAllowedRide: boolean = true;

  constructor(scene: InGameScene) {
    super(scene);

    this.map = new OverworldMap(scene);
    this.statue = new OverworldStatue(scene);
    this.npc = new OverworldNpc(scene);
    this.safari = new OverworldSafari(scene);

    this.hud = new OverworldHUDUi(scene);

    this.player = new OverworldPlayer(scene, this, this.npc, this.safari, this.statue, this.hud);
    this.otherPlayers = new OverworldOtherPlayer(scene);

    this.tutorialMessage = new TalkMessageUi(scene);
  }

  setup(): void {
    this.hud.setup();
    this.tutorialMessage.setup(OVERWORLD_ZOOM);

    this.disableFilterCallback = () => {
      this.setDayNightFilterEnabled(false);
    };
    this.enableFilterCallback = () => {
      if (!this.isDayNightFilterEnabled) return;

      this.setDayNightFilterEnabled(true);
    };

    Event.on(EVENT.DISABLE_DAY_NIGHT_FILTER, this.disableFilterCallback);
    Event.on(EVENT.ENABLE_DAY_NIGHT_FILTER, this.enableFilterCallback);

    this.languageChangedCallback = () => {
      this.updateTexts();
    };
    Event.on(EVENT.LANGUAGE_CHANGED, this.languageChangedCallback);

    const location = PlayerGlobal.getData()?.location;
    if (!location) throwError(ErrorCode.PLAYER_DATA_NOT_SET);

    const mapFactory = OverworldGlobal.getMapFactory(location);
    if (!mapFactory) throwError(ErrorCode.MAP_NOT_FOUND, { location });

    playBackgroundMusic(this.scene, mapFactory(this).getSound());
    this.areaTexture = mapFactory(this).getArea();
    this.areaLocation = location;

    const overworld = mapFactory(this);
    overworld.setup(this);
    this.isDayNightFilterEnabled = overworld.getIsDayNightFilterEnabled();
    this.isAllowedRide = overworld.getIsAllowedRide();
  }

  async show(data?: any): Promise<void> {
    this.map.show();
    this.trackGameObject(this.map.getLayerContainer());
    this.trackGameObject(this.map.getForegroundContainer());
    this.trackGameObject(this.map.getForeground1Container());

    this.hud.showArea(this.areaTexture, this.areaLocation);

    this.setDayNightFilterEnabled(this.isDayNightFilterEnabled);

    this.scene.cameras.main.setBackgroundColor('#000000');

    this.updateTimeOfDayFromCurrentTime();
    this.createDayNightOverlay();

    this.statue.show();
    this.npc.show(this.map.get());

    if (this.type === OVERWORLD_TYPE.SAFARI) {
      this.safari.show(this.map.get());

      const npcs = this.npc.getNpcs();
      const wilds = this.safari.getWilds();
      const groundItems = this.safari.getGroundItems();
      const doors = this.statue.getDoors();
      const triggers = this.statue.getTriggers();
      const signs = this.statue.getSigns();

      const objectCollections = {
        npcs,
        wilds,
        groundItems,
        doors,
        signs,
        triggers,
      };

      for (const wild of wilds) {
        wild.setObjectCollections(objectCollections);
      }
    }

    runFadeEffect(this.scene, 1200, 'in');

    this.addLamps();
    this.updateLamps();

    this.otherPlayers.show(this.map.get());
    this.hud.show();

    this.player.clearActionQueue();
    OverworldGlobal.setBlockingUpdate(false);

    this.hud.updateIconTint(TEXTURE.ICON_RUNNING, PlayerGlobal.getLastPlayerStatusWalkOrRunning() === PLAYER_STATUS.RUNNING);

    await this.player.show(this.map.get(), this.type);
    await this.player.showTutorialMessages(this.type);

    const playerSprite = this.player.getSprite();

    if (playerSprite) {
      this.scene.cameras.main.startFollow(playerSprite, true, 0.5, 0.5);
      this.scene.cameras.main.setZoom(1.5);
    }

    await this.player.waitingMovement();
  }

  protected onClean(): void {
    this.scene.cameras.main.resetPostPipeline();
    Event.off(EVENT.DISABLE_DAY_NIGHT_FILTER, this.disableFilterCallback);
    Event.off(EVENT.ENABLE_DAY_NIGHT_FILTER, this.enableFilterCallback);
    if (this.languageChangedCallback) {
      Event.off(EVENT.LANGUAGE_CHANGED, this.languageChangedCallback);
    }

    if (this.dayNightOverlay) {
      this.dayNightOverlay.destroy();
      this.dayNightOverlay = null;
    }

    this.map.clean();
    this.hud.clean();
    this.npc.clean();
    this.statue.clean();

    this.cleanLamps();

    if (this.type === OVERWORLD_TYPE.SAFARI) this.safari.clean();

    this.player.clean();
    this.otherPlayers.clean();
  }

  setTimeOfDay(time: number): void {
    DayNightFilter.setTimeOfDay(time);
    this.updateDayNightOverlayColor();
  }

  updateTimeOfDayFromCurrentTime(): void {
    const adjustedTime = getCurrentTimeOfDayValue();
    this.setTimeOfDay(adjustedTime);
  }

  pause(onoff: boolean, data?: any): void {
    if (onoff) {
      Keyboard.clearCallbacks();
    } else {
      this.player.handleKeyInput();
    }
  }

  handleKeyInput(data?: any): void {
    this.player.handleKeyInput();
  }

  async autoWalkPlayerTo(tileX: number, tileY: number): Promise<boolean> {
    return this.player.autoWalkTo(tileX, tileY);
  }

  update(time: number, delta: number): void {
    if (this.map.get()) this.otherPlayers.update(delta);
    if (this.type === OVERWORLD_TYPE.SAFARI) this.safari.update(delta);
    this.hud.update(time, delta);

    if (time - this.lastTimeUpdate >= this.TIME_UPDATE_INTERVAL) {
      this.updateTimeOfDayFromCurrentTime();
      this.lastTimeUpdate = time;

      this.updateLamps();
    }

    if (OverworldGlobal.getBlockingUpdate()) return;

    const currentUi = Game.getTopActiveUi();

    if (currentUi instanceof OverworldUi) {
      this.player.update(delta);
      this.npc.update(delta);

      if (this.type === OVERWORLD_TYPE.SAFARI && this.safari) {
        const wilds = this.safari.getWilds();
        const playerObj = this.player.getObj();

        if (playerObj && wilds.length > 0) {
          for (const wild of wilds) {
            wild.updateNameBasedOnRange(playerObj);
          }
        }
      }
    }

    if (currentUi instanceof OverworldMenuUi || currentUi instanceof OverworldUi || currentUi instanceof QuickSlotItemUi) {
      this.scene.cameras.main.setZoom(1.5);
      PlayerGlobal.setOverworldZoom(1.5);
    } else {
      if (currentUi instanceof ConnectBaseUi) {
        return;
      }
      this.scene.cameras.main.setZoom(1);
      PlayerGlobal.setOverworldZoom(1);
    }
  }

  getMap() {
    return this.map;
  }

  getNpc() {
    return this.npc;
  }

  getStatue() {
    return this.statue;
  }

  setType(type: OVERWORLD_TYPE) {
    this.type = type;
    OverworldGlobal.setCurrentOverworldType(type);
  }

  savePlayerPosition(): void {
    if (this.player) {
      this.player.savePosition();
    }
  }

  getIsAllowedRide() {
    return this.isAllowedRide;
  }

  setDayNightFilterEnabled(enabled: boolean): void {
    if (this.dayNightOverlay) {
      this.dayNightOverlay.setVisible(enabled);
    }
  }

  private createDayNightOverlay(): void {
    const map = this.map.get();
    if (!map) return;

    const mapScale = 3;
    const mapWidth = map.widthInPixels * mapScale;
    const mapHeight = map.heightInPixels * mapScale;

    if (this.dayNightOverlay) {
      this.dayNightOverlay.destroy();
      this.dayNightOverlay = null;
    }

    this.dayNightOverlay = this.scene.add.rectangle(mapWidth / 2, mapHeight / 2, mapWidth, mapHeight, 0x000000, 1.0);

    this.dayNightOverlay.setScrollFactor(1);
    this.dayNightOverlay.setDepth(DEPTH.FOREGROND + 0.5);
    this.dayNightOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.updateDayNightOverlayColor();
  }

  private updateDayNightOverlayColor(): void {
    if (!this.dayNightOverlay) return;

    const timeOfDay = DayNightFilter.getTimeOfDay();
    let color: number;
    let alpha: number;

    if (!this.isDayNightFilterEnabled) {
      color = 0xffffff;
      alpha = 0;
      this.dayNightOverlay.setFillStyle(color, alpha);
      return;
    }

    if (timeOfDay < 0.25) {
      // Night (어두운 파란색 톤) - 0x666699 (0.4, 0.5, 0.8)
      color = 0x666699;
      alpha = 0.8; // 어둡게
    } else if (timeOfDay < 0.35) {
      // Dawn (약간 밝은 파란색) - 0x99b3e6 (0.6, 0.7, 0.9)
      color = 0x99b3e6;
      alpha = 0.7;
    } else if (timeOfDay < 0.75) {
      // 낮 (원본 색상) - 오버레이 투명하게
      // 0.35 ~ 0.75 범위 (새벽 0.35 이후 ~ 해질녘 0.75 이전)
      color = 0xffffff;
      alpha = 0;
    } else if (timeOfDay < 0.83) {
      // 해질녘 (주황색 톤) - 0xffcc99 (1.0, 0.8, 0.6)
      // 0.75 ~ 0.83 범위 (18시 ~ 20시)
      color = 0xffcc99;
      alpha = 0.8;
    } else {
      // 밤 (0.83 ~ 1.0 범위)
      color = 0x666699;
      alpha = 0.8;
    }

    this.dayNightOverlay.setFillStyle(color, alpha);
  }

  addLamps() {
    const lightTilePositions = this.map.getLightTilePositions();
    for (const lightTilePosition of lightTilePositions) {
      const lamp = new LampOverworldObj(this.scene, TEXTURE.LAMP, lightTilePosition.x, lightTilePosition.y, '', OBJECT.LAMP);
      this.lamp.push(lamp);
    }
  }

  cleanLamps() {
    for (const lamp of this.lamp) {
      lamp.clean();
      lamp.destroy();
    }
    this.lamp = [];
  }

  updateLamps() {
    const currentTimeOfDay = getCurrentTimeOfDay();
    if (currentTimeOfDay === TIME.DAWN || currentTimeOfDay === TIME.NIGHT) {
      for (const lamp of this.lamp) {
        lamp.getSprite().setTexture(TEXTURE.LAMP);
        if (lamp.getBlinkTween()) continue;

        lamp.reaction();
      }
    } else {
      for (const lamp of this.lamp) {
        lamp.getSprite().setTexture(TEXTURE.BLANK);
      }
    }
  }

  private updateTexts(): void {
    if (this.hud) {
      this.hud.updateTexts();
    }

    const currentUi = Game.getTopActiveUi();
    if (currentUi && currentUi instanceof OverworldMenuUi) {
      currentUi.updateTexts();
    }

    if (this.type === OVERWORLD_TYPE.SAFARI && this.safari) {
      const wilds = this.safari.getWilds();
      for (const wild of wilds) {
        wild.updateName();
      }
    }

    if (this.npc) {
      const npcs = this.npc.getNpcs();
      for (const npc of npcs) {
        npc.updateName();
      }
    }

    if (this.statue) {
      const signs = this.statue.getSigns();
      for (const sign of signs) {
        sign.updateScript();
      }
    }
  }
}

export class OverworldPlayer {
  private scene: InGameScene;
  private safari: OverworldSafari;
  private npc: OverworldNpc;
  private statue: OverworldStatue;
  private hud: OverworldHUDUi;
  private overworldUi: OverworldUi;

  private talkMessageUi: TalkMessageUi;
  private questionMessageUi: QuestionMessageUi;
  private noticeUi: NoticeUi;

  private map!: Phaser.Tilemaps.Tilemap;
  private obj!: PlayerOverworldObj | null;
  private uiInitCnt: boolean = false;

  private readonly scale: number = 3;

  private currentAction: OVERWORLD_ACTION = OVERWORLD_ACTION.IDLE;
  private actionQueue: OverworldActionQueue = new OverworldActionQueue((action: OVERWORLD_ACTION) => {
    this.currentAction = action;
    if (action === OVERWORLD_ACTION.IDLE) {
      this.handleKeyInput();
    }
  });

  private inputHandler!: OverworldPlayerInputHandler;
  private interactionHandler!: OverworldPlayerInteractionHandler;

  private useItemCallback?: (item: any) => void;
  private inputLocked: boolean = false;
  private activeTrigger: OverworldTriggerObj | null = null;

  constructor(scene: InGameScene, overworldUi: OverworldUi, npc: OverworldNpc, safari: OverworldSafari, statue: OverworldStatue, hud: OverworldHUDUi) {
    this.scene = scene;
    this.overworldUi = overworldUi;
    this.safari = safari;
    this.npc = npc;
    this.statue = statue;
    this.hud = hud;

    this.talkMessageUi = new TalkMessageUi(scene);
    this.questionMessageUi = new QuestionMessageUi(scene);
    this.noticeUi = new NoticeUi(scene);

    Event.on(EVENT.BATTLE_FINISH, () => {
      this.obj?.setIsEvent(false);
    });

    Event.on(EVENT.FINISH_MOVEMENT_PLAYER, () => {});
  }

  async show(map: Phaser.Tilemaps.Tilemap, type: OVERWORLD_TYPE) {
    if (!this.uiInitCnt) {
      this.talkMessageUi.setup(OVERWORLD_ZOOM);
      this.questionMessageUi.setup(OVERWORLD_ZOOM);
      this.noticeUi.setup(OVERWORLD_ZOOM);
      this.uiInitCnt = true;
    }

    const user = PlayerGlobal.getData()!;
    const pet = PC.getPet();

    const npcs = this.npc.getNpcs();
    const wilds = this.safari.getWilds();
    const groundItems = this.safari.getGroundItems();
    const doors = this.statue.getDoors();
    const triggers = this.statue.getTriggers();
    const signs = this.statue.getSigns();

    const objectCollections = {
      npcs,
      wilds,
      groundItems,
      doors,
      signs,
      triggers,
    };

    for (const wild of wilds) {
      wild.setObjectCollections(objectCollections);
    }

    this.map = map;
    this.obj = new PlayerOverworldObj(
      this.scene,
      this.map,
      user.gender,
      user.avatar,
      pet,
      user.x,
      user.y,
      user.nickname,
      OBJECT.PLAYER,
      DIRECTION.DOWN,
      this.hud,
      objectCollections,
      this.overworldUi.getIsAllowedRide(),
    );
    this.obj.setSpriteScale(this.scale);
    this.initializeHandlers();

    if (this.useItemCallback) {
      Event.off(EVENT.USE_ITEM, this.useItemCallback);
    }
    this.useItemCallback = (item: any) => {
      if (!this.overworldUi.getIsAllowedRide() && item.key === '046') {
        void this.actionQueue.enqueue(async () => {
          await this.talkMessageUi.show({
            type: 'default',
            content: replacePercentSymbol(i18next.t('message:warn_not_allowed_item'), [PlayerGlobal.getData()?.nickname]),
            speed: Option.getTextSpeed()!,
            endDelay: MessageEndDelay.DEFAULT,
          });
        }, OVERWORLD_ACTION.TALK);
        return;
      }
      this.obj?.useItem(item);
    };
    Event.on(EVENT.USE_ITEM, this.useItemCallback);

    this.handleKeyInput();
  }

  getObj() {
    return this.obj;
  }

  async showTutorialMessages(type: OVERWORLD_TYPE): Promise<void> {
    if (type === OVERWORLD_TYPE.SAFARI && Option.getTutorial() && Option.getClientTutorial('safari')) {
      void this.actionQueue.enqueue(async () => {
        this.hud.showTutorialBg(true);
        await this.interactionHandler.showTutorialMessages();
        this.hud.showTutorialBg(false);
      }, OVERWORLD_ACTION.TALK);
      Option.setClientTutorial(false, 'safari');
    }
  }

  async waitingMovement(): Promise<void> {
    void this.actionQueue.enqueue(async () => {
      await delay(this.scene, 200);
    }, OVERWORLD_ACTION.WAITING);
  }

  private initializeHandlers(): void {
    const inputContext: OverworldPlayerInputContext = {
      scene: this.scene,
      obj: this.obj,
      actionQueue: this.actionQueue,
      getCurrentAction: () => this.currentAction,
      hud: this.hud,
      waitForUiClose: (mode: MODE) => this.interactionHandler.waitForUiClose(mode),
      handleSelectEvent: (event: any) => this.interactionHandler.handleSelectEvent(event),
      showSurfMessage: () => this.interactionHandler.showSurfMessage(),
      isInputLocked: () => this.inputLocked,
    };

    const interactionContext: OverworldPlayerInteractionContext = {
      scene: this.scene,
      obj: this.obj,
      talkMessageUi: this.talkMessageUi,
      questionMessageUi: this.questionMessageUi,
      noticeUi: this.noticeUi,
    };

    this.inputHandler = new OverworldPlayerInputHandler(this.scene, inputContext);
    this.interactionHandler = new OverworldPlayerInteractionHandler(interactionContext);
  }

  clean() {
    if (!this.obj) {
      console.error('obj is null');
      return;
    }

    if (this.useItemCallback) {
      Event.off(EVENT.USE_ITEM, this.useItemCallback);
      this.useItemCallback = undefined;
    }

    Keyboard.blockKeys(true);
    Keyboard.clearAllowKey();
    Keyboard.clearCallbacks();

    this.obj.destroy();
    this.obj.getPet()?.destroy();
    this.obj = null;
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.setScroll(0, 0);

    this.talkMessageUi.clean();
    this.questionMessageUi.clean();
    this.noticeUi.clean();

    this.actionQueue.clear();
  }

  clearActionQueue(): void {
    this.actionQueue.clear();
  }

  resetCurrentActionIfNotIdle(): void {
    if (this.currentAction !== OVERWORLD_ACTION.IDLE) {
      this.currentAction = OVERWORLD_ACTION.IDLE;
      this.actionQueue.clear();
    }
  }

  update(delta: number) {
    if (this.obj) {
      if (this.inputHandler) {
        this.inputHandler.updateContext({ obj: this.obj });
      }
      if (this.interactionHandler) {
        this.interactionHandler.updateContext({ obj: this.obj });
      }

      if (this.currentAction === OVERWORLD_ACTION.IDLE) {
        this.inputHandler.handleMovement();
      }

      this.obj?.update(delta);
      this.obj?.getPet()?.update(delta);
    }

    this.handleTriggerOverlap();
  }

  handleKeyInput() {
    if (!this.obj || !this.inputHandler) {
      return;
    }

    if (this.inputLocked) {
      return;
    }

    Keyboard.blockKeys(false);
    Keyboard.resetKeyState();

    if (this.inputHandler) {
      Keyboard.blockKeys(false);
      Keyboard.resetKeyState();
      this.inputHandler.handleKeyInput();
    }
  }

  async autoWalkTo(tileX: number, tileY: number): Promise<boolean> {
    if (!this.obj) return false;
    if (this.inputLocked) return false;
    if (this.currentAction !== OVERWORLD_ACTION.IDLE) return false;

    this.inputLocked = true;
    this.currentAction = OVERWORLD_ACTION.AUTO_WALK;
    Keyboard.blockKeys(true);
    Keyboard.resetKeyState();

    try {
      return await this.obj.autoWalkTo(tileX, tileY);
    } finally {
      Keyboard.blockKeys(false);
      Keyboard.resetKeyState();
      this.inputLocked = false;
      this.currentAction = OVERWORLD_ACTION.IDLE;
    }
  }

  private handleTriggerOverlap(): void {
    if (!this.obj) return;
    if (!this.obj.isMovementFinish()) return;

    const trigger = this.obj.getTriggerOnCurrentTile();

    if (!trigger) {
      this.activeTrigger = null;
      return;
    }

    if (this.activeTrigger === trigger) return;
    if (this.currentAction !== OVERWORLD_ACTION.IDLE) return;

    this.activeTrigger = trigger;

    void this.actionQueue.enqueue(async () => {
      await trigger.reaction({
        message: this.talkMessageUi,
        player: this.obj!,
        npc: this.npc.getNpcs(),
      });
    }, OVERWORLD_ACTION.TRIGGER);
  }

  getSprite(): Phaser.GameObjects.Sprite | null {
    return this.obj?.getSprite() || null;
  }

  savePosition(): void {
    if (this.obj) {
      const tilePos = this.obj.getTilePos();
      PlayerGlobal.updateData({ x: tilePos.x, y: tilePos.y });
    }
  }
}
