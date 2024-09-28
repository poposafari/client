import { KEYBOARD } from "../enums/keyboard";
import { Mode } from "../mode";
import { InGameScene } from "../scenes/ingame-scene";

export class InputManager{
    private scene: InGameScene;
    public keyMappings: { [key in KEYBOARD]?: Phaser.Input.Keyboard.Key };

    constructor(scene:InGameScene){
        this.scene = scene;
        this.keyMappings = {};

        this.setup();
    }

    setup(){
        //util
        this.keyMappings[KEYBOARD.SELECT] = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X,false);
        this.keyMappings[KEYBOARD.CANCEL] = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z,false);
        
        //direction
        this.keyMappings[KEYBOARD.UP] = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP,false);
        this.keyMappings[KEYBOARD.DOWN] = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN,false);
        this.keyMappings[KEYBOARD.LEFT] = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT,false);
        this.keyMappings[KEYBOARD.RIGHT] = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT,false);

        this.scene.input.keyboard?.on('keydown', (event: Phaser.Input.Keyboard.Key) => {
            this.handleKeyInput(event);
        });
    }

    handleKeyInput(input: Phaser.Input.Keyboard.Key): void {
        const topMode = this.scene.modeStack[this.scene.modeStack.length - 1];
        const key = this.getKeyMapping(input.keyCode);

        if(key && this.keyMappings[key]){
            if(this.isDirectionKey(key)){
                if(this.isDirectionKeyDown() && this.isKeyAllowedByTopMode(key,topMode)){
                    topMode.ui.actionInput(key);
                }
            }else{
                if(this.isKeyJustDown(key) && this.isKeyAllowedByTopMode(key,topMode)){
                    topMode.ui.actionInput(key);
                }
            }
        }
    }

    private isKeyAllowedByTopMode(key: KEYBOARD, mode: Mode): boolean {
        return mode.ui.whitelistKey.includes(key);
    }

    private getKeyMapping(keyCode: number): KEYBOARD | undefined {
        return Object.keys(this.keyMappings).find(
            (key) => this.keyMappings[key as KEYBOARD]?.keyCode === keyCode
        ) as KEYBOARD | undefined;
    }

    private isDirectionKey(input: KEYBOARD): boolean {
        return [
            KEYBOARD.UP,
            KEYBOARD.DOWN,
            KEYBOARD.LEFT,
            KEYBOARD.RIGHT
        ].includes(input);
    }

    private isDirectionKeyDown(): boolean {
        return (
            this.keyMappings[KEYBOARD.UP]!.isDown ||
            this.keyMappings[KEYBOARD.DOWN]!.isDown ||
            this.keyMappings[KEYBOARD.LEFT]!.isDown ||
            this.keyMappings[KEYBOARD.RIGHT]!.isDown
        )
    }

    isKeyJustDown(key: KEYBOARD): boolean {
        return Phaser.Input.Keyboard.JustDown(this.keyMappings[key]!);
    }

    isKeyDown(key: KEYBOARD): boolean {
        return this.keyMappings[key]?.isDown ?? false;
    }
}