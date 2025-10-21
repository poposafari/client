import { catchGroundItemApi, getAvailableTicketApi, receiveAvailableTicketApi } from '../api';
import { eventBus } from '../core/event-bus';
import { GM } from '../core/game-manager';
import { DEPTH, DIRECTION, EVENT, ItemCategory, KEY, MODE, OBJECT, OVERWORLD_TYPE, PLAYER_STATUS, TEXTURE, UI } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { SocketHandler } from '../handlers/socket-handler';
import i18next from '../i18n';
import { DoorOverworldObj } from '../obj/door-overworld-obj';
import { GroundItemOverworldObj } from '../obj/ground-item-overworld-obj';
import { NpcOverworldObj } from '../obj/npc-overworld-obj';
import { OtherPlayerOverworldObj } from '../obj/other-player-overworld-obj';
import { PlayerOverworldObj } from '../obj/player-overworld-obj';
import { PostCheckoutOverworldObj } from '../obj/post-checkout-overworld-obj';
import { ShopCheckoutOverworldObj } from '../obj/shop-checkout-overworld-obj';
import { WildOverworldObj } from '../obj/wild-overworld-obj';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldStorage } from '../storage';
import {
  ChangePetRes,
  DoorInfo,
  FacingPlayerRes,
  ForegroundLayer,
  Layer,
  MapInfo,
  NpcInfo,
  OtherObjectMovementQueue,
  OtherPlayerInfo,
  PlayerMovementRes,
  PokemonSpawn,
  PostOfficeType,
  ShopType,
  StatueInfo,
} from '../types';
import { isSafariData, matchPlayerStatusToDirection, replacePercentSymbol } from '../utils/string-util';
import { HiddenMoveUi } from './hidden-move-ui';
import { NoticeUi } from './notice-ui';
import { QuestionMessageUi } from './question-message-ui';
import { SafariListUi } from './safari-list-ui';
import { ShopUi } from './shop-ui';
import { StarterPokemonUi } from './starter-pokemon-ui';
import { TalkMessageUi } from './talk-message-ui';
import { addMap, runFadeEffect, Ui } from './ui';

export class OverworldUi extends Ui {
  private type!: OVERWORLD_TYPE;

  protected map: OverworldMap;
  protected player: OverworldPlayer;
  protected npc: OverworldNpc;
  protected safari: OverworldSafari;
  protected statue: OverworldStatue;
  protected otherPlayers: OverworldOtherPlayer;

  constructor(scene: InGameScene) {
    super(scene);

    this.map = new OverworldMap(scene);
    this.statue = new OverworldStatue(scene);
    this.npc = new OverworldNpc(scene);
    this.safari = new OverworldSafari(scene);
    this.player = new OverworldPlayer(scene, this.npc, this.safari);
    this.otherPlayers = new OverworldOtherPlayer(scene);
  }

  setup(): void {}

  show(data?: any): void {
    this.map.show();
    this.statue.show();
    this.npc.show(this.map.get());
    this.player.show(this.map.get());
    this.otherPlayers.show(this.map.get());

    if (this.type === OVERWORLD_TYPE.SAFARI) this.safari.show(this.map.get());

    runFadeEffect(this.scene, 1200, 'in');
  }

  clean(data?: any): void {
    this.map.clean();
    this.player.clean();
    this.npc.clean();
    this.statue.clean();
    this.otherPlayers.clean();

    if (this.type === OVERWORLD_TYPE.SAFARI) this.safari.clean();
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(data?: any): void {
    this.player.handleKeyInput();
  }

  update(time: number, delta: number): void {
    if (OverworldStorage.getInstance().getBlockingUpdate()) return;

    const currentUi = GM.getTopUiStack();

    if (currentUi instanceof OverworldUi) this.player.update(delta);
    if (this.map.get()) this.otherPlayers.update(delta);
    if (this.type === OVERWORLD_TYPE.SAFARI) this.safari.updateWilds(delta);

    eventBus.emit(EVENT.HUD_LOCATION_UPDATE);
    eventBus.emit(EVENT.HUD_CANDY_UPDATE);
    eventBus.emit(EVENT.HUD_ITEMSLOT_UPDATE);
    eventBus.emit(EVENT.HUD_PARTY_UPDATE);
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
    GM.setCurrentOverworldType(type);
    this.type = type;
  }
}

export class OverworldMap {
  private scene!: InGameScene;
  private sceneWidth!: number;
  private sceneHeight!: number;

