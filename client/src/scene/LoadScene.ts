// import axios from "axios";

// // import { Player } from "../Player";

// //#74CEFB - summer
// //B7E763 - spring
// //FDAC7D - autumn
// //E5D2E1 - winter

// export class LoadScene extends Phaser.Scene{
//     constructor(){
//         super({key:'LoadScene'});

//         this.textManagement = new TextManagement(this);
//         this.animationManagement = new AnimationManagement(this);
//     }

//     private seasonTextChinese: Phaser.GameObjects.Text;
//     private seasonText: Phaser.GameObjects.Text;
//     private textManagement: TextManagement;
//     private animationManagement: AnimationManagement;
//     private imageManagement: ImageManagement;
//     private playerManagement: PlayerManagement;

//     async init(){
//         this.seasonTextChinese = this.textManagement.createText(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 - 25,'冬','Bold 70px Arial','#FFFFFF');
//         this.seasonText = this.textManagement.createText(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 + 25,'Winter','Bold 30px Arial','#E5D2E1');
//         this.seasonText.setOrigin(0.5,0.5);
//         this.seasonText.alpha = 0;
//         this.seasonTextChinese.setOrigin(0.5,0.5);
//         this.seasonTextChinese.alpha = 0;

//         try{
//             const res = await axios.get('http://localhost:8081/game/user-info');
//             console.log(res.data[0]);
//             // EventManager.triggerEvent(EVENTS.PLAYER_DATA,res.data[0]);
//             // // EventManager.socketEvent();
//             // this.playerManagement.setPlayerInfo(null,res.data[0]);
//         }catch(error){
//             console.error(error);
//         }
//     }
//     preload(){
//         this.imageManagement.loadMapImage();
//         this.imageManagement.loadPlayerImage();
//         this.imageManagement.loadItemImage();
//         this.imageManagement.loadPokemonImage();

//         this.load.on('progress',()=>{
//             this.animationManagement.fade([this.seasonText,this.seasonTextChinese],1,1000,null);
//         });

//         this.load.on('complete',()=>{
//             setTimeout(()=>{
//                 this.animationManagement.fade([this.seasonText,this.seasonTextChinese],0,2000,this.textDestory());
//             },1000);
//         });
//     }
//     private textDestory(){
//         this.seasonText.destroy();
//         this.seasonTextChinese.destroy();
//         // this.scene.add('OverworldScene',OverworldScene);
//         // this.scene.start('OverworldScene');
//     }
// }