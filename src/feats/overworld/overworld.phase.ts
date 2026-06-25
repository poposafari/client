import { IGamePhase } from '@poposafari/core';
import { GameEvent, GameScene } from '@poposafari/scenes';
import type {
  OtherPetChangedPayload,
  RoomUserState,
  UsersMovedPayload,
  WildDespawnPayload,
  WildSpawnPayload,
} from './overworld-socket.types';
import { OverworldMenuPhase } from './overworld-menu.phase';
import { RegisteredItemsPhase } from './registered-items.phase';
import { OverworldUi } from './overworld.ui';
import { SafariPhase } from '../safari/safari.phase';
import { SafariMapPhase } from '../safari-map/safari-map.phase';
import { MartPhase } from '../mart';
import { FossilPhase } from '../fossil';
import { MartNpcObject } from './objects/special-npc.object';
import { BattlePhase } from '../battle';
import { RewardPhase } from '../battle/reward/reward.phase';
import { HiddenMovePhase } from '../hidden-move/hidden-move.phase';
import { MenuUi } from '@poposafari/feats/menu/menu-ui';
import { MusicianListUi } from '@poposafari/feats/menu/musician-list.ui';
import DayNightFilter from '@poposafari/utils/day-night-filter';
import i18next from '@poposafari/i18n';
import { screenFadeIn } from '@poposafari/utils/screen-fade';
import { resolveCryKey } from '@poposafari/core/master.data.ts';
import { ANIMATION, BGM, DEPTH, EASE, TEXTSHADOW, TEXTSTYLE, TEXTURE } from '@poposafari/types';
import { addImage, addSprite, addText, addWindow } from '@poposafari/utils';
import { POPOTOWN_OST_TRACKS, resolveMapBgm, setPopotownOst } from '@poposafari/core/popotown-ost';

export class OverworldPhase implements IGamePhase {
  private overworldUi: OverworldUi | null = null;
  private socketOffFns: Array<() => void> = [];
  private currentLocation: string = '';
  private unsubscribePartyCry: (() => void) | null = null;
  private onProfileChanged = (): void => {
    this.applyNewbieMode();
  };

  constructor(private scene: GameScene) {}

  private async handleMusicianTalk(): Promise<void> {
    const question = this.scene.getMessage('question');
    const talk = this.scene.getMessage('talk');
    const yesNoMenu = new MenuUi(this.scene, this.scene.getInputManager(), {
      y: +800,
      itemHeight: 70,
    });
    const listUi = new MusicianListUi(this.scene);

    const mapConfig = this.scene.getMapRegistry().get(this.currentLocation);
    const originalBgm = resolveMapBgm(this.currentLocation, mapConfig?.bgm);

    const yesNoItems = () => [
      { key: 'yes', label: i18next.t('etc:yes') },
      { key: 'no', label: i18next.t('etc:no') },
    ];

    try {
      await question.showMessage(i18next.t('object:musician_question'), {
        name: i18next.t('object:musician'),
        resolveWhen: 'displayed',
      });
      const choice = await yesNoMenu.waitForSelect(yesNoItems());
      yesNoMenu.hide();
      question.hide();
      if (choice?.key !== 'yes') return;

      const items = POPOTOWN_OST_TRACKS.map((bgm, i) => ({
        key: bgm as string,
        label: i18next.t(`object:musician_track_${i}`),
      }));
      listUi.setItems(items);

      while (true) {
        const selected = await listUi.waitForSelect();
        if (!selected || selected.key === 'cancel') {
          listUi.hide();
          if (originalBgm) this.scene.getAudio().playBackground(originalBgm);
          return;
        }

        listUi.hide();
        await question.showMessage(i18next.t('object:musician_confirm', { name: selected.label }), {
          resolveWhen: 'displayed',
        });
        const confirm = await yesNoMenu.waitForSelect(yesNoItems());
        yesNoMenu.hide();
        question.hide();

        if (confirm?.key === 'yes') {
          setPopotownOst(selected.key as BGM);
          this.scene.getAudio().playBackground(selected.key as BGM);
          await talk.showMessage(i18next.t('object:musician_done'), {
            name: i18next.t('object:musician'),
          });
          return;
        }
      }
    } finally {
      yesNoMenu.destroy();
      listUi.destroy();
    }
  }

  private applyNewbieMode(): void {
    const profile = this.scene.getUser()?.getProfile();
    const isNewbie = this.currentLocation === 's000' && profile?.hasStarter === true;
    this.overworldUi?.setNewbieMode(isNewbie);
  }