  private map!: Phaser.Tilemaps.Tilemap;
  private layers: Phaser.Tilemaps.TilemapLayer[] = [];

  private mapInfo: MapInfo = { texture: TEXTURE.BLANK, tilesets: [] };
  private layerInfo: Layer[] = [];
  private foregroundLayerInfo: ForegroundLayer = { idx: 0, texture: [], depth: 0 };
  private foreground1LayerInfo: ForegroundLayer = { idx: 0, texture: [], depth: 0 };

  private layerContainer!: Phaser.GameObjects.Container;
  private foregroundContainer!: Phaser.GameObjects.Container;
  private foreground1Container!: Phaser.GameObjects.Container;

  private readonly scale: number = 3;

  constructor(scene: InGameScene) {
    this.scene = scene;
    this.sceneWidth = this.scene.game.canvas.width;
    this.sceneHeight = this.scene.game.canvas.height;
  }

  get() {
    return this.map;
  }

  setup(texture: TEXTURE, tilesets: TEXTURE[]) {
    this.layerContainer = this.scene.add.container(this.sceneWidth / 4, this.sceneHeight / 4);
    this.foregroundContainer = this.scene.add.container(this.sceneWidth / 4, this.sceneHeight / 4);
    this.foreground1Container = this.scene.add.container(this.sceneWidth / 4, this.sceneHeight / 4);

    this.layerContainer.setVisible(false);
    this.foregroundContainer.setVisible(false);
    this.foreground1Container.setVisible(false);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);
    this.foreground1Container.setDepth(DEPTH.FOREGROND);

    this.mapInfo.texture = texture;
    this.mapInfo.tilesets = [];
    for (const tileset of tilesets) {
      this.mapInfo.tilesets.push(tileset);
    }
  }

  setLayer(idx: number, texture: TEXTURE, depth: DEPTH) {
    this.layerInfo.push({ idx: this.layerInfo.length, texture: texture, depth: depth });
  }

  setForegroundLayer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    this.foregroundLayerInfo.idx = idx;
    this.foregroundLayerInfo.texture = texture;
    this.foregroundLayerInfo.depth = depth;
  }

  setForeground1Layer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    this.foreground1LayerInfo.idx = idx;
    this.foreground1LayerInfo.texture = texture;
    this.foreground1LayerInfo.depth = depth;
  }

  show() {
    this.map = addMap(this.scene, this.mapInfo.texture);

    this.foregroundContainer.setDepth(DEPTH.FOREGROND);
    this.foreground1Container.setDepth(DEPTH.FOREGROND);

    for (const tileset of this.mapInfo.tilesets) {
      this.addTileset(tileset);
    }

    for (const layer of this.layerInfo) {
      this.addLayers(layer.idx, layer.texture, layer.depth);
    }

    this.addForegroundLayer(this.foregroundLayerInfo.idx, this.foregroundLayerInfo.texture, this.foregroundLayerInfo.depth);

    if (this.foreground1LayerInfo.texture.length > 0) this.addForeground1Layer(this.foreground1LayerInfo.idx, this.foreground1LayerInfo.texture, this.foreground1LayerInfo.depth);

    this.layerContainer.setVisible(true);
    this.foregroundContainer.setVisible(true);
    this.foreground1Container.setVisible(true);
  }

  clean() {
    if (this.map) {
      this.map.destroy();
      this.map = null!;
    }

    if (this.layerContainer) {
      this.layerContainer.removeAll(true);
      this.layerContainer.destroy();
      this.layerContainer = null!;
      this.layers = [];
      this.layerInfo = [];
    }

    if (this.foregroundContainer) {
      this.foregroundContainer.removeAll(true);
      this.foregroundContainer.destroy();
      this.foregroundContainer = null!;
      this.foregroundLayerInfo = { idx: 0, texture: [], depth: 0 };
    }

    if (this.foreground1LayerInfo.texture.length > 0 && this.foreground1Container) {
      this.foreground1Container.removeAll(true);
      this.foreground1Container.destroy();
      this.foreground1Container = null!;
      this.foreground1LayerInfo = { idx: 0, texture: [], depth: 0 };
    }
  }

  private addLayers(idx: number, texture: TEXTURE, depth: DEPTH) {
    const layer = this.map.createLayer(idx, texture)?.setScale(this.scale).setDepth(depth);
    this.layers.push(layer!);
    this.layerContainer.add(layer!);
  }

  private addForegroundLayer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    const foregroundLayer = this.map.createLayer(idx, texture)?.setScale(this.scale).setDepth(depth);
    this.foregroundContainer.add(foregroundLayer!);
  }

  private addForeground1Layer(idx: number, texture: TEXTURE[], depth: DEPTH) {
    const foregroundLayer = this.map.createLayer(idx, texture)?.setScale(this.scale).setDepth(depth);
    this.foreground1Container.add(foregroundLayer!);
  }

  private addTileset(tilesetTexture: TEXTURE) {
    this.map.addTilesetImage(tilesetTexture, tilesetTexture);
  }
}

