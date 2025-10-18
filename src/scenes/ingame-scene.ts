import { GM } from '../core/game-manager';
import { npcData, PokemonData } from '../data';
import { ANIMATION, MODE, TEXTURE, UI } from '../enums';
import { KeyboardHandler } from '../handlers/keyboard-handler';
import { BagStorage, OverworldStorage } from '../storage';
import { AccountDeleteRestoreUi } from '../uis/account-delete-restore-ui';
import { AccountDeleteUi } from '../uis/account-delete-ui';
import { BagUi } from '../uis/bag-ui';
import { BattleUi } from '../uis/battle-ui';
import { BlackScreenUi } from '../uis/black-screen-ui';
import { ConnectUi } from '../uis/connect-ui';
import { LoginUi } from '../uis/login-ui';
import { NewgameUi } from '../uis/newgame-ui';
import { OptionUi } from '../uis/option-ui';
import { Plaza001, Plaza002, Plaza003, Plaza004, Plaza005, Safari000 } from '../uis/overworld';
import { OverworldHUDUi } from '../uis/overworld-hud-ui';
import { OverworldMenuUi } from '../uis/overworld-menu-ui';
import { OverworldUi } from '../uis/overworld-ui';
import { PcUi } from '../uis/pc-ui';
import { QuickSlotItemUi } from '../uis/quick-slot-item-ui';
import { RegisterUi } from '../uis/register-ui';
import { StarterPokemonUi } from '../uis/starter-pokemon-ui';
import { StarterUi } from '../uis/starter-ui';
import { TitleUi } from '../uis/title-ui';
import { createSpriteAnimation, getSpriteFrames } from '../uis/ui';
import { WelcomeUi } from '../uis/welcome-ui';
import { createZeroPad } from '../utils/string-util';
import WipeRightToLeftShader from '../utils/wipe-rl-shader';
import { BaseScene } from './base-scene';

export class InGameScene extends BaseScene {
  // private uiHandler = new UiHandler();
  // private modeHandler = new ModeHandler();

  constructor() {
    super('InGameScene');
  }

  create() {
    const overworldUi = new OverworldUi(this);
    this.initAnimation();
    this.initAudio();
    BagStorage.getInstance();

    const keyboard = KeyboardHandler.getInstance();
    keyboard.init(this);

    GM.registerUi(UI.CONNECT, new ConnectUi(this));
    GM.registerUi(UI.LOGIN, new LoginUi(this));
    GM.registerUi(UI.REGISTER, new RegisterUi(this));
    GM.registerUi(UI.ACCOUNT_DELETE, new AccountDeleteUi(this));
    GM.registerUi(UI.ACCOUNT_DELETE_RESTORE, new AccountDeleteRestoreUi(this));
    GM.registerUi(UI.TITLE, new TitleUi(this));
    GM.registerUi(UI.NEWGAME, new NewgameUi(this));
    GM.registerUi(UI.WELCOME, new WelcomeUi(this));
    GM.registerUi(UI.STARTER, new StarterUi(this));
    GM.registerUi(UI.OVERWORLD_MENU, new OverworldMenuUi(this));
    GM.registerUi(UI.OVERWORLD_HUD, new OverworldHUDUi(this));
    GM.registerUi(UI.BAG, new BagUi(this));
    GM.registerUi(UI.PC, new PcUi(this));
    GM.registerUi(UI.OPTION, new OptionUi(this));
    GM.registerUi(UI.BLACK_SCREEN, new BlackScreenUi(this));
    GM.registerUi(UI.BATTLE, new BattleUi(this));
    GM.registerUi(UI.QUICK_SLOT_ITEM, new QuickSlotItemUi(this));
    GM.registerUi(UI.OVERWORLD, overworldUi);

    const overworldInfo = OverworldStorage.getInstance();
    //plaza
    overworldInfo.registerMap(TEXTURE.PLAZA_001, new Plaza001(overworldUi, TEXTURE.PLAZA_001));
    overworldInfo.registerMap(TEXTURE.PLAZA_002, new Plaza002(overworldUi, TEXTURE.PLAZA_002));
    overworldInfo.registerMap(TEXTURE.PLAZA_003, new Plaza003(overworldUi, TEXTURE.PLAZA_003));
    overworldInfo.registerMap(TEXTURE.PLAZA_004, new Plaza004(overworldUi, TEXTURE.PLAZA_004));
    overworldInfo.registerMap(TEXTURE.PLAZA_005, new Plaza005(overworldUi, TEXTURE.PLAZA_005));

    //safari
    overworldInfo.registerMap(TEXTURE.SAFARI_000, new Safari000(overworldUi, TEXTURE.SAFARI_000));

    GM.changeMode(MODE.AUTO_LOGIN);
  }