  private prefetchWildCries(mapId: string): void {
    const ids = this.scene.getMasterData().getWildPokedexIdsForMap(mapId);
    if (ids.length === 0) return;

    let queued = 0;
    for (const id of ids) {
      const key = resolveCryKey(id);
      if (!key) continue;
      if (this.scene.cache.audio.has(key)) continue;
      this.scene.loadAudio(key, 'audio/pokemon', key, 'ogg');
      queued++;
    }
    if (queued > 0) this.scene.load.start();
  }

  private prefetchPartyCries(): void {
    const party = this.scene.getUser()?.getParty();
    if (!party || party.length === 0) return;

    let queued = 0;
    for (const p of party) {
      const key = resolveCryKey(p.pokedexId);
      if (!key) continue;
      if (this.scene.cache.audio.has(key)) continue;
      this.scene.loadAudio(key, 'audio/pokemon', key, 'ogg');
      queued++;
    }
    if (queued > 0) this.scene.load.start();
  }

  async enter(): Promise<void> {
    const mapRegistry = this.scene.getMapRegistry();
    const location = this.scene.getUser()?.getProfile()?.lastLocation?.map ?? 'p003';
    this.currentLocation = location;
    const mapConfig = mapRegistry.get(location);

    if (!mapConfig) {
      throw new Error(`Map not found: ${location}`);
    }

    const mapView = this.scene.getMapBuilder().build(mapConfig);
    this.overworldUi = new OverworldUi(this.scene);
    this.overworldUi.setMapView(mapView);
    this.overworldUi.setMapConfig(mapConfig);

    this.prefetchWildCries(location);
    this.prefetchPartyCries();
    const user = this.scene.getUser();
    if (user) {
      this.unsubscribePartyCry = user.onPartyChanged(() => this.prefetchPartyCries());
    }

    const effectiveBgm = resolveMapBgm(location, mapConfig.bgm);
    if (effectiveBgm) {
      this.scene.getAudio().playBackground(effectiveBgm);
    } else {
      this.scene.getAudio().stopBackground();
    }
    this.overworldUi.onMenuRequested = () => {
      this.scene.pushPhase(new OverworldMenuPhase(this.scene, this.overworldUi));
    };
    this.overworldUi.onRegisteredItemsRequested = () => {
      if (!this.overworldUi) return;
      this.scene.pushPhase(new RegisteredItemsPhase(this.scene, this.overworldUi));
    };
    this.overworldUi.onMapRequested = () => {
      this.scene.pushPhase(new SafariMapPhase(this.scene));
    };
    this.overworldUi.onHiddenMoveSurfRequested = (caster) => {
      this.scene.pushPhase(
        new HiddenMovePhase(this.scene, {
          hiddenMove: 'move_surf',
          caster,
          onComplete: () => {
            this.overworldUi?.enterSurfWithBase();
          },
        }),
      );
    };
    this.overworldUi.onInteractivePhaseRequested = (_object, phaseKey) => {
      if (phaseKey === 'safari') {
        this.scene.pushPhase(new SafariPhase(this.scene));
      } else if (phaseKey === 'mart' && _object instanceof MartNpcObject) {
        this.scene.pushPhase(
          new MartPhase(this.scene, _object.getMartItems(), _object.getNpcKey()),
        );
      } else if (phaseKey === 'fossil') {
        this.scene.pushPhase(new FossilPhase(this.scene));
      } else if (phaseKey === 'musician') {
        void this.handleMusicianTalk();
      }
    };
    this.overworldUi.onWildEncounterRequested = (wild) => {
      const wildInfo = wild.getWild();

      const player = this.overworldUi?.getPlayer();
      const tileSpawn = player
        ? mapView.getTileSpawnAt(player.getTileX(), player.getTileY())
        : null;
      const area = tileSpawn === 'water' ? mapConfig.area.water : mapConfig.area.land;

      this.scene.pushPhase(
        new BattlePhase(this.scene, {
          wild: wildInfo,
          area,
          time: DayNightFilter.getBattleTime(),
          locationLabel: mapConfig.key,
          onResolved: (reason) => {
            this.overworldUi?.resolveWildEncounter(wild, reason);
          },
        }),
      );
    };
    this.overworldUi.show();

    // this.scene.pushPhase(
    //   new RewardPhase(this.scene, {
    //     pokemon: {
    //       id: 1,
    //       pokedexId: '0006',
    //       level: 35,
    //       gender: 1,
    //       isShiny: false,
    //       nickname: null,
    //       nature: 'bold',
    //       ability: 'blaze',
    //       heldItemId: null,
    //       skills: [],
    //       boxNumber: 1,
    //       gridNumber: 1,
    //     },
    //     rewards: [
    //       { candyId: 'fire-candy', candyQuantity: 3 },
    //       { candyId: 'flying-candy', candyQuantity: 1 },
    //     ],
    //     onComplete: () => {},
    //   }),
    // );

    const socket = this.scene.getSocket();
    if (socket) {
      const onUserJoined = (payload: RoomUserState) => {
        this.overworldUi?.addOtherPlayer(payload);
      };
      const onUserLeft = (payload: { userId: string }) => {
        this.overworldUi?.removeOtherPlayer(payload.userId);
      };
      const onUsersMoved = (payload: UsersMovedPayload) => {
        const updates = payload?.updates;
        if (!Array.isArray(updates)) return;
        for (const u of updates) {
          this.overworldUi?.onOtherPlayerMoved(u);
        }
      };
      const onOtherPetChanged = (payload: OtherPetChangedPayload) => {
        this.overworldUi?.onOtherPetChanged(payload);
      };
      const onWildSpawn = (payload: WildSpawnPayload) => {
        this.overworldUi?.handleWildSpawn(payload);
      };
      const onWildDespawn = (payload: WildDespawnPayload) => {
        this.overworldUi?.handleWildDespawn(payload);
      };
      socket.on('user_joined', onUserJoined);
      socket.on('user_left', onUserLeft);
      socket.on('users_moved', onUsersMoved);
      socket.on('other-pet-change', onOtherPetChanged);
      socket.on('wild:spawn', onWildSpawn);
      socket.on('wild:despawn', onWildDespawn);
      this.socketOffFns.push(
        () => socket.off('user_joined', onUserJoined),
        () => socket.off('user_left', onUserLeft),
        () => socket.off('users_moved', onUsersMoved),
        () => socket.off('other-pet-change', onOtherPetChanged),
        () => socket.off('wild:spawn', onWildSpawn),
        () => socket.off('wild:despawn', onWildDespawn),
      );
    }

    let fadeInDone: Promise<void> | null = null;
    {
      const shouldFadeIn = this.scene.consumeFadeInOnOverworldEnter();
      const pipeline = this.scene.getFadeToBlackPipeline();
      if (pipeline) {
        if (shouldFadeIn) {
          pipeline.setProgress(1);
          fadeInDone = new Promise<void>((resolve) => {
            this.scene.tweens.add({
              targets: pipeline,
              progress: 0,
              duration: 300,
              ease: 'Linear',
              onComplete: () => resolve(),
            });
          });
        } else if (pipeline.progress > 0.01) {
          this.scene.tweens.add({
            targets: pipeline,
            progress: 0,
            duration: 300,
            ease: 'Linear',
          });
        }
      }
    }

    this.applyNewbieMode();
    this.scene.events.on(GameEvent.PROFILE_CHANGED, this.onProfileChanged);

    if (this.scene.consumePendingScreenFadeIn()) {
      await screenFadeIn(this.scene);
    }

    const safariGrant = this.scene.consumePendingSafariEntryBallGrant();
    if (safariGrant > 0) {
      await fadeInDone;
      await this.scene
        .getMessage('talk')
        .showMessage([i18next.t('safari:ballGranted', { count: safariGrant })], { name: '' });
    }

    const profile = this.scene.getUser()?.getProfile();
    if (location === 's000' && profile?.hasStarter) {
      const talk = this.scene.getMessage('talk');
      await talk.showMessage(
        [
          i18next.t('etc:s000_welcome_0'),
          i18next.t('etc:s000_welcome_1'),
          i18next.t('etc:s000_welcome_2'),
        ],
        { name: '' },
      );
      await this.runStarterTutorial();
    }
  }

