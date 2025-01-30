import { npcsInfo } from '../data/npc';
import { pokemons } from '../data/pokemon';
import { ANIMATION } from '../enums/animation';
import { MODE } from '../enums/mode';
import { TEXTURE } from '../enums/texture';
import { KeyboardManager, MessageManager, ModeManager, OverworldManager, PlayerInfoManager, PlayerItemManager, PlayerPokemonManager } from '../managers';
import { createSpriteAnimation, getSpriteFrames } from '../ui/ui';
import { BaseScene } from './base-scene';

export class InGameScene extends BaseScene {
  private modeManager!: ModeManager;
  public ui!: Phaser.GameObjects.Container;

  constructor() {
    super('InGameScene');
  }

  create() {
    this.initAnimation();

    this.ui = this.add.container(0, 0);
    this.add.existing(this.ui);
    this.ui.setScale(2);

    this.modeManager = new ModeManager(this);

    const messageManager = MessageManager.getInstance();
    messageManager.initialize(this);

    const keyboardMananger = KeyboardManager.getInstance();
    keyboardMananger.initialize(this);

    const playerInfoManager = PlayerInfoManager.getInstance();
    playerInfoManager.init();

    const playerPokemonManager = PlayerPokemonManager.getInstance();
    playerPokemonManager.init();

    const playerItemManager = PlayerItemManager.getInstance();
    playerItemManager.init();

    const overworldManager = OverworldManager.getInstance();
    overworldManager.init();

    this.modeManager.registerModes();
    this.modeManager.changeMode(MODE.NONE);
  }

  update(time: number, delta: number): void {
    if (this.modeManager.isOverworldMode()) {
      this.modeManager.getCurrentMode().update(time, delta);
    }
  }

  private initAnimation() {
    createSpriteAnimation(this, TEXTURE.POKEMON_CALL, ANIMATION.POKEMON_CALL);
    createSpriteAnimation(this, TEXTURE.POKEMON_RECALL, ANIMATION.POKEMON_RECALL);

    createSpriteAnimation(this, TEXTURE.BAG1, ANIMATION.BAG1);
    createSpriteAnimation(this, TEXTURE.BAG2, ANIMATION.BAG2);
    createSpriteAnimation(this, TEXTURE.BAG3, ANIMATION.BAG3);
    createSpriteAnimation(this, TEXTURE.BAG4, ANIMATION.BAG4);

    createSpriteAnimation(this, TEXTURE.PAUSE_BLACK, ANIMATION.PAUSE_BLACK);
    createSpriteAnimation(this, TEXTURE.PAUSE_WHITE, ANIMATION.PAUSE_WHITE);

    createSpriteAnimation(this, TEXTURE.EMOTION_0, ANIMATION.EMOTION_0);

    this.initPlayerAnimation();
    this.initPokemonAnimation();
  }

  private initNpcAnimation() {
    for (const key of Object.keys(npcsInfo)) {
      const movementFrames = getSpriteFrames(this, `${key}`, ANIMATION.NPC_MOVEMENT);

      const up = [movementFrames[12], movementFrames[13], movementFrames[14], movementFrames[15]];
      const down = [movementFrames[0], movementFrames[1], movementFrames[2], movementFrames[3]];
      const left = [movementFrames[4], movementFrames[5], movementFrames[6], movementFrames[7]];
      const right = [movementFrames[8], movementFrames[9], movementFrames[10], movementFrames[11]];

      createSpriteAnimation(this, `npc${key}`, `npc${key}_up`, up);
      createSpriteAnimation(this, `npc${key}`, `npc${key}_down`, down);
      createSpriteAnimation(this, `npc${key}`, `npc${key}_left`, left);
      createSpriteAnimation(this, `npc${key}`, `npc${key}_right`, right);
    }
  }