  update(time: number, delta: number): void {
    const overworldUi = GM.findUiOnStack(UI.OVERWORLD);

    if (overworldUi && overworldUi instanceof OverworldUi) {
      overworldUi.update(time, delta);
    }
  }

  private initAnimation() {
    createSpriteAnimation(this, TEXTURE.POKEMON_CALL, ANIMATION.POKEMON_CALL);
    createSpriteAnimation(this, TEXTURE.POKEMON_RECALL, ANIMATION.POKEMON_RECALL);

    createSpriteAnimation(this, TEXTURE.BAG_POCKET_BALL, ANIMATION.BAG_POCKET_BALL);
    createSpriteAnimation(this, TEXTURE.BAG_POCKET_ETC, ANIMATION.BAG_POCKET_ETC);
    createSpriteAnimation(this, TEXTURE.BAG_POCKET_BERRY, ANIMATION.BAG_POCKET_BERRY);
    createSpriteAnimation(this, TEXTURE.BAG_POCKET_KEY, ANIMATION.BAG_POCKET_KEY);

    createSpriteAnimation(this, TEXTURE.PAUSE_B, ANIMATION.PAUSE_B);
    createSpriteAnimation(this, TEXTURE.PAUSE_W, ANIMATION.PAUSE_W);

    createSpriteAnimation(this, TEXTURE.BOY_1_BACK, ANIMATION.BOY_1_BACK);
    createSpriteAnimation(this, TEXTURE.BOY_2_BACK, ANIMATION.BOY_2_BACK);
    createSpriteAnimation(this, TEXTURE.BOY_3_BACK, ANIMATION.BOY_3_BACK);
    createSpriteAnimation(this, TEXTURE.BOY_4_BACK, ANIMATION.BOY_4_BACK);

    createSpriteAnimation(this, TEXTURE.GIRL_1_BACK, ANIMATION.GIRL_1_BACK);
    createSpriteAnimation(this, TEXTURE.GIRL_2_BACK, ANIMATION.GIRL_2_BACK);
    createSpriteAnimation(this, TEXTURE.GIRL_3_BACK, ANIMATION.GIRL_3_BACK);
    createSpriteAnimation(this, TEXTURE.GIRL_4_BACK, ANIMATION.GIRL_4_BACK);

    createSpriteAnimation(this, TEXTURE.OVERWORLD_SHINY, ANIMATION.OVERWORLD_SHINY);
    createSpriteAnimation(this, TEXTURE.EMO, ANIMATION.EMO);
    createSpriteAnimation(this, TEXTURE.SPARKLE, ANIMATION.SPARKLE);

    createSpriteAnimation(this, TEXTURE.OVERWORLD_SHADOW, ANIMATION.OVERWORLD_SHADOW);
    createSpriteAnimation(this, TEXTURE.OVERWORLD_SHADOW_WATER, ANIMATION.OVERWORLD_SHADOW_WATER);

    createSpriteAnimation(this, TEXTURE.PARTICLE_ENTER_BALL, ANIMATION.PARTICLE_ENTER_BALL);

    createSpriteAnimation(this, TEXTURE.GROUND_ITEM, ANIMATION.GROUND_ITEM);

    createSpriteAnimation(this, TEXTURE.TUTORIAL_CHOICE_BALL, ANIMATION.TUTORIAL_CHOICE_BALL);
    createSpriteAnimation(this, TEXTURE.TUTORIAL_CHOICE_FINGER, ANIMATION.TUTORIAL_CHOICE_FINGER);

    this.initDoorAnimation();

    // this.initNpcAnimation();
    this.initPlayerAnimation();
    this.initPokemonAnimation();
    this.initBattleBallAnimation();
    this.initEmotionAnimation();
    this.initSurfAnimation();
    this.initShader();
  }