export class OverworldPlayer {
  private scene: InGameScene;
  private cursorKey: Phaser.Types.Input.Keyboard.CursorKeys;
  private npc: OverworldNpc;
  private safari: OverworldSafari;

  private talkMessageUi: TalkMessageUi;
  private questionMessageUi: QuestionMessageUi;
  private noticeUi: NoticeUi;
  private hiddenMoveUi: HiddenMoveUi;
  private shopUi_0: ShopUi;
  private shopUi_1: ShopUi;
  private safariListUi: SafariListUi;
  private starterPokemonUi: StarterPokemonUi;

  private map!: Phaser.Tilemaps.Tilemap;
  private obj!: PlayerOverworldObj | null;
  private uiInitCnt: boolean = false;
  // private otherObj!: Map<number, PlayerOverworldObj>;
  private otherObjMovementQueue: Array<OtherObjectMovementQueue> = [];

  private keyPressStartTime: { [key: string]: number } = {};
  private readonly SHORT_KEY_THRESHOLD: number = 30;

  private readonly scale: number = 3;

  constructor(scene: InGameScene, npc: OverworldNpc, safari: OverworldSafari) {
    this.scene = scene;
    this.cursorKey = this.scene.input.keyboard!.createCursorKeys();
    this.npc = npc;
    this.safari = safari;

    this.talkMessageUi = new TalkMessageUi(scene);
    this.questionMessageUi = new QuestionMessageUi(scene);
    this.noticeUi = new NoticeUi(scene);
    this.hiddenMoveUi = new HiddenMoveUi(scene);
    this.shopUi_0 = new ShopUi(scene);
    this.shopUi_1 = new ShopUi(scene);
    this.safariListUi = new SafariListUi(scene);
    this.starterPokemonUi = new StarterPokemonUi(scene);

    // this.otherObj = new Map<number, PlayerObject>();

    eventBus.on(EVENT.BATTLE_FINISH, () => {
      this.obj?.setIsEvent(false);
    });
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    if (!this.uiInitCnt) {
      this.talkMessageUi.setup();
      this.questionMessageUi.setup();
      this.noticeUi.setup();
      this.hiddenMoveUi.setup();
      this.shopUi_0.setup(['002', '003', '004']);
      this.shopUi_1.setup(['011', '012', '013', '014', '015', '016', '017', '018', '019', '020', '021', '022', '023', '024', '025', '026', '027', '028', '029']);
      this.starterPokemonUi.setup();
      this.safariListUi.setup();
      this.uiInitCnt = true;
    }

    const user = GM.getUserData()!;
    const initPlayerDirection = OverworldStorage.getInstance().getMap(user.location)?.getInitPlayerDirection();

    this.map = map;
    this.obj = new PlayerOverworldObj(this.scene, this.map, user.gender, user.avatar, user.pet!, user.x, user.y, user.nickname, OBJECT.PLAYER, initPlayerDirection!);
    GM.setPlayerObj(this.obj);
    GM.setOverworldMap(this.map);
    this.obj.setSpriteScale(this.scale);
    this.scene.cameras.main.startFollow(this.obj.getSprite(), true, 0.5, 0.5);

    this.handleKeyInput();
  }

  clean() {
    if (!this.obj) {
      console.error('obj is null');
      return;
    }

    KeyboardHandler.getInstance().setKeyDownCallback(() => {});

    this.obj.destroy();
    this.obj.getPet()?.destroy();
    this.obj = null;
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.setScroll(0, 0);

    this.talkMessageUi.clean();
    this.questionMessageUi.clean();
    this.noticeUi.clean();
  }

