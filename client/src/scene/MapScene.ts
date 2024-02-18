export class MapScene extends Phaser.Scene{
    constructor(){super({key:'MapScene'})}

    private map:Phaser.Tilemaps.Tilemap;

    create(data:object){
        this.map = data['im'].createMap();
    }
    getMap():Phaser.Tilemaps.Tilemap{
        return this.map;
    }
}