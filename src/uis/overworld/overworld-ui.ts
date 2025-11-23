import { Event } from '../../core/manager/event-manager';
import { DIRECTION, EVENT, MODE, OBJECT, OVERWORLD_ACTION, OVERWORLD_TYPE, PLAYER_STATUS, TEXTURE } from '../../enums';
import { Keyboard } from '../../core/manager/keyboard-manager';
import { InGameScene } from '../../scenes/ingame-scene';
import { NoticeUi } from '../notice-ui';
import { QuestionMessageUi } from '../question-message-ui';
import { TalkMessageUi } from '../talk-message-ui';
import { playBackgroundMusic, runFadeEffect, Ui } from '../ui';
import { OverworldGlobal } from '../../core/storage/overworld-storage';
import { PlayerGlobal } from '../../core/storage/player-storage';
import { Game } from '../../core/manager/game-manager';
import { ErrorCode } from '../../core/errors';
import { throwError } from '../../core/errors';
import { PlayerOverworldObj } from '../../obj/player-overworld-obj';
import { PC } from '../../core/storage/pc-storage';
import { OverworldHUDUi } from './overworld-hud-ui';
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

export class OverworldUi extends Ui {
  private type!: OVERWORLD_TYPE;
  private areaTexture!: TEXTURE | string;
  private areaLocation!: string;
  private tutorialMessage: TalkMessageUi;

  protected map: OverworldMap;
  protected player: OverworldPlayer;
  protected npc: OverworldNpc;
  protected safari: OverworldSafari;
  protected statue: OverworldStatue;
  protected otherPlayers: OverworldOtherPlayer;
  protected hud: OverworldHUDUi;

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
    this.tutorialMessage.setup();

    const location = PlayerGlobal.getData()?.location;
    if (!location) throwError(ErrorCode.PLAYER_DATA_NOT_SET);

    const mapFactory = OverworldGlobal.getMapFactory(location);
    if (!mapFactory) throwError(ErrorCode.MAP_NOT_FOUND, { location });

    playBackgroundMusic(this.scene, mapFactory(this).getSound());
    this.areaTexture = mapFactory(this).getArea();
    this.areaLocation = location;

    const overworld = mapFactory(this);
    overworld.setup(this);
  }

  async show(data?: any): Promise<void> {
    this.map.show();
    this.trackGameObject(this.map.getLayerContainer());
    this.trackGameObject(this.map.getForegroundContainer());
    this.trackGameObject(this.map.getForeground1Container());

    this.hud.showArea(this.areaTexture, this.areaLocation);

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

    this.otherPlayers.show(this.map.get());
    this.hud.show();

    this.player.clearActionQueue();
    OverworldGlobal.setBlockingUpdate(false);

    this.hud.updateIconTint(TEXTURE.ICON_RUNNING, PlayerGlobal.getLastPlayerStatusWalkOrRunning() === PLAYER_STATUS.RUNNING);

    await this.player.show(this.map.get(), this.type);
    await this.player.showTutorialMessages(this.type);
  }

  protected onClean(): void {
    this.map.clean();
    this.hud.clean();
    this.npc.clean();
    this.statue.clean();

    if (this.type === OVERWORLD_TYPE.SAFARI) this.safari.clean();

    this.player.clean();
    this.otherPlayers.clean();
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

    if (OverworldGlobal.getBlockingUpdate()) return;

    const currentUi = Game.getTopActiveUi();

    if (currentUi instanceof OverworldUi) {
      this.player.update(delta);
      this.npc.update(delta);
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
      this.talkMessageUi.setup();
      this.questionMessageUi.setup();
      this.noticeUi.setup();
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
    this.obj = new PlayerOverworldObj(this.scene, this.map, user.gender, user.avatar, pet, user.x, user.y, user.nickname, OBJECT.PLAYER, DIRECTION.DOWN, this.hud, objectCollections);
    this.obj.setSpriteScale(this.scale);

    this.scene.cameras.main.startFollow(this.obj.getSprite(), true, 0.5, 0.5);

    this.initializeHandlers();

    if (this.useItemCallback) {
      Event.off(EVENT.USE_ITEM, this.useItemCallback);
    }
    this.useItemCallback = (item: any) => {
      this.obj?.useItem(item);
    };
    Event.on(EVENT.USE_ITEM, this.useItemCallback);

    this.handleKeyInput();
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

  savePosition(): void {
    if (this.obj) {
      const tilePos = this.obj.getTilePos();
      PlayerGlobal.updateData({ x: tilePos.x, y: tilePos.y });
    }
  }
}