  update(delta: number) {
    if (this.obj && !this.obj.isEvent) {
      this.movement();
      this.obj?.update(delta);
      this.obj?.getPet()?.update(delta);

      const objInFront = this.obj?.getObjectInFront(this.obj?.getLastDirection());

      if (objInFront && objInFront.getObjType() !== OBJECT.DOOR) {
        eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_TALK, true);
      } else {
        eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_TALK, false);
      }
    }
  }

  private movement() {
    if (!this.obj) return;

    if (this.cursorKey.up.isDown && !this.keyPressStartTime['up']) {
      this.keyPressStartTime['up'] = this.scene.time.now;
    }
    if (this.cursorKey.down.isDown && !this.keyPressStartTime['down']) {
      this.keyPressStartTime['down'] = this.scene.time.now;
    }
    if (this.cursorKey.left.isDown && !this.keyPressStartTime['left']) {
      this.keyPressStartTime['left'] = this.scene.time.now;
    }
    if (this.cursorKey.right.isDown && !this.keyPressStartTime['right']) {
      this.keyPressStartTime['right'] = this.scene.time.now;
    }

    if (this.cursorKey.up.isDown && this.obj!.isMovementFinish()) {
      this.handleDirectionInput('up', DIRECTION.UP);
    } else if (this.cursorKey.down.isDown && this.obj!.isMovementFinish()) {
      this.handleDirectionInput('down', DIRECTION.DOWN);
    } else if (this.cursorKey.left.isDown && this.obj!.isMovementFinish()) {
      this.handleDirectionInput('left', DIRECTION.LEFT);
    } else if (this.cursorKey.right.isDown && this.obj!.isMovementFinish()) {
      this.handleDirectionInput('right', DIRECTION.RIGHT);
    }

    if (!this.cursorKey.up.isDown && this.keyPressStartTime['up']) {
      delete this.keyPressStartTime['up'];
    }
    if (!this.cursorKey.down.isDown && this.keyPressStartTime['down']) {
      delete this.keyPressStartTime['down'];
    }
    if (!this.cursorKey.left.isDown && this.keyPressStartTime['left']) {
      delete this.keyPressStartTime['left'];
    }
    if (!this.cursorKey.right.isDown && this.keyPressStartTime['right']) {
      delete this.keyPressStartTime['right'];
    }
  }

  private handleDirectionInput(keyName: string, direction: DIRECTION) {
    const currentTime = this.scene.time.now;
    const keyPressDuration = currentTime - (this.keyPressStartTime[keyName] || currentTime);

    if (keyPressDuration <= this.SHORT_KEY_THRESHOLD) {
      this.obj!.changeDirectionOnly(direction);
      SocketHandler.getInstance().facingPlayer(matchPlayerStatusToDirection(direction));
    } else {
      this.obj!.isDoorInFront(direction);
      this.obj!.move(direction);
    }
  }

  handleKeyInput() {
    const keyboard = KeyboardHandler.getInstance();
    const keys = [KEY.SELECT, KEY.RUNNING, KEY.MENU, KEY.QUICK_SLOT];

    const keydownCallback = async (key: KEY) => {
      try {
        switch (key) {
          case KEY.SELECT:
            if (this.obj && this.obj.isMovementFinish() && !this.obj.isEvent) {
              const event = this.obj.getEvent();
              if (event === 'surf') {
                this.obj.setIsEvent(true);
                keyboard.setKeyDownCallback(() => {});
                await this.showSurfMessage();
                keyboard.setAllowKey(keys);
                keyboard.setKeyDownCallback(keydownCallback);
              } else if (event instanceof ShopCheckoutOverworldObj) {
                this.obj.setIsEvent(true);
                await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc002_0'), speed: GM.getUserOption()?.getTextSpeed()! });

                if (event.reaction() === ShopType.SHOP_0) {
                  await this.shopUi_0.show();
                } else if (event.reaction() === ShopType.SHOP_1) {
                  await this.shopUi_1.show();
                }

                await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc002_4'), speed: GM.getUserOption()?.getTextSpeed()! });

                this.obj.setIsEvent(false);
                keyboard.setAllowKey(keys);
                keyboard.setKeyDownCallback(keydownCallback);
              } else if (event instanceof PostCheckoutOverworldObj) {
                this.obj.setIsEvent(true);
                await this.processSafariTicket(event);
                this.obj.setIsEvent(false);
                keyboard.setAllowKey(keys);
                keyboard.setKeyDownCallback(keydownCallback);
              } else if (event instanceof NpcOverworldObj) {
                this.obj.setIsEvent(true);
                await this.talkToNpc(event, this.obj.getLastDirection());
                this.obj.setIsEvent(false);
                keyboard.setAllowKey(keys);
                keyboard.setKeyDownCallback(keydownCallback);
              } else if (event instanceof WildOverworldObj) {
                this.obj.setIsEvent(true);
                await event.reaction(this.obj.getLastDirection());
                GM.changeMode(MODE.BATTLE, event);
              } else if (event instanceof GroundItemOverworldObj) {
                this.obj.setIsEvent(true);

                const groundItemData = event.reaction();
                const res = await catchGroundItemApi({ idx: groundItemData.idx });

                event.caught();

                if (res.result) {
                  await this.talkMessageUi.show({
                    type: 'default',
                    content: replacePercentSymbol(i18next.t(`message:catch_item`), [GM.getUserData()?.nickname, i18next.t(`item:${groundItemData.item}.name`)]),
                    speed: GM.getUserOption()?.getTextSpeed()!,
                  });
                  await this.talkMessageUi.show({
                    type: 'default',
                    content: replacePercentSymbol(i18next.t(`message:put_item`), [
                      GM.getUserData()?.nickname,
                      i18next.t(`item:${groundItemData.item}.name`),
                      i18next.t(`menu:pocket_${res.data.category}`),
                    ]),
                    speed: GM.getUserOption()?.getTextSpeed()!,
                  });
                  this.obj.setIsEvent(false);
                  keyboard.setAllowKey(keys);
                  keyboard.setKeyDownCallback(keydownCallback);
                }
              }
            }
            break;
          case KEY.MENU:
            if (this.obj && this.obj.isMovementFinish() && !this.obj.isEvent) {
              GM.changeMode(MODE.OVERWORLD_MENU);
              eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_MENU, true);
            }
            break;
          case KEY.RUNNING:
            if (this.obj && this.obj.isMovementFinish() && !this.obj.isEvent) {
              this.obj.setRunningToggle();
              this.obj.setMovement(PLAYER_STATUS.RUNNING);
              eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_RUNNING, true);
            }
            break;
          case KEY.QUICK_SLOT:
            if (this.obj && this.obj.isMovementFinish() && !this.obj.isEvent) {
              GM.changeMode(MODE.QUICK_SLOT_ITEM);
              eventBus.emit(EVENT.UPDATE_OVERWORLD_ICON_TINT, TEXTURE.ICON_REG, true);
            }
            break;
        }
      } catch (err: any) {
        console.error(`Error handling key input: ${err}`);
        keyboard.setKeyDownCallback(keydownCallback);
      }
    };

    keyboard.setAllowKey(keys);
    keyboard.setKeyDownCallback(keydownCallback);
  }

  private async showSurfMessage(): Promise<void> {
    if (this.obj?.getCurrentStatus() === PLAYER_STATUS.SURF) {
      return new Promise((resolve) => {
        this.questionMessageUi.show({
          type: 'default',
          content: i18next.t('message:surfOff'),
          speed: GM.getUserOption()?.getTextSpeed()!,
          yes: async () => {
            this.obj?.setMovement(PLAYER_STATUS.SURF);
            await this.obj?.jump();
            this.obj?.movePetBehind();
            this.obj?.setIsEvent(false);
            resolve();
          },
          no: async () => {
            this.obj?.setIsEvent(false);
            resolve();
          },
        });
      });
    } else {
      return new Promise((resolve) => {
        this.questionMessageUi.show({
          type: 'default',
          content: i18next.t('message:surfOn'),
          speed: GM.getUserOption()?.getTextSpeed()!,
          yes: async () => {
            await this.hiddenMoveUi.show('surf');
            await this.obj?.createDummyObjSprite('surf');
            this.obj?.recallPet();
            await this.obj?.forceSetTexture(PLAYER_STATUS.WALK);
            await this.obj?.jump();
            this.obj?.setMovement(PLAYER_STATUS.SURF);
            this.obj?.setSurf();
            this.obj?.setIsEvent(false);
            resolve();
          },
          no: async () => {
            this.obj?.setIsEvent(false);
            resolve();
          },
        });
      });
    }
  }

  private async processSafariTicket(ticketObj: PostCheckoutOverworldObj): Promise<void> {
    return new Promise(async (resolve) => {
      if (ticketObj.reaction() === PostOfficeType.POST_0) {
        await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc001_0'), speed: GM.getUserOption()?.getTextSpeed()! });
        const ticket = await getAvailableTicketApi();
        if (ticket.result) {
          if (ticket.data > 0) {
            await this.talkMessageUi.show({ type: 'default', content: replacePercentSymbol(i18next.t('npc:npc001_1'), [ticket.data]), speed: GM.getUserOption()?.getTextSpeed()! });
            await this.questionMessageUi.show({
              type: 'default',
              content: i18next.t('npc:npc001_3'),
              speed: GM.getUserOption()?.getTextSpeed()!,
              yes: async () => {
                const receive = await receiveAvailableTicketApi();
                if (receive.result) {
                  await this.receiveItem('030', receive.data.category);
                  resolve();
                }
              },
              no: async () => {
                resolve();
              },
            });
          } else {
            await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc001_2'), speed: GM.getUserOption()?.getTextSpeed()! });
            resolve();
          }
        } else {
          resolve();
        }
      }
    });
  }

  private async receiveItem(item: string, category: ItemCategory): Promise<void> {
    return new Promise(async (resolve) => {
      await this.talkMessageUi.show({
        type: 'default',
        content: replacePercentSymbol(i18next.t('message:catchItem'), [GM.getUserData()?.nickname, i18next.t(`item:${item}.name`)]),
        speed: GM.getUserOption()?.getTextSpeed()!,
      });
      await this.talkMessageUi.show({
        type: 'default',
        content: replacePercentSymbol(i18next.t('message:putPocket'), [GM.getUserData()?.nickname, i18next.t(`item:${item}.name`), i18next.t(`menu:${category}`)]),
        speed: GM.getUserOption()?.getTextSpeed()!,
      });
      resolve();
    });
  }

  private async talkToNpc(npc: NpcOverworldObj, playerDirection: DIRECTION): Promise<void> {
    npc.reaction(playerDirection);

    switch (npc.getKey()) {
      case 'npc000':
        await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc000_0'), speed: GM.getUserOption()?.getTextSpeed()! });
        await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc000_1'), speed: GM.getUserOption()?.getTextSpeed()! });
        const result = await this.safariListUi.show();

        if (isSafariData(result)) {
          const lastLocation = GM.getUserData()?.location;
          const currentLocation = result.key;

          GM.updateUserData({ location: currentLocation, lastLocation: lastLocation, x: result.x, y: result.y });
          GM.changeMode(MODE.CONNECT_SAFARI);
          this.obj?.setIsEvent(false);
        }
        break;
      case 'npc003':
        if (GM.getUserData()?.isStarter) {
          await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc003_0'), speed: GM.getUserOption()?.getTextSpeed()! });
          await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc003_1'), speed: GM.getUserOption()?.getTextSpeed()! });
          await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc003_2'), speed: GM.getUserOption()?.getTextSpeed()! });
          await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc003_3'), speed: GM.getUserOption()?.getTextSpeed()! });

          const ret = await this.starterPokemonUi.show();

          if (ret) {
            GM.updateUserData({ isStarter: false });

            await this.talkMessageUi.show({
              type: 'default',
              content: replacePercentSymbol(i18next.t('message:catch_starter_pokemon'), [GM.getUserData()?.nickname, i18next.t(`pokemon:${ret.pokedex}.name`)]),
              speed: GM.getUserOption()?.getTextSpeed()!,
            });
            await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc003_4'), speed: GM.getUserOption()?.getTextSpeed()! });
            await this.talkMessageUi.show({ type: 'default', content: replacePercentSymbol(i18next.t('npc:npc003_5'), [GM.getUserData()?.nickname]), speed: GM.getUserOption()?.getTextSpeed()! });
          }
        } else {
          await this.talkMessageUi.show({ type: 'default', content: replacePercentSymbol(i18next.t('npc:npc003_6'), [GM.getUserData()?.nickname]), speed: GM.getUserOption()?.getTextSpeed()! });
          await this.talkMessageUi.show({ type: 'default', content: i18next.t('npc:npc003_7'), speed: GM.getUserOption()?.getTextSpeed()! });
        }
        break;
    }
  }
}

