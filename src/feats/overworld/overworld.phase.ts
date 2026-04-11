import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
import type { RoomUserState, UsersMovedPayload } from './overworld-socket.types';
import { OverworldMenuPhase } from './overworld-menu.phase';
import { OverworldUi } from './overworld.ui';
import { SafariPhase } from '../safari/safari.phase';
import { StartingPhase } from '../starting/starting.phase';
import { BattlePhase } from '../battle';
import { RewardPhase } from '../battle/reward/reward.phase';
import DayNightFilter from '@poposafari/utils/day-night-filter';

export class OverworldPhase implements IGamePhase {
  private overworldUi: OverworldUi | null = null;
  private socketOffFns: Array<() => void> = [];

  constructor(private scene: GameScene) {}

  async enter(): Promise<void> {
    const mapRegistry = this.scene.getMapRegistry();
    const location = this.scene.getUser()?.getProfile()?.lastLocation?.map ?? 'p003';
    const mapConfig = mapRegistry.get(location);

    if (!mapConfig) {
      throw new Error(`Map not found: ${location}`);
    }

    const mapView = this.scene.getMapBuilder().build(mapConfig);
    this.overworldUi = new OverworldUi(this.scene);
    this.overworldUi.setMapView(mapView);
    this.overworldUi.setMapConfig(mapConfig);
    this.overworldUi.onMenuRequested = () => {
      this.scene.pushPhase(new OverworldMenuPhase(this.scene));
    };
    this.overworldUi.onInteractivePhaseRequested = (_object, phaseKey) => {
      if (phaseKey === 'professor') {
        if (!this.scene.getUser()?.getProfile().hasStarter) {
          this.scene.pushPhase(new StartingPhase(this.scene));
        } else {
          console.log('너 뉴비 아닌데? ');
        }
      } else if (phaseKey === 'safari') {
        this.scene.pushPhase(new SafariPhase(this.scene));
      }
    };
    this.overworldUi.onWildEncounterRequested = (wild) => {
      const wildInfo = wild.getWild();
      // v1: area/time 매핑이 없으므로 기본값 사용 (Step 5 polish 항목).
      // mapConfig.area 가 's001'/'s002' 라 battle bg 매트릭스(field/forest/...)와 키가 다르다.
      this.scene.pushPhase(
        new BattlePhase(this.scene, {
          wild: wildInfo,
          area: this.scene.getMasterData().getMapArea(mapConfig.key),
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
      socket.on('user_joined', onUserJoined);
      socket.on('user_left', onUserLeft);
      socket.on('users_moved', onUsersMoved);
      this.socketOffFns.push(
        () => socket.off('user_joined', onUserJoined),
        () => socket.off('user_left', onUserLeft),
        () => socket.off('users_moved', onUsersMoved),
      );
    }

    if (this.scene.consumeFadeInOnOverworldEnter()) {
      const pipeline = this.scene.getFadeToBlackPipeline();
      if (pipeline) {
        pipeline.setProgress(1);
        this.scene.tweens.add({
          targets: pipeline,
          progress: 0,
          duration: 300,
          ease: 'Linear',
        });
      }
    }
  }

  update(time: number, delta: number): void {
    this.overworldUi?.update(time, delta);
  }

  tickBackground(_time: number, delta: number): void {
    this.overworldUi?.tickWildPokemons(delta);
  }

  onResume(): void {
    this.overworldUi?.syncMenuToggleIcon(false);
  }

  exit(): void {
    this.socketOffFns.forEach((fn) => fn());
    this.socketOffFns = [];
    this.overworldUi?.destroy();
    this.overworldUi = null;
  }

  onRefreshLanguage?(): void {
    this.overworldUi?.onRefreshLanguage();
  }
}
