export const enum EVENTS {
    SEASONSCENE_FIN = "seasonscene-fin",
    INITIAL_PLAYER_DATA = "initial-player-data",
    ADD_PLAYER = "add-player",
    REMOVE_PLAYER = "remove-player",
    MOVEMENT_PLAYER = "movement-player",
    MOVEMENT_OTHERPLAYER = "movement-otherplayer",
    SAVE_PLAYER = "save-player",
    MOVEMENT_FINISH_PLAYER = "movement-finish-player",
    STAND_PLAYER = "stand-player",
    STAND_OTHER_PLAYER = "stand-other-player",
}

export const enum SOCKET_EVENTS {
    SEASON = "season",
    CONNECTED_PLAYERS = "connected-players",
    CONNECT_PLAYER = "connect-player",
    DISCONNECT_PLAYER = "disconnect-player",
    EMIT_MOVEMENT_PLAYER = "emit-movement-player",
    ON_MOVEMENT_PLAYER = "on-movement-player",
    EMIT_SAVE_PLAYER = "emit-save-player",
    EMIT_STAND_PLAYER = "emit-stand-player",
    ON_STAND_PLAYER = "on-stand-player"
}

class EventManager extends Phaser.Events.EventEmitter {
    constructor() {
        super();
        this.registeredEvents = {
            [EVENTS.SEASONSCENE_FIN]: new Phaser.Events.EventEmitter(),
            [EVENTS.INITIAL_PLAYER_DATA]: new Phaser.Events.EventEmitter(),
            [EVENTS.ADD_PLAYER]: new Phaser.Events.EventEmitter(),
            [EVENTS.REMOVE_PLAYER]: new Phaser.Events.EventEmitter(),
            [EVENTS.MOVEMENT_PLAYER]: new Phaser.Events.EventEmitter(),
            [EVENTS.MOVEMENT_OTHERPLAYER]: new Phaser.Events.EventEmitter(),
            [EVENTS.SAVE_PLAYER]: new Phaser.Events.EventEmitter(),
            [EVENTS.STAND_PLAYER]: new Phaser.Events.EventEmitter(),
            [EVENTS.STAND_OTHER_PLAYER]: new Phaser.Events.EventEmitter(),
        };
    }

    private registeredEvents: Record<string, Phaser.Events.EventEmitter>;

    triggerEvent(eventName: string, ...args: any[]) {
        if (this.registeredEvents[eventName]) {
            this.registeredEvents[eventName].emit(eventName,args);
        } else {
            console.error(`Event "${eventName}" is not registered.`);
        }
    }
    onEvent(eventName: string, listener: (...args: any[]) => void) {
        if (this.registeredEvents[eventName]) {
            this.registeredEvents[eventName].on(eventName, listener);
        } else {
            console.error(`Event "${eventName}" is not registered.`);
        }
    }
}

export default new EventManager();