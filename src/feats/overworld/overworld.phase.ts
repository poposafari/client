import { IGamePhase } from '@poposafari/core';
import { GameScene } from '@poposafari/scenes';
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
import { StartingPhase } from '../starting/starting.phase';
import { MartPhase } from '../mart';
import { MartNpcObject } from './objects/special-npc.object';
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
      this.scene.pushPhase(new OverworldMenuPhase(this.scene, this.overworldUi));
    };
    this.overworldUi.onRegisteredItemsRequested = () => {
      if (!this.overworldUi) return;
      this.scene.pushPhase(new RegisteredItemsPhase(this.scene, this.overworldUi));
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
      } else if (phaseKey === 'mart' && _object instanceof MartNpcObject) {
        this.scene.pushPhase(
          new MartPhase(this.scene, _object.getMartItems(), _object.getNpcKey()),
        );
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
    this.overworldUi?.tickBackgroundObjects(delta);
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
