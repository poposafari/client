import { pokemonCryNames } from '@poposafari/core/master.data.ts';
import type { NpcConfig, ReactionStep } from '@poposafari/core/map.registry';
import { GameScene } from '@poposafari/scenes';
import { getPokemonTexture } from '@poposafari/utils';
import { DIRECTION } from '../overworld.constants';
import { MovingNpcObject } from './moving-npc.object';
import type { IOverworldBlockingRef, IOverworldMapAdapter } from './movable.object';

const POKEMON_NPC_SCALE = 1.4;

export class PokemonNpcObject extends MovingNpcObject {
  private readonly pokedexId: string;
  private readonly frameBase: string;
  private cryActive = false;

  constructor(
    scene: GameScene,
    config: NpcConfig,
    mapAdapter: IOverworldMapAdapter | null,
    blockingRefs?: IOverworldBlockingRef[],
  ) {
    if (!config.pokedexId) {
      throw new Error(`PokemonNpc requires config.pokedexId (npc key='${config.key}')`);
    }
    const { key, frame } = getPokemonTexture('overworld', config.pokedexId, {
      isShiny: !!config.isShiny,
    });

    super(scene, key, config.x, config.y, config.name, config.direction, {
      mapAdapter,
      blockingRefs,
      path: config.path,
      scale: POKEMON_NPC_SCALE,
    });

    this.pokedexId = config.pokedexId;
    this.frameBase = frame;
    // path 유무와 관계없이 walk anim을 무한 재생 — 경로 없으면 제자리 애니, 경로 있으면 step 사이에도 anim 유지.
    this.lookAt(config.direction);
  }

  protected override getWalkAnimationKey(direction: DIRECTION): string {
    return `pokemon.overworld.${this.frameBase}.${direction}`;
  }

  protected override onBeforeStepStart(direction: DIRECTION): void {
    this.lastDirection = direction;
    const animKey = this.getWalkAnimationKey(direction);
    this.startSpriteAnimation(animKey);
  }

  override lookAt(direction: DIRECTION): void {
    this.lastDirection = direction;
    const animKey = this.getWalkAnimationKey(direction);
    if (!this.scene.anims.exists(animKey)) return;
    this.startSpriteAnimation(animKey);
  }

  override reaction(direction: DIRECTION): ReactionStep[] {
    this.lookAt(this.oppositeDirection(direction));
    this.playCry();
    return [];
  }

  private playCry(): void {
    if (this.cryActive) return;
    const cryKey = pokemonCryNames.includes(this.pokedexId)
      ? this.pokedexId
      : this.pokedexId.split('_')[0];
    if (!pokemonCryNames.includes(cryKey)) return;
    this.cryActive = true;
    void this.scene
      .getAudio()
      .playEffectAwaitable(cryKey)
      .finally(() => {
        this.cryActive = false;
      });
  }
}