  private initPokemonAnimation() {
    for (const pokemon of pokemons.keys()) {
      const movementFrames = getSpriteFrames(this, `pokemon_overworld${pokemon}`, ANIMATION.POKEMON_OVERWORLD);
      const movementShinyFrames = getSpriteFrames(this, `pokemon_overworld${pokemon}s`, ANIMATION.POKEMON_OVERWORLD);

      const up = [movementFrames[12], movementFrames[13], movementFrames[14], movementFrames[15]];
      const down = [movementFrames[0], movementFrames[1], movementFrames[2], movementFrames[3]];
      const left = [movementFrames[4], movementFrames[5], movementFrames[6], movementFrames[7]];
      const right = [movementFrames[8], movementFrames[9], movementFrames[10], movementFrames[11]];

      createSpriteAnimation(this, `pokemon_overworld${pokemon}`, `pokemon_overworld${pokemon}_up`, up);
      createSpriteAnimation(this, `pokemon_overworld${pokemon}`, `pokemon_overworld${pokemon}_down`, down);
      createSpriteAnimation(this, `pokemon_overworld${pokemon}`, `pokemon_overworld${pokemon}_left`, left);
      createSpriteAnimation(this, `pokemon_overworld${pokemon}`, `pokemon_overworld${pokemon}_right`, right);

      const upS = [movementShinyFrames[12], movementShinyFrames[13], movementShinyFrames[14], movementShinyFrames[15]];
      const downS = [movementShinyFrames[0], movementShinyFrames[1], movementShinyFrames[2], movementShinyFrames[3]];
      const leftS = [movementShinyFrames[4], movementShinyFrames[5], movementShinyFrames[6], movementShinyFrames[7]];
      const rightS = [movementShinyFrames[8], movementShinyFrames[9], movementShinyFrames[10], movementShinyFrames[11]];

      createSpriteAnimation(this, `pokemon_overworld${pokemon}s`, `pokemon_overworld${pokemon}s_up`, upS);
      createSpriteAnimation(this, `pokemon_overworld${pokemon}s`, `pokemon_overworld${pokemon}s_down`, downS);
      createSpriteAnimation(this, `pokemon_overworld${pokemon}s`, `pokemon_overworld${pokemon}s_left`, leftS);
      createSpriteAnimation(this, `pokemon_overworld${pokemon}s`, `pokemon_overworld${pokemon}s_right`, rightS);
    }
  }