export class OverworldOtherPlayer {
  private scene: InGameScene;
  private otherPlayers: Map<string, OtherPlayerOverworldObj> = new Map<string, OtherPlayerOverworldObj>();
  private map!: Phaser.Tilemaps.Tilemap;
  private storage: OverworldStorage;

  constructor(scene: InGameScene) {
    this.scene = scene;

    this.storage = OverworldStorage.getInstance();
  }

  show(map: Phaser.Tilemaps.Tilemap): void {
    this.resetOtherPlayers();
    this.map = map;
  }

  clean() {
    this.storage.cleanOtherplayerExitInfo();
    this.storage.cleanOtherplayerInfo();
    this.storage.cleanOtherplayerMovementInfo();
  }

  update(delta: number): void {
    this.OtherPlayerFacing(this.storage.shiftOtherplayerFacingInfo()!);
    this.removeOtherPlayer(this.storage.shiftOtherplayerExitInfo()?.socketId!);
    this.addOtherPlayer(this.storage.shiftOtherplayerInfo()!);
    this.updateOtherPlayerMovement(this.storage.shiftOtherplayerMovementInfo()!);
    this.OtherPlayerPet(this.storage.shiftOtherplayerPetInfo()!);

    if (this.map) {
      this.getOtherPlayers().forEach((player) => {
        player.update(delta);
      });
    }
  }

