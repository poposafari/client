import { Direction } from "./Direction";

export class SpriteAnimation{
    constructor(anime:Phaser.Scene){
        this.anime = anime;

        this.playerFrames = this.anime.anims.generateFrameNames('player',{
            prefix:'player_girl_0-',
            suffix:"",
            start:0,
            end:23,
        });

        this.pokemonFrames = this.anime.anims.generateFrameNames('pet',{
            prefix:'001-',
            suffix:"",
            start:0,
            end:15,
        });

        this.pokemonFrames = this.anime.anims.generateFrameNames('wild',{
          prefix:'001-',
          suffix:"",
          start:0,
          end:15,
      });

        this.playerCustomFrameWalkUp = [
            [this.playerFrames[1],this.playerFrames[0]],
            [this.playerFrames[2],this.playerFrames[0]]
        ];
        this.playerCustomFrameWalkDown = [
            [this.playerFrames[4],this.playerFrames[3]],
            [this.playerFrames[5],this.playerFrames[3]]
        ];
        this.playerCustomFrameWalkLeft = [
            [this.playerFrames[7],this.playerFrames[6]],
            [this.playerFrames[8],this.playerFrames[6]]
        ];
        this.playerCustomFrameWalkRight = [
            [this.playerFrames[10],this.playerFrames[9]],
            [this.playerFrames[11],this.playerFrames[9]]
        ];

        this.playerCustomFrameRunUp = [
            [this.playerFrames[14],this.playerFrames[12]],
            [this.playerFrames[13],this.playerFrames[12]],
            [this.playerFrames[12],this.playerFrames[12]]
        ];
        this.playerCustomFrameRunDown = [
            [this.playerFrames[16],this.playerFrames[15]],
            [this.playerFrames[17],this.playerFrames[15]],
            [this.playerFrames[15],this.playerFrames[15]]
        ];
        this.playerCustomFrameRunLeft = [
            [this.playerFrames[19],this.playerFrames[18]],
            [this.playerFrames[20],this.playerFrames[18]],
            [this.playerFrames[18],this.playerFrames[18]]
        ];
        this.playerCustomFrameRunRight = [
            [this.playerFrames[22],this.playerFrames[21]],
            [this.playerFrames[23],this.playerFrames[21]],
            [this.playerFrames[21],this.playerFrames[21]]
        ];

        this.petCustomFrameMovementDown = [
            [this.pokemonFrames[0],this.pokemonFrames[1],this.pokemonFrames[2],this.pokemonFrames[3]],
        ];
        this.petCustomFrameMovementLeft = [
            [this.pokemonFrames[4],this.pokemonFrames[5],this.pokemonFrames[6],this.pokemonFrames[7]],
        ];
        this.petCustomFrameMovementRight = [
            [this.pokemonFrames[8],this.pokemonFrames[9],this.pokemonFrames[10],this.pokemonFrames[11]],
        ];
        this.petCustomFrameMovementUp = [
            [this.pokemonFrames[12],this.pokemonFrames[13],this.pokemonFrames[14],this.pokemonFrames[15]],
        ];

        //sprite(player) walk frames.
        this.createPlayerAnimation(
          Direction.PLAYER_WALK_UP_1, 
          this.playerCustomFrameWalkUp[0],
          this.PLAYER_WALK_FRAMERATE,
          this.PLAYER_WALK_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_WALK_UP_2, 
          this.playerCustomFrameWalkUp[1],
          this.PLAYER_WALK_FRAMERATE,
          this.PLAYER_WALK_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_WALK_DOWN_1, 
          this.playerCustomFrameWalkDown[0],
          this.PLAYER_WALK_FRAMERATE,
          this.PLAYER_WALK_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_WALK_DOWN_2, 
          this.playerCustomFrameWalkDown[1],
          this.PLAYER_WALK_FRAMERATE,
          this.PLAYER_WALK_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_WALK_LEFT_1, 
          this.playerCustomFrameWalkLeft[0],
          this.PLAYER_WALK_FRAMERATE,
          this.PLAYER_WALK_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_WALK_LEFT_2, 
          this.playerCustomFrameWalkLeft[1],
          this.PLAYER_WALK_FRAMERATE,
          this.PLAYER_WALK_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_WALK_RIGHT_1, 
          this.playerCustomFrameWalkRight[0],
          this.PLAYER_WALK_FRAMERATE,
          this.PLAYER_WALK_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_WALK_RIGHT_2, 
          this.playerCustomFrameWalkRight[1],
          this.PLAYER_WALK_FRAMERATE,
          this.PLAYER_WALK_DELAY
        );

    //sprite(player) run frames.
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_UP_1, 
          this.playerCustomFrameRunUp[0],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_UP_2, 
          this.playerCustomFrameRunUp[1],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_UP_3, 
          this.playerCustomFrameRunUp[2],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
    
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_DOWN_1, 
          this.playerCustomFrameRunDown[0],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_DOWN_2, 
          this.playerCustomFrameRunDown[1],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_DOWN_3, 
          this.playerCustomFrameRunDown[2],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );

