export class MapScene extends Phaser.Scene{
    constructor(){super({key:'MapScene'})}

    static map:Phaser.Tilemaps.Tilemap;

    create(data:object){
        MapScene.map = data['im'].createMap();
    }
}