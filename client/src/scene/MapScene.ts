export class MapScene extends Phaser.Scene{
    constructor(){
        super({key:'MapScene'});
        console.log('MapScene constructor');
    }

    static map:Phaser.Tilemaps.Tilemap;

    create(data:object){
        console.log('MapScene create');
        MapScene.map = data['im'].createMap();
    }
}