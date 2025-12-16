import { ANIMATION, AUDIO, TEXTURE, UI } from '../enums';
import { Keyboard } from '../core/manager/keyboard-manager';
import { Option } from '../core/storage/player-option';
import { LoginUi } from '../uis/login-ui';
import {
  Gate001,
  Gate002,
  Gate003,
  Gate004,
  Plaza001,
  Plaza002,
  Plaza003,
  Plaza004,
  Plaza005,
  Plaza006,
  Plaza007,
  Plaza008,
  Plaza009,
  Plaza010,
  Plaza011,
  Plaza012,
  Plaza019,
  Plaza020,
  Plaza021,
  Plaza022,
  Plaza023,
  Safari001,
  Safari002,
  Safari003,
  Safari004,
  Safari005,
  Safari006,
  Safari007,
  Safari008,
  Safari009,
  Safari010,
  Safari011,
} from '../uis/overworld/overworld';
import { createSpriteAnimation, getSpriteFrames } from '../uis/ui';
import { WelcomeUi } from '../uis/welcome-ui';
import { createZeroPad } from '../utils/string-util';
import WipeRightToLeftShader from '../utils/wipe-rl-shader';
import DayNightFilter from '../utils/day-night-filter';
import { BaseScene } from './base-scene';
import { Game } from '../core/manager/game-manager';
import { Sound } from '../core/manager/sound-manager';
import { Event } from '../core/manager/event-manager';
import { Bag } from '../core/storage/bag-storage';
import { OverworldGlobal } from '../core/storage/overworld-storage';
import { PC } from '../core/storage/pc-storage';
import { PlayerGlobal } from '../core/storage/player-storage';
import { RegisterUi } from '../uis/register-ui';
import { TitleUi } from '../uis/title-ui';
import { StarterUi } from '../uis/starter-ui';
import { OptionUi } from '../uis/option-ui';
import { FailTokenUi } from '../uis/fail-token-ui';
import { SeasonScreenUi } from '../uis/season-screen-ui';
import { ConnectBaseUi } from '../uis/connect-base-ui';
import { ConnectAccountDeleteUi } from '../uis/connect-account-delete-ui';
import { ConnectSafariUi } from '../uis/connect-safari-ui';
import { AccountDeleteUi } from '../uis/account-delete-ui';
import { AccountDeleteRestoreUi } from '../uis/account-delete-restore-ui';
import { OverworldUi } from '../uis/overworld/overworld-ui';
import { OverworldMenuUi } from '../uis/overworld/overworld-menu-ui';
import { QuickSlotItemUi } from '../uis/quick-slot-item-ui';
import { BagUi } from '../uis/bag-ui';
import { PcUi } from '../uis/pc-ui';
import { EvolveUi } from '../uis/evolve-ui';
import { HiddenMoveUi } from '../uis/hidden-move-ui';
import { StarterPokemonUi } from '../uis/starter-pokemon-ui';
import { Battle } from '../uis/battle/battle';
import { HelpUi } from '../uis/help-ui';
import { BagSellUi } from '../uis/bag-sell-ui';
import { bigSizePokemonOverworldPokedex, femalePokemonOverworldPokedex, getAllPokemonKeys } from '../data';

export class InGameScene extends BaseScene {
  constructor() {
    super('InGameScene');
  }