  addOtherPlayer(player: OtherPlayerInfo): void {
    if (!player) return;
    if (player.data.location !== this.storage.getKey()) return;

    const otherPlayer = new OtherPlayerOverworldObj(
      this.scene,
      this.map,
      player.data.gender,
      player.data.avatar,
      player.data.pet?.texture ?? null,
      player.data.x,
      player.data.y,
      player.data.nickname,
      OBJECT.OTHER_PLAYER,
      DIRECTION.DOWN,
    );
    this.otherPlayers.set(player.socketId, otherPlayer);
  }

  removeOtherPlayer(socketId: string): void {
    if (!socketId) return;

    const otherPlayer = this.otherPlayers.get(socketId);
    if (otherPlayer) {
      otherPlayer.destroy();
      this.otherPlayers.delete(socketId);
    }
  }

  getOtherPlayers(): Map<string, OtherPlayerOverworldObj> {
    return this.otherPlayers;
  }

  getOtherPlayer(socketId: string): OtherPlayerOverworldObj | undefined {
    return this.otherPlayers.get(socketId);
  }

  updateOtherPlayerMovement(movement: PlayerMovementRes): void {
    if (!movement) return;

    const otherPlayer = this.otherPlayers.get(movement.socketId);
    if (otherPlayer) {
      otherPlayer.updateMovement(movement.data);
    }
  }