  private initDoorAnimation() {
    for (let i = 1; i <= 22; i++) {
      const frames = getSpriteFrames(this, `door_${i}`, `door`);

      createSpriteAnimation(this, `door_${i}`, `door_${i}`, frames);
    }
  }

  private initEmotionAnimation() {
    const texture = getSpriteFrames(this, TEXTURE.EMO, ANIMATION.EMO);
    const line = 4;
    for (let i = 1; i <= 4; i++) {
      const emotionTexture = `emo_${i - 1}`;
      const emo = [[texture[line * (i - 1) + 0], texture[line * (i - 1) + 1], texture[line * (i - 1) + 2], texture[line * (i - 1) + 3]]];

      createSpriteAnimation(this, emotionTexture, emotionTexture, emo[0]);
    }
  }

  private initNpcAnimation() {
    for (const key of Object.keys(npcData)) {
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
    const movementFrames = getSpriteFrames(this, `pokemon_overworld000`, ANIMATION.POKEMON_OVERWORLD);

    const upD = [movementFrames[12], movementFrames[13], movementFrames[14], movementFrames[15]];
    const downD = [movementFrames[0], movementFrames[1], movementFrames[2], movementFrames[3]];
    const leftD = [movementFrames[4], movementFrames[5], movementFrames[6], movementFrames[7]];
    const rightD = [movementFrames[8], movementFrames[9], movementFrames[10], movementFrames[11]];

    createSpriteAnimation(this, `pokemon_overworld000`, `pokemon_overworld000_up`, upD);
    createSpriteAnimation(this, `pokemon_overworld000`, `pokemon_overworld000_down`, downD);
    createSpriteAnimation(this, `pokemon_overworld000`, `pokemon_overworld000_left`, leftD);
    createSpriteAnimation(this, `pokemon_overworld000`, `pokemon_overworld000_right`, rightD);

    for (const pokemon of Object.keys(PokemonData)) {
      const pokedex = createZeroPad(Number(pokemon));
      const movementFrames = getSpriteFrames(this, `pokemon_overworld${pokedex}`, ANIMATION.POKEMON_OVERWORLD);
      const movementShinyFrames = getSpriteFrames(this, `pokemon_overworld${pokedex}s`, ANIMATION.POKEMON_OVERWORLD);

      const up = [movementFrames[12], movementFrames[13], movementFrames[14], movementFrames[15]];
      const down = [movementFrames[0], movementFrames[1], movementFrames[2], movementFrames[3]];
      const left = [movementFrames[4], movementFrames[5], movementFrames[6], movementFrames[7]];
      const right = [movementFrames[8], movementFrames[9], movementFrames[10], movementFrames[11]];

      createSpriteAnimation(this, `pokemon_overworld${pokedex}`, `pokemon_overworld${pokedex}_up`, up);
      createSpriteAnimation(this, `pokemon_overworld${pokedex}`, `pokemon_overworld${pokedex}_down`, down);
      createSpriteAnimation(this, `pokemon_overworld${pokedex}`, `pokemon_overworld${pokedex}_left`, left);
      createSpriteAnimation(this, `pokemon_overworld${pokedex}`, `pokemon_overworld${pokedex}_right`, right);

      const upS = [movementShinyFrames[12], movementShinyFrames[13], movementShinyFrames[14], movementShinyFrames[15]];
      const downS = [movementShinyFrames[0], movementShinyFrames[1], movementShinyFrames[2], movementShinyFrames[3]];
      const leftS = [movementShinyFrames[4], movementShinyFrames[5], movementShinyFrames[6], movementShinyFrames[7]];
      const rightS = [movementShinyFrames[8], movementShinyFrames[9], movementShinyFrames[10], movementShinyFrames[11]];

      createSpriteAnimation(this, `pokemon_overworld${pokedex}s`, `pokemon_overworld${pokedex}s_up`, upS);
      createSpriteAnimation(this, `pokemon_overworld${pokedex}s`, `pokemon_overworld${pokedex}s_down`, downS);
      createSpriteAnimation(this, `pokemon_overworld${pokedex}s`, `pokemon_overworld${pokedex}s_left`, leftS);
      createSpriteAnimation(this, `pokemon_overworld${pokedex}s`, `pokemon_overworld${pokedex}s_right`, rightS);
    }
  }

  // private initPokeballAnimation() {
  //   const texture = getSpriteFrames(this, TEXTURE.POKEBALL, ANIMATION.POKEBALL);
  //   const line = 10;
  //   for (let i = 1; i <= 4; i++) {
  //     const pokeballLaunchTexture = `00${i}_launch`;
  //     const pokeballEnterTexture = `00${i}_enter`;
  //     const pokeballDropTexture = `00${i}_drop`;
  //     const pokeballExitTexture = `00${i}_exit`;
  //     const pokeballShake = `00${i}_shake`;

  //     const launch = [
  //       [
  //         texture[line * (i - 1) + 0],
  //         texture[line * (i - 1) + 1],
  //         texture[line * (i - 1) + 2],
  //         texture[line * (i - 1) + 3],
  //         texture[line * (i - 1) + 4],
  //         texture[line * (i - 1) + 5],
  //         texture[line * (i - 1) + 6],
  //         texture[line * (i - 1) + 7],
  //         texture[line * (i - 1) + 8],
  //       ],
  //     ];
  //     const enter = [[texture[line * (i - 1) + 8], texture[line * (i - 1) + 8], texture[line * (i - 1) + 9]]];
  //     const drop = [[texture[line * (i - 1) + 0], texture[line * (i - 1) + 0]]];
  //     const exit = [[texture[line * (i - 1) + 0], texture[line * (i - 1) + 8], texture[line * (i - 1) + 9]]];
  //     const shake = [[texture[line * (i - 1) + 0], texture[line * (i - 1) + 0]]];

  //     createSpriteAnimation(this, pokeballLaunchTexture, pokeballLaunchTexture, launch[0]);
  //     createSpriteAnimation(this, pokeballEnterTexture, pokeballEnterTexture, enter[0]);
  //     createSpriteAnimation(this, pokeballDropTexture, pokeballDropTexture, drop[0]);
  //     createSpriteAnimation(this, pokeballExitTexture, pokeballExitTexture, exit[0]);
  //     createSpriteAnimation(this, pokeballShake, pokeballShake, shake[0]);
  //   }
  // }

  private initBattleBallAnimation() {
    const texture0 = getSpriteFrames(this, TEXTURE.BATTLE_BALL_0, ANIMATION.BATTLE_BALL_0);
    const texture1 = getSpriteFrames(this, TEXTURE.BATTLE_BALL_1, ANIMATION.BATTLE_BALL_1);

    const texture0Per = 8;

    for (let i = 1; i <= 4; i++) {
      const ballLaunchTexture = `ball_00${i}_launch`;
      const ballEnterTexture = `ball_00${i}_enter`;

      const launch = [
        [
          texture0[texture0Per * (i - 1) + 0],
          texture0[texture0Per * (i - 1) + 1],
          texture0[texture0Per * (i - 1) + 2],
          texture0[texture0Per * (i - 1) + 3],
          texture0[texture0Per * (i - 1) + 4],
          texture0[texture0Per * (i - 1) + 5],
          texture0[texture0Per * (i - 1) + 6],
          texture0[texture0Per * (i - 1) + 7],
        ],
      ];

      const enter = [[texture1[i - 1]]];

      createSpriteAnimation(this, ballLaunchTexture, ballLaunchTexture, launch[0]);
      createSpriteAnimation(this, ballEnterTexture, ballEnterTexture, enter[0]);
    }
  }

  private initPlayerAnimation() {
    for (let i = 1; i <= 4; i++) {
      const boyMovementTexture = `boy_${i}_movement`;
      const boyRideTexture = `boy_${i}_ride`;
      const boySurfTexture = `boy_${i}_surf`;
      const boyHiddenMoveTexture = `boy_${i}_hm`;

      const girlMovementTexture = `girl_${i}_movement`;
      const girlRideTexture = `girl_${i}_ride`;
      const girlSurfTexture = `girl_${i}_surf`;
      const girlHiddenMoveTexture = `girl_${i}_hm`;

      const movementFramesB = getSpriteFrames(this, boyMovementTexture, ANIMATION.PLAYER_MOVEMENT);
      const rideFramesB = getSpriteFrames(this, boyRideTexture, ANIMATION.PLAYER_RIDE);
      const surfFramesB = getSpriteFrames(this, boySurfTexture, ANIMATION.PLAYER_SURF);
      const hiddenMoveFramesB = getSpriteFrames(this, boyHiddenMoveTexture, ANIMATION.PLAYER_HM);

      const movementFramesG = getSpriteFrames(this, girlMovementTexture, ANIMATION.PLAYER_MOVEMENT);
      const rideFramesG = getSpriteFrames(this, girlRideTexture, ANIMATION.PLAYER_RIDE);
      const surfFramesG = getSpriteFrames(this, girlSurfTexture, ANIMATION.PLAYER_SURF);
      const hiddenMoveFramesG = getSpriteFrames(this, girlHiddenMoveTexture, ANIMATION.PLAYER_HM);

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

      const surfUpB = [[surfFramesB[0]]];
      const surfDownB = [[surfFramesB[3]]];
      const surfLeftB = [[surfFramesB[6]]];
      const surfRightB = [[surfFramesB[9]]];

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

      createSpriteAnimation(this, boySurfTexture, `${boySurfTexture}_up`, surfUpB[0]);
      createSpriteAnimation(this, boySurfTexture, `${boySurfTexture}_down`, surfDownB[0]);
      createSpriteAnimation(this, boySurfTexture, `${boySurfTexture}_left`, surfLeftB[0]);
      createSpriteAnimation(this, boySurfTexture, `${boySurfTexture}_right`, surfRightB[0]);

      createSpriteAnimation(this, boyHiddenMoveTexture, boyHiddenMoveTexture, hiddenMoveFramesB);

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

      const surfUpG = [[surfFramesG[0]]];
      const surfDownG = [[surfFramesG[3]]];
      const surfLeftG = [[surfFramesG[6]]];
      const surfRightG = [[surfFramesG[9]]];

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

      createSpriteAnimation(this, girlSurfTexture, `${girlSurfTexture}_up`, surfUpG[0]);
      createSpriteAnimation(this, girlSurfTexture, `${girlSurfTexture}_down`, surfDownG[0]);
      createSpriteAnimation(this, girlSurfTexture, `${girlSurfTexture}_left`, surfLeftG[0]);
      createSpriteAnimation(this, girlSurfTexture, `${girlSurfTexture}_right`, surfRightG[0]);

      createSpriteAnimation(this, girlHiddenMoveTexture, girlHiddenMoveTexture, hiddenMoveFramesG);
    }
  }

  private initSurfAnimation() {
    const frames = getSpriteFrames(this, TEXTURE.SURF, ANIMATION.SURF);

    const up = [[frames[0]]];
    const down = [[frames[3]]];
    const left = [[frames[6]]];
    const right = [[frames[9]]];

    createSpriteAnimation(this, TEXTURE.SURF, `${TEXTURE.SURF}_up`, up[0]);
    createSpriteAnimation(this, TEXTURE.SURF, `${TEXTURE.SURF}_down`, down[0]);
    createSpriteAnimation(this, TEXTURE.SURF, `${TEXTURE.SURF}_left`, left[0]);
    createSpriteAnimation(this, TEXTURE.SURF, `${TEXTURE.SURF}_right`, right[0]);
  }

  private initShader() {
    if (this.game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer) {
      this.game.renderer.pipelines.addPostPipeline('WipeRightToLeftShader', WipeRightToLeftShader);
    }
  }

  private initAudio() {}
}