  create() {
    this.initAnimation();

    Game.init(this);
    Keyboard.init(this);
    Sound.init(this);
    Event.init();
    Bag.init();
    PC.init();
    PlayerGlobal.init();
    Option.init();
    OverworldGlobal.init(this);

    Game.registerUiFactory(UI.FAIL_TOKEN, (scene) => new FailTokenUi(scene));
    Game.registerUiFactory(UI.CONNECT_BASE, (scene) => new ConnectBaseUi(scene));
    Game.registerUiFactory(UI.CONNECT_ACCOUNT_DELETE, (scene) => new ConnectAccountDeleteUi(scene));
    Game.registerUiFactory(UI.CONNECT_SAFARI, (scene) => new ConnectSafariUi(scene));
    Game.registerUiFactory(UI.LOGIN, (scene) => new LoginUi(scene));
    Game.registerUiFactory(UI.REGISTER, (scene) => new RegisterUi(scene));
    Game.registerUiFactory(UI.WELCOME, (scene) => new WelcomeUi(scene));
    Game.registerUiFactory(UI.HELP, (scene) => new HelpUi(scene));
    Game.registerUiFactory(UI.SEASON_SCREEN, (scene) => new SeasonScreenUi(scene));
    Game.registerUiFactory(UI.TITLE, (scene) => new TitleUi(scene));
    Game.registerUiFactory(UI.STARTER, (scene) => new StarterUi(scene));
    Game.registerUiFactory(UI.OPTION, (scene) => new OptionUi(scene));
    Game.registerUiFactory(UI.ACCOUNT_DELETE, (scene) => new AccountDeleteUi(scene));
    Game.registerUiFactory(UI.ACCOUNT_DELETE_RESTORE, (scene) => new AccountDeleteRestoreUi(scene));
    Game.registerUiFactory(UI.OVERWORLD, (scene) => new OverworldUi(scene));
    Game.registerUiFactory(UI.OVERWORLD_MENU, (scene) => new OverworldMenuUi(scene));
    Game.registerUiFactory(UI.QUICK_SLOT_ITEM, (scene) => new QuickSlotItemUi(scene));
    Game.registerUiFactory(UI.BAG, (scene) => new BagUi(scene));
    Game.registerUiFactory(UI.BAG_SELL, (scene) => new BagSellUi(scene));
    Game.registerUiFactory(UI.PC, (scene) => new PcUi(scene));
    Game.registerUiFactory(UI.EVOLVE, (scene) => new EvolveUi(scene));
    Game.registerUiFactory(UI.HIDDEN_MOVE, (scene) => new HiddenMoveUi(scene));
    Game.registerUiFactory(UI.STARTER_POKEMON, (scene) => new StarterPokemonUi(scene));
    Game.registerUiFactory(UI.BATTLE, (scene) => new Battle(scene));

    //plaza
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_001, (ui) => new Plaza001(TEXTURE.PLAZA_001, AUDIO.B005, false, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_002, (ui) => new Plaza002(TEXTURE.PLAZA_002, AUDIO.B010, false, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_003, (ui) => new Plaza003(TEXTURE.PLAZA_003, AUDIO.B001, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_004, (ui) => new Plaza004(TEXTURE.PLAZA_004, AUDIO.B008, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_005, (ui) => new Plaza005(TEXTURE.PLAZA_005, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_006, (ui) => new Plaza006(TEXTURE.PLAZA_006, AUDIO.B011, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_007, (ui) => new Plaza007(TEXTURE.PLAZA_007, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_008, (ui) => new Plaza008(TEXTURE.PLAZA_008, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_009, (ui) => new Plaza009(TEXTURE.PLAZA_009, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_010, (ui) => new Plaza010(TEXTURE.PLAZA_010, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_011, (ui) => new Plaza011(TEXTURE.PLAZA_011, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_012, (ui) => new Plaza012(TEXTURE.PLAZA_012, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_019, (ui) => new Plaza019(TEXTURE.PLAZA_019, AUDIO.B009, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_020, (ui) => new Plaza020(TEXTURE.PLAZA_020, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_021, (ui) => new Plaza021(TEXTURE.PLAZA_021, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_022, (ui) => new Plaza022(TEXTURE.PLAZA_022, AUDIO.B005, true, TEXTURE.AREA_3));
    OverworldGlobal.registerMapFactory(TEXTURE.PLAZA_023, (ui) => new Plaza023(TEXTURE.PLAZA_023, AUDIO.B005, true, TEXTURE.AREA_3));

    //gate
    OverworldGlobal.registerMapFactory(TEXTURE.GATE_001, (ui) => new Gate001(TEXTURE.GATE_001, AUDIO.B004, false, TEXTURE.AREA_16));
    OverworldGlobal.registerMapFactory(TEXTURE.GATE_002, (ui) => new Gate002(TEXTURE.GATE_002, AUDIO.B004, false, TEXTURE.AREA_16));
    OverworldGlobal.registerMapFactory(TEXTURE.GATE_003, (ui) => new Gate003(TEXTURE.GATE_003, AUDIO.B004, false, TEXTURE.AREA_16));
    OverworldGlobal.registerMapFactory(TEXTURE.GATE_004, (ui) => new Gate004(TEXTURE.GATE_004, AUDIO.B004, false, TEXTURE.AREA_16));

    //safari
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_001, (ui) => new Safari001(TEXTURE.SAFARI_001, AUDIO.B032, false, TEXTURE.AREA_1));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_002, (ui) => new Safari002(TEXTURE.SAFARI_002, AUDIO.B007, false, TEXTURE.AREA_1));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_003, (ui) => new Safari003(TEXTURE.SAFARI_003, AUDIO.B029, false, TEXTURE.AREA_4));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_004, (ui) => new Safari004(TEXTURE.SAFARI_004, AUDIO.B029, false, TEXTURE.AREA_4));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_005, (ui) => new Safari005(TEXTURE.SAFARI_005, AUDIO.B029, false, TEXTURE.AREA_4));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_006, (ui) => new Safari006(TEXTURE.SAFARI_006, AUDIO.B017, false, TEXTURE.AREA_5));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_007, (ui) => new Safari007(TEXTURE.SAFARI_007, AUDIO.B014, false, TEXTURE.AREA_7));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_008, (ui) => new Safari008(TEXTURE.SAFARI_008, AUDIO.B014, false, TEXTURE.AREA_7));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_009, (ui) => new Safari009(TEXTURE.SAFARI_009, AUDIO.B020, false, TEXTURE.AREA_7));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_010, (ui) => new Safari010(TEXTURE.SAFARI_010, AUDIO.B032, false, TEXTURE.AREA_1));
    OverworldGlobal.registerMapFactory(TEXTURE.SAFARI_011, (ui) => new Safari011(TEXTURE.SAFARI_011, AUDIO.B017, false, TEXTURE.AREA_5));

    Game.initializeGame();
  }

  update(time: number, delta: number): void {
    const overworldUi = Game.findUiInStack((ui): ui is OverworldUi => ui instanceof OverworldUi);

    if (overworldUi) {
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
    createSpriteAnimation(this, TEXTURE.BAG_POCKET_TM_HM, ANIMATION.BAG_POCKET_TM_HM);

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

    createSpriteAnimation(this, TEXTURE.OVERWORLD_SHADOW_WATER, ANIMATION.OVERWORLD_SHADOW_WATER);

    createSpriteAnimation(this, TEXTURE.PARTICLE_ENTER_BALL, ANIMATION.PARTICLE_ENTER_BALL);

    createSpriteAnimation(this, TEXTURE.GROUND_ITEM, ANIMATION.GROUND_ITEM);

    createSpriteAnimation(this, TEXTURE.TUTORIAL_CHOICE_BALL, ANIMATION.TUTORIAL_CHOICE_BALL);
    createSpriteAnimation(this, TEXTURE.TUTORIAL_CHOICE_FINGER, ANIMATION.TUTORIAL_CHOICE_FINGER);

    this.initDoorAnimation();

    this.initNpcAnimation();
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
    // for (const key of Object.keys(npcData)) {
    //   const frames = getSpriteFrames(this, `${key}`, ANIMATION.NPC_MOVEMENT);
    //   const up_0 = [frames[13], frames[12]];
    //   const up_1 = [frames[15], frames[14]];
    //   const down_0 = [frames[1], frames[0]];
    //   const down_1 = [frames[3], frames[2]];
    //   const left_0 = [frames[5], frames[4]];
    //   const left_1 = [frames[7], frames[6]];
    //   const right_0 = [frames[9], frames[8]];
    //   const right_1 = [frames[11], frames[10]];
    //   createSpriteAnimation(this, `${key}`, `${key}_up_0`, up_0);
    //   createSpriteAnimation(this, `${key}`, `${key}_up_1`, up_1);
    //   createSpriteAnimation(this, `${key}`, `${key}_down_0`, down_0);
    //   createSpriteAnimation(this, `${key}`, `${key}_down_1`, down_1);
    //   createSpriteAnimation(this, `${key}`, `${key}_left_0`, left_0);
    //   createSpriteAnimation(this, `${key}`, `${key}_left_1`, left_1);
    //   createSpriteAnimation(this, `${key}`, `${key}_right_0`, right_0);
    //   createSpriteAnimation(this, `${key}`, `${key}_right_1`, right_1);
    // }
  }

  private initPokemonAnimation() {
    const movementFrames = getSpriteFrames(this, `pokemon.overworld.0000`, ANIMATION.POKEMON_OVERWORLD_0);

    const upD = [movementFrames[12], movementFrames[13], movementFrames[14], movementFrames[15]];
    const downD = [movementFrames[0], movementFrames[1], movementFrames[2], movementFrames[3]];
    const leftD = [movementFrames[4], movementFrames[5], movementFrames[6], movementFrames[7]];
    const rightD = [movementFrames[8], movementFrames[9], movementFrames[10], movementFrames[11]];

    createSpriteAnimation(this, `pokemon.overworld.0000`, `pokemon.overworld.0000_up`, upD);
    createSpriteAnimation(this, `pokemon.overworld.0000`, `pokemon.overworld.0000_down`, downD);
    createSpriteAnimation(this, `pokemon.overworld.0000`, `pokemon.overworld.0000_left`, leftD);
    createSpriteAnimation(this, `pokemon.overworld.0000`, `pokemon.overworld.0000_right`, rightD);

    for (const pokemon of getAllPokemonKeys()) {
      if (pokemon.includes('mega')) continue;
      if (pokemon.includes('primal')) continue;
      if (pokemon.includes('sunshine')) continue;
      if (pokemon.includes('zen')) continue;
      if (pokemon.includes('ash')) continue;
      if (pokemon.includes('blade')) continue;
      if (pokemon.includes('complete')) continue;
      if (pokemon.includes('school')) continue;
      if (pokemon.includes('ultra')) continue;
      if (pokemon.includes('gulping')) continue;
      if (pokemon.includes('gorging')) continue;
      if (pokemon.includes('noice')) continue;
      if (pokemon.includes('dada')) continue;
      if (pokemon.includes('stella')) continue;

      const firstUnderscoreIndex = pokemon.indexOf('_');
      let pokedex = pokemon;
      let form = '';
      if (firstUnderscoreIndex !== -1) {
        pokedex = pokemon.substring(0, firstUnderscoreIndex);
        form = '_' + pokemon.substring(firstUnderscoreIndex + 1);
      }
      let movementFrames: Phaser.Types.Animations.AnimationFrame[] = [];
      let movementShinyFrames: Phaser.Types.Animations.AnimationFrame[] = [];

      let upS: Phaser.Types.Animations.AnimationFrame[] = [];
      let downS: Phaser.Types.Animations.AnimationFrame[] = [];
      let leftS: Phaser.Types.Animations.AnimationFrame[] = [];
      let rightS: Phaser.Types.Animations.AnimationFrame[] = [];

      let up: Phaser.Types.Animations.AnimationFrame[] = [];
      let down: Phaser.Types.Animations.AnimationFrame[] = [];
      let left: Phaser.Types.Animations.AnimationFrame[] = [];
      let right: Phaser.Types.Animations.AnimationFrame[] = [];

      movementFrames = getSpriteFrames(this, `pokemon.overworld.${pokedex}${form}`, bigSizePokemonOverworldPokedex.includes(pokedex) ? ANIMATION.POKEMON_OVERWORLD_1 : ANIMATION.POKEMON_OVERWORLD_0);
      movementShinyFrames = getSpriteFrames(
        this,
        `pokemon.overworld.${pokedex}s${form}`,
        bigSizePokemonOverworldPokedex.includes(pokedex) ? ANIMATION.POKEMON_OVERWORLD_1 : ANIMATION.POKEMON_OVERWORLD_0,
      );

      if (femalePokemonOverworldPokedex.includes(pokedex)) {
        movementFrames = getSpriteFrames(
          this,
          `pokemon.overworld.${pokedex}s${form}_female`,
          bigSizePokemonOverworldPokedex.includes(pokedex) ? ANIMATION.POKEMON_OVERWORLD_1 : ANIMATION.POKEMON_OVERWORLD_0,
        );
        movementShinyFrames = getSpriteFrames(
          this,
          `pokemon.overworld.${pokedex}s${form}_female`,
          bigSizePokemonOverworldPokedex.includes(pokedex) ? ANIMATION.POKEMON_OVERWORLD_1 : ANIMATION.POKEMON_OVERWORLD_0,
        );
      }

      up = [movementFrames[12], movementFrames[13], movementFrames[14], movementFrames[15]];
      down = [movementFrames[0], movementFrames[1], movementFrames[2], movementFrames[3]];
      left = [movementFrames[4], movementFrames[5], movementFrames[6], movementFrames[7]];
      right = [movementFrames[8], movementFrames[9], movementFrames[10], movementFrames[11]];

      upS = [movementShinyFrames[12], movementShinyFrames[13], movementShinyFrames[14], movementShinyFrames[15]];
      downS = [movementShinyFrames[0], movementShinyFrames[1], movementShinyFrames[2], movementShinyFrames[3]];
      leftS = [movementShinyFrames[4], movementShinyFrames[5], movementShinyFrames[6], movementShinyFrames[7]];
      rightS = [movementShinyFrames[8], movementShinyFrames[9], movementShinyFrames[10], movementShinyFrames[11]];

      createSpriteAnimation(this, `pokemon.overworld.${pokedex}s${form}`, `pokemon.overworld.${pokedex}s${form}_up`, upS);
      createSpriteAnimation(this, `pokemon.overworld.${pokedex}s${form}`, `pokemon.overworld.${pokedex}s${form}_down`, downS);
      createSpriteAnimation(this, `pokemon.overworld.${pokedex}s${form}`, `pokemon.overworld.${pokedex}s${form}_left`, leftS);
      createSpriteAnimation(this, `pokemon.overworld.${pokedex}s${form}`, `pokemon.overworld.${pokedex}s${form}_right`, rightS);

      createSpriteAnimation(this, `pokemon.overworld.${pokedex}${form}`, `pokemon.overworld.${pokedex}${form}_up`, up);
      createSpriteAnimation(this, `pokemon.overworld.${pokedex}${form}`, `pokemon.overworld.${pokedex}${form}_down`, down);
      createSpriteAnimation(this, `pokemon.overworld.${pokedex}${form}`, `pokemon.overworld.${pokedex}${form}_left`, left);
      createSpriteAnimation(this, `pokemon.overworld.${pokedex}${form}`, `pokemon.overworld.${pokedex}${form}_right`, right);

      if (femalePokemonOverworldPokedex.includes(pokedex)) {
        createSpriteAnimation(this, `pokemon.overworld.${pokedex}s${form}_female`, `pokemon.overworld.${pokedex}s${form}_female_up`, upS);
        createSpriteAnimation(this, `pokemon.overworld.${pokedex}s${form}_female`, `pokemon.overworld.${pokedex}s${form}_female_down`, downS);
        createSpriteAnimation(this, `pokemon.overworld.${pokedex}s${form}_female`, `pokemon.overworld.${pokedex}s${form}_female_left`, leftS);
        createSpriteAnimation(this, `pokemon.overworld.${pokedex}s${form}_female`, `pokemon.overworld.${pokedex}s${form}_female_right`, rightS);

        createSpriteAnimation(this, `pokemon.overworld.${pokedex}${form}_female`, `pokemon.overworld.${pokedex}${form}_female_up`, up);
        createSpriteAnimation(this, `pokemon.overworld.${pokedex}${form}_female`, `pokemon.overworld.${pokedex}${form}_female_down`, down);
        createSpriteAnimation(this, `pokemon.overworld.${pokedex}${form}_female`, `pokemon.overworld.${pokedex}${form}_female_left`, left);
        createSpriteAnimation(this, `pokemon.overworld.${pokedex}${form}_female`, `pokemon.overworld.${pokedex}${form}_female_right`, right);
      }
    }
  }

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
        [rideFramesB[1], rideFramesB[1], rideFramesB[0]],
        [rideFramesB[0], rideFramesB[0], rideFramesB[0]],
        [rideFramesB[0], rideFramesB[0], rideFramesB[0]],
        [rideFramesB[2], rideFramesB[2], rideFramesB[0]],
        [rideFramesB[0], rideFramesB[0], rideFramesB[0]],
        [rideFramesB[0], rideFramesB[0], rideFramesB[0]],
      ];

      const rideDownB = [
        [rideFramesB[4], rideFramesB[4], rideFramesB[3]],
        [rideFramesB[3], rideFramesB[3], rideFramesB[3]],
        [rideFramesB[3], rideFramesB[3], rideFramesB[3]],
        [rideFramesB[5], rideFramesB[5], rideFramesB[3]],
        [rideFramesB[3], rideFramesB[3], rideFramesB[3]],
        [rideFramesB[3], rideFramesB[3], rideFramesB[3]],
      ];

      const rideLeftB = [
        [rideFramesB[7], rideFramesB[7], rideFramesB[6]],
        [rideFramesB[6], rideFramesB[6], rideFramesB[6]],
        [rideFramesB[6], rideFramesB[6], rideFramesB[6]],
        [rideFramesB[8], rideFramesB[8], rideFramesB[6]],
        [rideFramesB[6], rideFramesB[6], rideFramesB[6]],
        [rideFramesB[6], rideFramesB[6], rideFramesB[6]],
      ];

      const rideRightB = [
        [rideFramesB[10], rideFramesB[10], rideFramesB[9]],
        [rideFramesB[9], rideFramesB[9], rideFramesB[9]],
        [rideFramesB[9], rideFramesB[9], rideFramesB[9]],
        [rideFramesB[11], rideFramesB[11], rideFramesB[9]],
        [rideFramesB[9], rideFramesB[9], rideFramesB[9]],
        [rideFramesB[9], rideFramesB[9], rideFramesB[9]],
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
        [rideFramesG[1], rideFramesG[1], rideFramesG[0]],
        [rideFramesG[0], rideFramesG[0], rideFramesG[0]],
        [rideFramesG[0], rideFramesG[0], rideFramesG[0]],
        [rideFramesG[2], rideFramesG[2], rideFramesG[0]],
        [rideFramesG[0], rideFramesG[0], rideFramesG[0]],
        [rideFramesG[0], rideFramesG[0], rideFramesG[0]],
      ];

      const rideDownG = [
        [rideFramesG[4], rideFramesG[4], rideFramesG[3]],
        [rideFramesG[3], rideFramesG[3], rideFramesG[3]],
        [rideFramesG[3], rideFramesG[3], rideFramesG[3]],
        [rideFramesG[5], rideFramesG[5], rideFramesG[3]],
        [rideFramesG[3], rideFramesG[3], rideFramesG[3]],
        [rideFramesG[3], rideFramesG[3], rideFramesG[3]],
      ];

      const rideLeftG = [
        [rideFramesG[7], rideFramesG[7], rideFramesG[6]],
        [rideFramesG[6], rideFramesG[6], rideFramesG[6]],
        [rideFramesG[6], rideFramesG[6], rideFramesG[6]],
        [rideFramesG[8], rideFramesG[8], rideFramesG[6]],
        [rideFramesG[6], rideFramesG[6], rideFramesG[6]],
        [rideFramesG[6], rideFramesG[6], rideFramesG[6]],
      ];

      const rideRightG = [
        [rideFramesG[10], rideFramesG[10], rideFramesG[9]],
        [rideFramesG[9], rideFramesG[9], rideFramesG[9]],
        [rideFramesG[9], rideFramesG[9], rideFramesG[9]],
        [rideFramesG[11], rideFramesG[11], rideFramesG[9]],
        [rideFramesG[9], rideFramesG[9], rideFramesG[9]],
        [rideFramesG[9], rideFramesG[9], rideFramesG[9]],
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
      this.game.renderer.pipelines.addPostPipeline('DayNightFilter', DayNightFilter);
    }
  }
}