  OtherPlayerFacing(data: FacingPlayerRes): void {
    if (!data) return;

    const otherPlayer = this.otherPlayers.get(data.socketId);
    if (otherPlayer && otherPlayer.isMovementFinish()) {
      otherPlayer.changeFacing(data.data);
    }
  }

  OtherPlayerPet(data: ChangePetRes): void {
    if (!data) return;

    const otherPlayer = this.otherPlayers.get(data.socketId);
    if (otherPlayer) {
      otherPlayer.getPet()?.changePet(data.data?.texture ?? null, otherPlayer.getCurrentStatus());
    }
  }

  resetOtherPlayers(): void {
    for (const [socketId, otherPlayer] of this.otherPlayers) {
      otherPlayer.destroy();
    }
    this.otherPlayers.clear();
  }
}

export class OverworldNpc {
  private scene: InGameScene;
  private info: NpcInfo[] = [];

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  setup(npcKey: string, x: number, y: number) {
    this.info.push({
      key: npcKey,
      x: x,
      y: y,
    });
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    for (const info of this.info) {
      const npc = new NpcOverworldObj(this.scene, info.key, info.x, info.y, i18next.t(`npc:${info.key}.name`));
      OverworldStorage.getInstance().addNpc(npc);
    }
  }

  clean() {
    this.info = [];
    OverworldStorage.getInstance().resetNpcs();
  }
}

export class OverworldStatue {
  private scene: InGameScene;

  private doorInfo: DoorInfo[] = [];
  private statue: StatueInfo[] = [];

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  setupDoor(texture: TEXTURE | string, x: number, y: number, offsetY: number, displayWidth: number, displayHeight: number, location: string, goalX: number, goalY: number) {
    this.doorInfo.push({
      texture: texture,
      x: x,
      y: y,
      goal: {
        location: location,
        x: goalX,
        y: goalY,
      },
      offsetY: offsetY,
      displayWidth: displayWidth,
      displayHeight: displayHeight,
    });
  }

  setupStatue(texture: TEXTURE | string, x: number, y: number, type: OBJECT.STATUE | OBJECT.SHOP_CHECKOUT | OBJECT.POST_CHECKOUT, statueType: ShopType | PostOfficeType) {
    this.statue.push({
      texture: texture,
      x: x,
      y: y,
      type: type,
      statueType: statueType,
    });
  }

