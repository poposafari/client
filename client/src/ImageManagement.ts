import { Direction } from "./Direction";

export class ImageManagement{
    constructor(
        private phaser: Phaser.Scene
    ){}
    private readonly MAX_PLAYER_SPRITE = 8;
    private readonly MAX_POKEMON = 50;
    private readonly DEFAULT_FRAMERATE = 6;
    private readonly DEFAULT_DELAY = 0;
    private readonly PLAYER_FRAME_MAX = 23;
    private readonly POKEMON_FRAME_MAX = 15;
    private playerPokemonIndex:string = null;
    private itemIndex:string = null;

    public map:Phaser.Tilemaps.Tilemap;
    public playerSprite: Phaser.GameObjects.Sprite;
    public otherPlayerSprite: Phaser.GameObjects.Sprite;
    public otherPlayerSprites: object={};
    public petSprite: Phaser.GameObjects.Sprite;
    public otherPetSprite: Phaser.GameObjects.Sprite;
    public otherPetSprites: object={};
    public pokemonSprite: Phaser.GameObjects.Sprite;
    public itemSprite: Phaser.GameObjects.Sprite;

    private playerFrames: Phaser.Types.Animations.AnimationFrame[];
    private playerCustomFrameWalkUp: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameWalkDown: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameWalkLeft: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameWalkRight: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameRunUp: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameRunDown: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameRunLeft: Phaser.Types.Animations.AnimationFrame[][];
    private playerCustomFrameRunRight: Phaser.Types.Animations.AnimationFrame[][];

    private pokemonFrames: Phaser.Types.Animations.AnimationFrame[];
    private pokemonCustomFrameMovementDown: Phaser.Types.Animations.AnimationFrame[][];
    private pokemonCustomFrameMovementLeft: Phaser.Types.Animations.AnimationFrame[][];
    private pokemonCustomFrameMovementRight: Phaser.Types.Animations.AnimationFrame[][];
    private pokemonCustomFrameMovementUp: Phaser.Types.Animations.AnimationFrame[][];

