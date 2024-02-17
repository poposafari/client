import {io} from 'socket.io-client';

export const enum EVENTS {
    PLAYER_DATA = "player-data",
    SEASONSCENE_END = "season-end",
    MOVEMENT = "movement",
    THROW = "throw",
    RIDE = "ride"
}

export const enum SOCKET_EVENTS {
    CURRENT_PLAYERS = "current-players",
    NEW_PLAYER = "new-player",
}

class EventManager extends Phaser.Events.EventEmitter {
    constructor() {
        super();
        this.socket = io('/game');
        this.registeredEvents = {
            [EVENTS.PLAYER_DATA]: new Phaser.Events.EventEmitter(),
            [EVENTS.MOVEMENT]: new Phaser.Events.EventEmitter(),
            [EVENTS.THROW]: new Phaser.Events.EventEmitter(),
            [EVENTS.SEASONSCENE_END]: new Phaser.Events.EventEmitter(),
        };
        this.registeredSocketEvents = {
            [EVENTS.MOVEMENT]: new Phaser.Events.EventEmitter(),
            [EVENTS.THROW]: new Phaser.Events.EventEmitter(),
        };
    }

    private registeredEvents: Record<string, Phaser.Events.EventEmitter>;
    private registeredSocketEvents: Record<string, Phaser.Events.EventEmitter>;

    private socket:any = null;

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