  private initPlayerAnimation() {
    for (let i = 1; i <= 4; i++) {
      const boyMovementTexture = `boy_${i}_movement`;
      const boyRideTexture = `boy_${i}_ride`;

      const girlMovementTexture = `girl_${i}_movement`;
      const girlRideTexture = `girl_${i}_ride`;

      const movementFramesB = getSpriteFrames(this, boyMovementTexture, ANIMATION.PLAYER_MOVEMENT);
      const rideFramesB = getSpriteFrames(this, boyRideTexture, ANIMATION.PLAYER_RIDE);

      const movementFramesG = getSpriteFrames(this, girlMovementTexture, ANIMATION.PLAYER_MOVEMENT);
      const rideFramesG = getSpriteFrames(this, girlRideTexture, ANIMATION.PLAYER_RIDE);

      //boy
      const walkUpB = [
        [movementFramesB[1], movementFramesB[0]],
        [movementFramesB[2], movementFramesB[0]],
      ];

      const walkDownB = [
        [movementFramesB[4], movementFramesB[3]],
        [movementFramesB[5], movementFramesB[3]],
      ];

      const walkLeftB = [
        [movementFramesB[7], movementFramesB[6]],
        [movementFramesB[8], movementFramesB[6]],
      ];

      const walkRightB = [
        [movementFramesB[10], movementFramesB[9]],
        [movementFramesB[11], movementFramesB[9]],
      ];

      const runUpB = [
        [movementFramesB[14], movementFramesB[12]],
        [movementFramesB[13], movementFramesB[12]],
        [movementFramesB[12], movementFramesB[12]],
      ];

      const runDownB = [
        [movementFramesB[16], movementFramesB[15]],
        [movementFramesB[17], movementFramesB[15]],
        [movementFramesB[15], movementFramesB[15]],
      ];

      const runLeftB = [
        [movementFramesB[19], movementFramesB[18]],
        [movementFramesB[20], movementFramesB[18]],
        [movementFramesB[18], movementFramesB[18]],
      ];

      const runRightB = [
        [movementFramesB[22], movementFramesB[21]],
        [movementFramesB[23], movementFramesB[21]],
        [movementFramesB[21], movementFramesB[21]],
      ];

      const rideUpB = [
        [rideFramesB[1], rideFramesB[0]],
        [rideFramesB[0], rideFramesB[0]],
        [rideFramesB[0], rideFramesB[0]],
        [rideFramesB[2], rideFramesB[0]],
        [rideFramesB[0], rideFramesB[0]],
        [rideFramesB[0], rideFramesB[0]],
      ];

      const rideDownB = [
        [rideFramesB[4], rideFramesB[3]],
        [rideFramesB[3], rideFramesB[3]],
        [rideFramesB[3], rideFramesB[3]],
        [rideFramesB[5], rideFramesB[3]],
        [rideFramesB[3], rideFramesB[3]],
        [rideFramesB[3], rideFramesB[3]],
      ];

      const rideLeftB = [
        [rideFramesB[7], rideFramesB[6]],
        [rideFramesB[6], rideFramesB[6]],
        [rideFramesB[6], rideFramesB[6]],
        [rideFramesB[8], rideFramesB[6]],
        [rideFramesB[6], rideFramesB[6]],
        [rideFramesB[6], rideFramesB[6]],
      ];

      const rideRightB = [
        [rideFramesB[10], rideFramesB[9]],
        [rideFramesB[9], rideFramesB[9]],
        [rideFramesB[9], rideFramesB[9]],
        [rideFramesB[11], rideFramesB[9]],
        [rideFramesB[9], rideFramesB[9]],
        [rideFramesB[9], rideFramesB[9]],
      ];

      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_walk_up_1`, walkUpB[0]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_walk_up_2`, walkUpB[1]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_walk_down_1`, walkDownB[0]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_walk_down_2`, walkDownB[1]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_walk_left_1`, walkLeftB[0]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_walk_left_2`, walkLeftB[1]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_walk_right_1`, walkRightB[0]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_walk_right_2`, walkRightB[1]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_up_1`, runUpB[0]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_up_2`, runUpB[1]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_up_3`, runUpB[2]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_down_1`, runDownB[0]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_down_2`, runDownB[1]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_down_3`, runDownB[2]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_left_1`, runLeftB[0]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_left_2`, runLeftB[1]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_left_3`, runLeftB[2]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_right_1`, runRightB[0]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_right_2`, runRightB[1]);
      createSpriteAnimation(this, boyMovementTexture, `${boyMovementTexture}_run_right_3`, runRightB[2]);

      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_up_1`, rideUpB[0]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_up_2`, rideUpB[1]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_up_3`, rideUpB[2]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_up_4`, rideUpB[3]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_up_5`, rideUpB[4]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_up_6`, rideUpB[5]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_down_1`, rideDownB[0]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_down_2`, rideDownB[1]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_down_3`, rideDownB[2]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_down_4`, rideDownB[3]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_down_5`, rideDownB[4]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_down_6`, rideDownB[5]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_left_1`, rideLeftB[0]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_left_2`, rideLeftB[1]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_left_3`, rideLeftB[2]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_left_4`, rideLeftB[3]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_left_5`, rideLeftB[4]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_left_6`, rideLeftB[5]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_right_1`, rideRightB[0]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_right_2`, rideRightB[1]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_right_3`, rideRightB[2]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_right_4`, rideRightB[3]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_right_5`, rideRightB[4]);
      createSpriteAnimation(this, boyRideTexture, `${boyRideTexture}_right_6`, rideRightB[5]);

      //girl
      const walkUpG = [
        [movementFramesG[1], movementFramesG[0]],
        [movementFramesG[2], movementFramesG[0]],
      ];

      const walkDownG = [
        [movementFramesG[4], movementFramesG[3]],
        [movementFramesG[5], movementFramesG[3]],
      ];

      const walkLeftG = [
        [movementFramesG[7], movementFramesG[6]],
        [movementFramesG[8], movementFramesG[6]],
      ];

      const walkRightG = [
        [movementFramesG[10], movementFramesG[9]],
        [movementFramesG[11], movementFramesG[9]],
      ];

      const runUpG = [
        [movementFramesG[14], movementFramesG[12]],
        [movementFramesG[13], movementFramesG[12]],
        [movementFramesG[12], movementFramesG[12]],
      ];

      const runDownG = [
        [movementFramesG[16], movementFramesG[15]],
        [movementFramesG[17], movementFramesG[15]],
        [movementFramesG[15], movementFramesG[15]],
      ];

      const runLeftG = [
        [movementFramesG[19], movementFramesG[18]],
        [movementFramesG[20], movementFramesG[18]],
        [movementFramesG[18], movementFramesG[18]],
      ];

      const runRightG = [
        [movementFramesG[22], movementFramesG[21]],
        [movementFramesG[23], movementFramesG[21]],
        [movementFramesG[21], movementFramesG[21]],
      ];

      const rideUpG = [
        [rideFramesG[1], rideFramesG[0]],
        [rideFramesG[0], rideFramesG[0]],
        [rideFramesG[0], rideFramesG[0]],
        [rideFramesG[2], rideFramesG[0]],
        [rideFramesG[0], rideFramesG[0]],
        [rideFramesG[0], rideFramesG[0]],
      ];

      const rideDownG = [
        [rideFramesG[4], rideFramesG[3]],
        [rideFramesG[3], rideFramesG[3]],
        [rideFramesG[3], rideFramesG[3]],
        [rideFramesG[5], rideFramesG[3]],
        [rideFramesG[3], rideFramesG[3]],
        [rideFramesG[3], rideFramesG[3]],
      ];

      const rideLeftG = [
        [rideFramesG[7], rideFramesG[6]],
        [rideFramesG[6], rideFramesG[6]],
        [rideFramesG[6], rideFramesG[6]],
        [rideFramesG[8], rideFramesG[6]],
        [rideFramesG[6], rideFramesG[6]],
        [rideFramesG[6], rideFramesG[6]],
      ];

      const rideRightG = [
        [rideFramesG[10], rideFramesG[9]],
        [rideFramesG[9], rideFramesG[9]],
        [rideFramesG[9], rideFramesG[9]],
        [rideFramesG[11], rideFramesG[9]],
        [rideFramesG[9], rideFramesG[9]],
        [rideFramesG[9], rideFramesG[9]],
      ];

      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_walk_up_1`, walkUpG[0]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_walk_up_2`, walkUpG[1]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_walk_down_1`, walkDownG[0]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_walk_down_2`, walkDownG[1]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_walk_left_1`, walkLeftG[0]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_walk_left_2`, walkLeftG[1]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_walk_right_1`, walkRightG[0]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_walk_right_2`, walkRightG[1]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_up_1`, runUpG[0]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_up_2`, runUpG[1]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_up_3`, runUpG[2]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_down_1`, runDownG[0]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_down_2`, runDownG[1]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_down_3`, runDownG[2]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_left_1`, runLeftG[0]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_left_2`, runLeftG[1]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_left_3`, runLeftG[2]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_right_1`, runRightG[0]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_right_2`, runRightG[1]);
      createSpriteAnimation(this, girlMovementTexture, `${girlMovementTexture}_run_right_3`, runRightG[2]);

      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_up_1`, rideUpG[0]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_up_2`, rideUpG[1]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_up_3`, rideUpG[2]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_up_4`, rideUpG[3]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_up_5`, rideUpG[4]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_up_6`, rideUpG[5]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_down_1`, rideDownG[0]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_down_2`, rideDownG[1]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_down_3`, rideDownG[2]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_down_4`, rideDownG[3]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_down_5`, rideDownG[4]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_down_6`, rideDownG[5]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_left_1`, rideLeftG[0]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_left_2`, rideLeftG[1]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_left_3`, rideLeftG[2]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_left_4`, rideLeftG[3]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_left_5`, rideLeftG[4]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_left_6`, rideLeftG[5]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_right_1`, rideRightG[0]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_right_2`, rideRightG[1]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_right_3`, rideRightG[2]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_right_4`, rideRightG[3]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_right_5`, rideRightG[4]);
      createSpriteAnimation(this, girlRideTexture, `${girlRideTexture}_right_6`, rideRightG[5]);
    }
  }
}