        this.createPlayerAnimation(
          Direction.PLAYER_RUN_LEFT_1, 
          this.playerCustomFrameRunLeft[0],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_LEFT_2, 
          this.playerCustomFrameRunLeft[1],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_LEFT_3, 
          this.playerCustomFrameRunLeft[2],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
    
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_RIGHT_1, 
          this.playerCustomFrameRunRight[0],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_RIGHT_2, 
          this.playerCustomFrameRunRight[1],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
        this.createPlayerAnimation(
          Direction.PLAYER_RUN_RIGHT_3, 
          this.playerCustomFrameRunRight[2],
          this.PLAYER_RUN_FRAMERATE,
          this.PLAYER_RUN_DELAY
        );
    
    //sprite(follow pokemon) movement frames.
        this.createPlayerAnimation(
          Direction.POKEMON_DOWN, 
          this.petCustomFrameMovementDown[0],
          this.POKEMON_FRAMERATE,
          this.POKEMON_DELAY
        );
        this.createPlayerAnimation(
          Direction.POKEMON_LEFT, 
          this.petCustomFrameMovementLeft[0],
          this.POKEMON_FRAMERATE,
          this.POKEMON_DELAY
        );
        this.createPlayerAnimation(
          Direction.POKEMON_RIGHT, 
          this.petCustomFrameMovementRight[0],
          this.POKEMON_FRAMERATE,
          this.POKEMON_DELAY
        );
        this.createPlayerAnimation(
          Direction.POKEMON_UP, 
          this.petCustomFrameMovementUp[0],
          this.POKEMON_FRAMERATE,
          this.POKEMON_DELAY
        );
    }
    private anime: Phaser.Scene;

    private playerFrames: Phaser.Types.Animations.AnimationFrame[];
    private pokemonFrames: Phaser.Types.Animations.AnimationFrame[];

    private playerCustomFrameWalkUp: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameWalkDown: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameWalkLeft: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameWalkRight: Phaser.Types.Animations.AnimationFrame[][];

    private playerCustomFrameRunUp: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameRunDown: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameRunLeft: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameRunRight: Phaser.Types.Animations.AnimationFrame[][];

    private petCustomFrameMovementDown: Phaser.Types.Animations.AnimationFrame[][];
    private petCustomFrameMovementLeft: Phaser.Types.Animations.AnimationFrame[][];
    private petCustomFrameMovementRight: Phaser.Types.Animations.AnimationFrame[][];
    private petCustomFrameMovementUp: Phaser.Types.Animations.AnimationFrame[][];

    private readonly PLAYER_WALK_FRAMERATE=6; //6
    private readonly PLAYER_RUN_FRAMERATE=0; //5
    private readonly PLAYER_WALK_DELAY=6;
    private readonly PLAYER_RUN_DELAY=0;
  
    private readonly POKEMON_FRAMERATE=6;
    private readonly POKEMON_DELAY = 0;

    private createPlayerAnimation(
      name: string,
      frames: Phaser.Types.Animations.AnimationFrame[],
      frameRate: number,
      delay: number
    ) {
      this.anime.anims.create({
        key: name,
        frames: frames,
        frameRate: frameRate,
        repeat: -1,
        delay:delay,
        yoyo:false
    });
  }
}