  private async runStarterTutorial(): Promise<void> {
    const { width, height } = this.scene.cameras.main;
    const input = this.scene.getInputManager();
    const talk = this.scene.getMessage('talk');
    const depth = DEPTH.MESSAGE - 1;

    const tweenAsync = (config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> =>
      new Promise((resolve) => {
        this.scene.tweens.add({ ...config, onComplete: () => resolve() });
      });

    const overlay = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 1)
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(0.7);

    const icon = addImage(this.scene, TEXTURE.ICON_RUNNING, undefined, width / 2, height / 2)
      .setScale(8.6)
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(0);

    const guideWindow = addWindow(
      this.scene,
      TEXTURE.WINDOW_GUIDE,
      width / 2,
      height / 2 - 220,
      160,
      160,
      3,
      10,
      10,
      10,
      10,
    )
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(0);

    const guideText = addText(
      this.scene,
      width / 2,
      height / 2 - 220,
      'R',
      110,
      'bold',
      'center',
      TEXTSTYLE.BLACK,
      TEXTSHADOW.GRAY,
    )
      .setScrollFactor(0)
      .setDepth(depth)
      .setAlpha(0);

    const guidePointer = addSprite(this.scene, TEXTURE.SEL, 'sel-0', width / 2, height / 2 - 350)
      .setScale(3)
      .setScrollFactor(0)
      .setDepth(depth + 0.1)
      .setAlpha(0);
    guidePointer.play(ANIMATION.SEL);

    const pressText = addText(
      this.scene,
      guidePointer.x,
      guidePointer.y - 140,
      'PRESS!!',
      65,
      'bold',
      'center',
      TEXTSTYLE.YELLOW,
      TEXTSHADOW.GRAY,
    )
      .setScrollFactor(0)
      .setDepth(depth + 0.1)
      .setAlpha(0);

    guidePointer.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      (_anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
        if (frame.isFirst) pressText.setVisible(true);
        else if (frame.isLast) pressText.setVisible(false);
      },
    );

