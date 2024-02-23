import { DEFAULT_DELAY, DEFAULT_FRAMERATE, IMAGE_KEY, MAX_PLAYER_MOVEMENT_FRAME, MAX_PLAYER_SPRITE, MAX_POKEMON, MAX_POKEMON_FRAME, SPRITE_DEPTH } from "../constants/Game";

export class ImageManager{
  constructor(private phaser: Phaser.Scene){}

  loadImageMap():void{
    this.phaser.load.image(IMAGE_KEY.TILESET,"assets/map/nature_1.png");
    this.phaser.load.tilemapTiledJSON(IMAGE_KEY.MAP,"assets/map/test_map_grid.json");
  }
  loadImagePlayer():void{
    for(let i=1;i<=MAX_PLAYER_SPRITE;i++){
      this.phaser.load.atlas(IMAGE_KEY.PLAYER_MOVEMENT+`_${i}`,`assets/player/player_${i}_movement.png`,`assets/player/player_movement.json`);
    }
  }
  loadImageItem():void{
    for(let i=0;i<4;i++){
        this.phaser.load.image(IMAGE_KEY.ITEM_GROUND+`_${i}`,`assets/item/item_${i}_ground.png`);
        this.phaser.load.image(IMAGE_KEY.ITEM_THROW+`_${i}`,`assets/item/item_${i}_thrown.png`);
    }
  }
  loadImagePokemon():void{
    for(let i=0;i<=MAX_POKEMON;i++){
        const index = this.addZeroPadding(i,3);
        this.phaser.load.atlas(`${index}`,`assets/pokemon/${index}.png`,`assets/pokemon/size_0.json`);
        this.phaser.load.atlas(`${index}s`,`assets/pokemon/${index}s.png`,`assets/pokemon/size_0.json`);
    }
  }
  createMap():Phaser.Tilemaps.Tilemap{
    const map = this.phaser.make.tilemap({ key: "test-town-map" });
    map.addTilesetImage("nature_1", "nature_1");
    const layer1 = map.createLayer(0,"nature_1",0,0);
    const layer2 = map.createLayer(1,"nature_1",0,0);
    return map;
  }
  createSpritePlayer(spriteIndex:number,isPlayer:boolean):Phaser.GameObjects.Sprite{
    const playerSprite = this.createSprite(0,0,IMAGE_KEY.PLAYER_MOVEMENT+`_${spriteIndex}`);
    playerSprite.scale = 2;
    playerSprite.setDepth(SPRITE_DEPTH.PLAYER_MIDDLE);
    this.createSpriteAnimationPlayer(spriteIndex);
    if(isPlayer){
      this.phaser.cameras.main.startFollow(playerSprite);
      this.phaser.cameras.main.roundPixels = true;
    }

    return playerSprite;
  }
  createSpritePokemon(pokedex:string){
    const pokemonSprite = this.createSprite(0,1,pokedex);
    this.createSpriteAnimationPokemon(pokedex);
    pokemonSprite.setDepth(SPRITE_DEPTH.WILD_POKEMON);
    pokemonSprite.visible = true;

    return pokemonSprite;
  }
  createSpritePet(pokedex:string){
    const petSprite = this.createSprite(0,1,pokedex);
    this.createSpriteAnimationPokemon(pokedex);
    petSprite.setDepth(SPRITE_DEPTH.PET);
    if(pokedex === '000'){petSprite.visible = false;}
    else{petSprite.visible = true;}
    return petSprite;
  }
  private createSpriteAnimationPlayer(spriteIndex:number){
    /* 
    {obj_type}_{index}_{behavior}_{direction}_{direction_index}
    obj_type: player | pokemon | npc | item
    index : 1~8 | 001~151 | 1~N | 1~N
    behavior: walk | run | ride | fishing | none
    direction: up,down,left,right | up,down,left,right | none
    direction_index: 1~2 | 1~3 | none
    */
    const playerFrameMovement = this.phaser.anims.generateFrameNames(IMAGE_KEY.PLAYER_MOVEMENT+`_${spriteIndex}`,{
      prefix:`player_movement-`,
      suffix:"",
      start:0,
      end:MAX_PLAYER_MOVEMENT_FRAME,
    });

    const playerCustomFrameWalkUp = [
      [playerFrameMovement[1],playerFrameMovement[0]],
      [playerFrameMovement[2],playerFrameMovement[0]]
    ];

    const playerCustomFrameWalkDown = [
      [playerFrameMovement[4],playerFrameMovement[3]],
      [playerFrameMovement[5],playerFrameMovement[3]]
    ];

    const playerCustomFrameWalkLeft = [
      [playerFrameMovement[7],playerFrameMovement[6]],
      [playerFrameMovement[8],playerFrameMovement[6]]
    ];

    const playerCustomFrameWalkRight = [
      [playerFrameMovement[10],playerFrameMovement[9]],
      [playerFrameMovement[11],playerFrameMovement[9]]
    ];
    const playerCustomFrameRunUp = [
      [playerFrameMovement[14],playerFrameMovement[12]],
      [playerFrameMovement[13],playerFrameMovement[12]],
      [playerFrameMovement[12],playerFrameMovement[12]]
    ];
    const playerCustomFrameRunDown = [
      [playerFrameMovement[16],playerFrameMovement[15]],
      [playerFrameMovement[17],playerFrameMovement[15]],
      [playerFrameMovement[15],playerFrameMovement[15]]
    ];
    const playerCustomFrameRunLeft = [
      [playerFrameMovement[19],playerFrameMovement[18]],
      [playerFrameMovement[20],playerFrameMovement[18]],
      [playerFrameMovement[18],playerFrameMovement[18]]
    ];
    const playerCustomFrameRunRight = [
      [playerFrameMovement[22],playerFrameMovement[21]],
      [playerFrameMovement[23],playerFrameMovement[21]],
      [playerFrameMovement[21],playerFrameMovement[21]]
    ];

    this.createAnimation(
      `player_${spriteIndex}_walk_up_1`,
      playerCustomFrameWalkUp[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_walk_up_2`,
      playerCustomFrameWalkUp[1],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_walk_down_1`,
      playerCustomFrameWalkDown[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_walk_down_2`,
      playerCustomFrameWalkDown[1],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_walk_left_1`,
      playerCustomFrameWalkLeft[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_walk_left_2`,
      playerCustomFrameWalkLeft[1],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_walk_right_1`,
      playerCustomFrameWalkRight[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_walk_right_2`,
      playerCustomFrameWalkRight[1],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );

    this.createAnimation(
      `player_${spriteIndex}_run_up_1`,
      playerCustomFrameRunUp[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_run_up_2`,
      playerCustomFrameRunUp[1],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_run_up_3`,
      playerCustomFrameRunUp[2],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    
    this.createAnimation(
      `player_${spriteIndex}_run_down_1`,
      playerCustomFrameRunDown[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_run_down_2`,
      playerCustomFrameRunDown[1],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_run_down_3`,
      playerCustomFrameRunDown[2],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );

    this.createAnimation(
      `player_${spriteIndex}_run_left_1`,
      playerCustomFrameRunLeft[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_run_left_2`,
      playerCustomFrameRunLeft[1],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_run_left_3`,
      playerCustomFrameRunLeft[2],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    
    this.createAnimation(
      `player_${spriteIndex}_run_right_1`,
      playerCustomFrameRunRight[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_run_right_2`,
      playerCustomFrameRunRight[1],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `player_${spriteIndex}_run_right_3`,
      playerCustomFrameRunRight[2],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
  }

  private createSpriteAnimationPokemon(pokedex:string){
    const pokemonFrames = this.phaser.anims.generateFrameNames(pokedex,{
      prefix:`size0-`,
      suffix:"",
      start:0,
      end:MAX_POKEMON_FRAME,
    });
    
    const pokemonCustomFrameMovementDown = [
      [pokemonFrames[0],pokemonFrames[1],pokemonFrames[2],pokemonFrames[3]],
    ];
    const pokemonCustomFrameMovementLeft = [
      [pokemonFrames[4],pokemonFrames[5],pokemonFrames[6],pokemonFrames[7]],
    ];
    const pokemonCustomFrameMovementRight = [
      [pokemonFrames[8],pokemonFrames[9],pokemonFrames[10],pokemonFrames[11]],
    ];
    const pokemonCustomFrameMovementUp = [
      [pokemonFrames[12],pokemonFrames[13],pokemonFrames[14],pokemonFrames[15]],
    ];

    this.createAnimation(
      `pokemon_${pokedex}_walk_down_1`,
      pokemonCustomFrameMovementDown[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `pokemon_${pokedex}_walk_left_1`,
      pokemonCustomFrameMovementLeft[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `pokemon_${pokedex}_walk_right_1`,
      pokemonCustomFrameMovementRight[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
    this.createAnimation(
      `pokemon_${pokedex}_walk_up_1`,
      pokemonCustomFrameMovementUp[0],
      DEFAULT_FRAMERATE,
      DEFAULT_DELAY
    );
  }

  private createAnimation(
    name: string,
    frames: Phaser.Types.Animations.AnimationFrame[],
    frameRate: number,
    delay: number
  ) {
      this.phaser.anims.create({
        key: name,
        frames: frames,
        frameRate: frameRate,
        repeat: -1,
        delay:delay,
        yoyo:false
    });
  }

  private createSprite(posX:number,posY:number,key:string){
    return this.phaser.add.sprite(posX,posY,key);
  }
  private addZeroPadding(index: number, zeroSize: number): string {
    const paddedIndex = index.toString().padStart(zeroSize, '0');
    return paddedIndex;
  }
}