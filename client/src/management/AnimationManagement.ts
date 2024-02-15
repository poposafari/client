export class AnimationManagement{
    constructor(
        private scene: Phaser.Scene
    ){}

    public fade(targets: any, isInOrOut: number,duration:number,callback:any):Phaser.Tweens.Tween{
        return this.scene.tweens.add({
            targets:targets,
            alpha:isInOrOut,
            duration: duration,
            ease: 'Linear',
            onComplete:()=>{
                callback;
            }
        });
    }
}