    const showGuide = async (
      texture: TEXTURE,
      key: string,
      message: string | string[],
    ): Promise<void> => {
      if (icon.texture.key !== texture) {
        input.setBlocked(true);
        await tweenAsync({ targets: icon, alpha: 0, duration: 250, ease: EASE.LINEAR });
        icon.setTexture(texture);
        guideText.setText(key);

        guidePointer.play(ANIMATION.SEL);
        await tweenAsync({ targets: icon, alpha: 1, duration: 250, ease: EASE.LINEAR });
        input.setBlocked(false);
      }
      await talk.showMessage(Array.isArray(message) ? message : [message], { name: '' });
    };

    input.setBlocked(true);
    await tweenAsync({ targets: overlay, alpha: 0.8, duration: 600, ease: EASE.LINEAR });
    await tweenAsync({
      targets: [icon, guideWindow, guideText, guidePointer, pressText],
      alpha: 1,
      duration: 300,
      ease: EASE.LINEAR,
    });
    input.setBlocked(false);

    await talk.showMessage([i18next.t('etc:s000_guide_running')], { name: '' });
    await showGuide(TEXTURE.ICON_MENU, 'S', [
      i18next.t('etc:s000_guide_menu_0'),
      i18next.t('etc:s000_guide_menu_1'),
    ]);
    await showGuide(TEXTURE.ICON_REGISTER, 'A', i18next.t('etc:s000_guide_register'));

    input.setBlocked(true);
    await tweenAsync({
      targets: [overlay, icon, guideWindow, guideText, guidePointer, pressText],
      alpha: 0,
      duration: 600,
      ease: EASE.LINEAR,
    });
    overlay.destroy();
    icon.destroy();
    guideWindow.destroy();
    guideText.destroy();
    guidePointer.destroy();
    pressText.destroy();
    input.setBlocked(false);
  }

  update(time: number, delta: number): void {
    this.overworldUi?.update(time, delta);
  }

  tickBackground(_time: number, delta: number): void {
    this.overworldUi?.getMapView()?.update(delta);
    this.overworldUi?.tickWildPokemons(delta);
    this.overworldUi?.tickBackgroundObjects(delta);
  }

  onResume(): void {
    this.overworldUi?.syncMenuToggleIcon(false);
    this.overworldUi?.syncMapToggleIcon(false);
    const mapConfig = this.scene.getMapRegistry().get(this.currentLocation);
    const effectiveBgm = resolveMapBgm(this.currentLocation, mapConfig?.bgm);
    if (effectiveBgm) {
      this.scene.getAudio().playBackground(effectiveBgm);
    }
  }

  exit(): void {
    this.scene.events.off(GameEvent.PROFILE_CHANGED, this.onProfileChanged);
    this.unsubscribePartyCry?.();
    this.unsubscribePartyCry = null;
    this.socketOffFns.forEach((fn) => fn());
    this.socketOffFns = [];
    this.overworldUi?.destroy();
    this.overworldUi = null;
  }

  onRefreshLanguage?(): void {
    this.overworldUi?.onRefreshLanguage();
  }
}