    loadMapImage(){
        this.phaser.load.image("nature_1","assets/map/nature_1.png");
        this.phaser.load.tilemapTiledJSON("test-town-map","assets/map/test_map_grid.json");
    }
    loadPlayerImage(){
      for(let i=1;i<=this.MAX_PLAYER_SPRITE;i++){
        this.phaser.load.atlas(`player_${i}_movement`,`assets/player/player_${i}_movement.png`,`assets/player/player_movement.json`);
        // this.phaser.load.atlas(`player_bike`,`assets/player/player_${i}_bike.png`,`assets/player/player_bike.json`);
        // this.phaser.load.atlas(`player_surf`,`assets/player/player_${i}_surf.png`,`assets/player/player_surf.json`);
        // this.phaser.load.atlas(`player_fishing`,`assets/player/player_${i}_fishing.png`,`assets/player/player_fishing.json`);
      }
    }
    loadItemImage(){
        for(let i=0;i<4;i++){
            this.phaser.load.image(`item_${i}_ground`,`assets/item/item_${i}_ground.png`);
            this.phaser.load.image(`item_${i}_thrown`,`assets/item/item_${i}_thrown.png`);
        }
    }
    loadPokemonImage(){
        for(let i=0;i<=this.MAX_POKEMON;i++){
            const index = this.addZeroPadding(i,3);
            this.phaser.load.atlas(`${index}`,`assets/pokemon/${index}.png`,`assets/pokemon/size_0.json`);
            this.phaser.load.atlas(`${index}s`,`assets/pokemon/${index}s.png`,`assets/pokemon/size_0.json`);
            
        }
    }
    loadPlayerAnimation(){
      for(let i=1;i<=this.MAX_PLAYER_SPRITE;i++){
        this.createPlayerSpriteAnimation(`player_${i}_movement`);
      } 
    }
    loadPokemonAnimation(){
      for(let i=0;i<=this.MAX_POKEMON;i++){
        const index = this.addZeroPadding(i,3);
        this.createPokemonSpriteAnimation(`${index}`);
      }
    }
    createMap(){
        this.map = this.phaser.make.tilemap({ key: "test-town-map" })
        this.map.addTilesetImage("nature_1", "nature_1");
        this.map.createLayer(0,"nature_1",0,0);
        this.map.createLayer(1,"nature_1",0,0);
    }
    createPlayerSprite(sprite_key: string){
        this.playerSprite = this.createSprite(0,0,`${sprite_key}`);
        this.playerSprite.scale = 2;
        this.playerSprite.setDepth(0);
        this.phaser.cameras.main.startFollow(this.playerSprite);
        this.phaser.cameras.main.roundPixels = true;
        return this.playerSprite;
    }
    createOtherPlayerSprite(sprite_key: string){
      this.otherPlayerSprite = this.createSprite(0,0,`${sprite_key}`);
      this.otherPlayerSprite.scale=2;
      this.otherPlayerSprite.setDepth(0);
      return this.otherPlayerSprite;
    }
    createPokemonSprite(index: string){
      this.pokemonSprite = this.createSprite(0,1,index);
      this.pokemonSprite.setDepth(0);
      this.pokemonSprite.visible = true;
      return this.pokemonSprite;
    }
    createPetSprite(pokedex: string){
      this.petSprite = this.createSprite(0,1,`${pokedex}`);
      this.petSprite.setDepth(1);
      if(pokedex === '000'){this.petSprite.visible = false;}
      else{this.petSprite.visible = true;}
      return this.petSprite;
    }
    private createPlayerSpriteAnimation(index: string){
        this.playerFrames = this.phaser.anims.generateFrameNames(`${index}`,{
            prefix:`player_movement-`,
            suffix:"",
            start:0,
            end:this.PLAYER_FRAME_MAX,
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

        this.createAnimation(
            Direction.PLAYER_WALK_UP_1, 
            this.playerCustomFrameWalkUp[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_WALK_UP_2, 
            this.playerCustomFrameWalkUp[1],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_WALK_DOWN_1, 
            this.playerCustomFrameWalkDown[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_WALK_DOWN_2, 
            this.playerCustomFrameWalkDown[1],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_WALK_LEFT_1, 
            this.playerCustomFrameWalkLeft[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_WALK_LEFT_2, 
            this.playerCustomFrameWalkLeft[1],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_WALK_RIGHT_1, 
            this.playerCustomFrameWalkRight[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_WALK_RIGHT_2, 
            this.playerCustomFrameWalkRight[1],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
  
      //sprite(player) run frames.
          this.createAnimation(
            Direction.PLAYER_RUN_UP_1, 
            this.playerCustomFrameRunUp[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_RUN_UP_2, 
            this.playerCustomFrameRunUp[1],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_RUN_UP_3, 
            this.playerCustomFrameRunUp[2],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
      
          this.createAnimation(
            Direction.PLAYER_RUN_DOWN_1, 
            this.playerCustomFrameRunDown[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_RUN_DOWN_2, 
            this.playerCustomFrameRunDown[1],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_RUN_DOWN_3, 
            this.playerCustomFrameRunDown[2],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
  
          this.createAnimation(
            Direction.PLAYER_RUN_LEFT_1, 
            this.playerCustomFrameRunLeft[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_RUN_LEFT_2, 
            this.playerCustomFrameRunLeft[1],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_RUN_LEFT_3, 
            this.playerCustomFrameRunLeft[2],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
      
          this.createAnimation(
            Direction.PLAYER_RUN_RIGHT_1, 
            this.playerCustomFrameRunRight[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_RUN_RIGHT_2, 
            this.playerCustomFrameRunRight[1],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.PLAYER_RUN_RIGHT_3, 
            this.playerCustomFrameRunRight[2],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
    }
    createPokemonSpriteAnimation(index:string){
        this.pokemonFrames = this.phaser.anims.generateFrameNames(index,{
            prefix:`size0-`,
            suffix:"",
            start:0,
            end:this.POKEMON_FRAME_MAX,
        });
        this.pokemonCustomFrameMovementDown = [
            [this.pokemonFrames[0],this.pokemonFrames[1],this.pokemonFrames[2],this.pokemonFrames[3]],
        ];
        this.pokemonCustomFrameMovementLeft = [
            [this.pokemonFrames[4],this.pokemonFrames[5],this.pokemonFrames[6],this.pokemonFrames[7]],
        ];
        this.pokemonCustomFrameMovementRight = [
            [this.pokemonFrames[8],this.pokemonFrames[9],this.pokemonFrames[10],this.pokemonFrames[11]],
        ];
        this.pokemonCustomFrameMovementUp = [
            [this.pokemonFrames[12],this.pokemonFrames[13],this.pokemonFrames[14],this.pokemonFrames[15]],
        ];
        this.createAnimation(
            Direction.POKEMON_DOWN, 
            this.pokemonCustomFrameMovementDown[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.POKEMON_LEFT, 
            this.pokemonCustomFrameMovementLeft[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.POKEMON_RIGHT, 
            this.pokemonCustomFrameMovementRight[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
          this.createAnimation(
            Direction.POKEMON_UP, 
            this.pokemonCustomFrameMovementUp[0],
            this.DEFAULT_FRAMERATE,
            this.DEFAULT_DELAY
          );
    }
    createItemSprite(index:string){
        this.itemSprite = this.createSprite(0,0,`${index}`);
        this.itemSprite.setDepth(0);
        this.itemSprite.visible = true;
        return this.itemSprite;
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
    getPlayerPokemonIndex(){
        return this.playerPokemonIndex;
    }
    createSprite(posX:number,posY:number,key:string){
        return this.phaser.add.sprite(posX,posY,key);
    }
    private addZeroPadding(index: number, zeroSize: number): string {
        const paddedIndex = index.toString().padStart(zeroSize, '0');
        return paddedIndex;
    }
}