  show() {
    this.showDoor();
    this.showStatue();
  }

  clean() {
    this.doorClean();
    this.cleanStatue();
  }

  private doorClean() {
    this.doorInfo = [];
    OverworldStorage.getInstance().resetDoor();
  }

  private showDoor() {
    for (const door of this.doorInfo) {
      const doorObj = new DoorOverworldObj(this.scene, door.texture, door.x, door.y, door.offsetY, door.displayWidth, door.displayHeight, door.goal);
      OverworldStorage.getInstance().addDoor(doorObj);
    }
  }

  private showStatue() {
    for (const statue of this.statue) {
      if (statue.type === OBJECT.SHOP_CHECKOUT) {
        OverworldStorage.getInstance().addStatue(new ShopCheckoutOverworldObj(this.scene, statue.texture, statue.x, statue.y, '', statue.statueType as ShopType));
      } else if (statue.type === OBJECT.POST_CHECKOUT) {
        OverworldStorage.getInstance().addStatue(new PostCheckoutOverworldObj(this.scene, statue.texture, statue.x, statue.y, '', statue.statueType as PostOfficeType));
      }
    }
  }

  private cleanStatue() {
    this.statue = [];
    OverworldStorage.getInstance().resetStatue();
  }
}

export class OverworldSafari {
  private scene: InGameScene;

  constructor(scene: InGameScene) {
    this.scene = scene;
  }

  show(map: Phaser.Tilemaps.Tilemap) {
    this.addWildObj(map);
    this.addGroundItemObj(map);
  }

  clean() {
    const storage = OverworldStorage.getInstance();

    for (const wild of storage.getWilds()) {
      wild.stopMovement();
      wild.destroy();
    }
    storage.resetWilds();

    for (const groundItem of storage.getGroundItems()) {
      groundItem.destroy();
    }
    storage.resetGroundItems();
  }

  updateWilds(delta: number) {
    for (const wild of OverworldStorage.getInstance().getWilds()) {
      if (wild.isMovementFinish()) {
      }
      wild.update(delta);
    }
  }

  private addWildObj(map: Phaser.Tilemaps.Tilemap) {
    OverworldStorage.getInstance().resetWilds();

    const validPos = this.doScanSpawnTile(map);

    for (const data of OverworldStorage.getInstance().getWildData()) {
      const randPos = this.getRandomSpawnTilePos(validPos, data.spawn);

      if (data.catch) continue;
      if (randPos) {
        const wild = new WildOverworldObj(this.scene, map, data, randPos[0], randPos[1]);
        OverworldStorage.getInstance().addWild(wild);
      }
    }
  }

  private addGroundItemObj(map: Phaser.Tilemaps.Tilemap) {
    OverworldStorage.getInstance().resetGroundItems();

    const validPos = this.doScanSpawnTile(map);

    for (const data of OverworldStorage.getInstance().getGroundItemData()) {
      const randPos = this.getRandomSpawnTilePos(validPos, 'land');

      if (data.catch) continue;

      if (randPos) {
        const groundItem = new GroundItemOverworldObj(this.scene, data, randPos[0], randPos[1]);
        OverworldStorage.getInstance().addGroundItem(groundItem);
      }
    }
  }

  private doScanSpawnTile(map: Phaser.Tilemaps.Tilemap) {
    const validPositions: [number, number, PokemonSpawn][] = [];

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tiles = this.getTile(map, new Phaser.Math.Vector2(x, y));

        if (!tiles || tiles.length > 1) {
          continue;
        }

        for (const tile of tiles) {
          if (tile && tile.properties.type) {
            validPositions.push([x, y, tile.properties.type as PokemonSpawn]);
          }
        }
      }
    }

    return validPositions;
  }

  private getTile(map: Phaser.Tilemaps.Tilemap, pos: Phaser.Math.Vector2): Phaser.Tilemaps.Tile[] | null {
    const ret: Phaser.Tilemaps.Tile[] = [];

    map.layers.map((layer) => {
      const tile = map.getTileAt(pos.x, pos.y, false, layer.name);

      if (tile) ret.push(tile!);
    });

    return ret;
  }

  private getRandomSpawnTilePos(pos: [number, number, PokemonSpawn][], targetSpawn: PokemonSpawn) {
    const targetTiles = pos.filter(([x, y, spawn]) => spawn === targetSpawn);

    return Phaser.Utils.Array.GetRandom(targetTiles);
  }
}
