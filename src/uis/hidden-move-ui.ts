import { GM } from '../core/game-manager';
import { DEPTH, EASE, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { getPokemonSpriteKey } from '../utils/string-util';
import { addImage, createSprite, Ui } from './ui';

export class HiddenMoveUi extends Ui {
  private container!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Image;
  private player!: Phaser.GameObjects.Sprite;
  private pokemon!: Phaser.GameObjects.Image;
  private particles: Phaser.GameObjects.Image[] = [];
  private particleTimerEvent!: Phaser.Time.TimerEvent;

  constructor(scene: InGameScene) {
    super(scene);
  }

  setup(data?: any): void {
    const width = this.getWidth();
    const height = this.getHeight();

    this.container = this.createContainer(width / 2, height / 2);
    this.bg = addImage(this.scene, TEXTURE.BG_HM, 0, 0);
    this.pokemon = addImage(this.scene, `pokemon_sprite0000`, 0, 0).setScale(4.8);
    this.player = createSprite(this.scene, TEXTURE.BLANK, -80, -80);
    this.player.setScale(4.4);

    this.container.add(this.bg);
    this.container.add(this.player);
    this.container.add(this.pokemon);

    this.container.setVisible(false);
    this.container.setDepth(DEPTH.TOP + 1);
    this.container.setScrollFactor(0);
  }

  async show(data: 'surf'): Promise<void> {
    const userData = GM.getUserData();
    const targetPokemon = GM.findSkillsInParty(data);

    if (!userData) return;
    if (!targetPokemon) return;

    const playerKey = `${userData.gender}_${userData.avatar}_hm`;
    this.pokemon.setTexture(getPokemonSpriteKey(targetPokemon));

    this.container.setVisible(true);

    const screenWidth = this.getWidth();
    const targetWidth = screenWidth;
    const startWidth = 10;

    this.bg.setDisplaySize(startWidth, 7);
    this.bg.setX(screenWidth);

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.bg,
        displayWidth: targetWidth,
        x: screenWidth - targetWidth,
        duration: 150,
        ease: EASE.LINEAR,
        delay: 0,
      });

      this.scene.tweens.add({
        targets: this.bg,
        displayHeight: 500,
        duration: 200,
        ease: EASE.LINEAR,
        delay: 200,
      });

      // 3. 플레이어 등장
      this.scene.time.delayedCall(300, () => {
        this.player.setTexture(playerKey);
        this.player.anims.play({
          key: playerKey,
          repeat: 0,
          frameRate: 10,
        });
      });

      this.showParticle();

      // 4. 포켓몬 등장
      this.pokemon.setX(1500);
      this.scene.tweens.add({
        targets: this.pokemon,
        x: 0,
        duration: 400,
        ease: EASE.QUINT_EASEOUT,
        delay: 800,
      });

      // 5. 포켓몬 퇴장
      this.scene.tweens.add({
        targets: this.pokemon,
        x: -1500,
        duration: 400,
        ease: EASE.QUINT_EASEIN,
        delay: 1300,
        onComplete: () => {
          this.stopParticle();
        },
      });

      // 6. 배경 축소 및 종료 (1400ms 이후)
      this.scene.tweens.add({
        targets: this.bg,
        displayHeight: 30,
        duration: 200,
        ease: EASE.LINEAR,
        delay: 1600,
        onComplete: () => {
          this.player.setTexture(TEXTURE.BLANK);
          this.player.stop();
          this.bg.setDisplaySize(startWidth, 0);
          resolve();
        },
      });
    });
  }

  clean(data?: any): void {
    this.container.setVisible(false);
  }

  pause(onoff: boolean, data?: any): void {}

  handleKeyInput(...data: any[]) {}

  update(time?: number, delta?: number): void {}

  private showParticle() {
    const bgRightEdge = this.bg.x + this.bg.displayWidth / 2;

    this.particleTimerEvent = this.scene.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        const isTop = Phaser.Math.Between(0, 1) === 0;
        const y = isTop ? Phaser.Math.Between(-200, -50) : Phaser.Math.Between(50, 200);
        const x = Phaser.Math.Between(-2000, -300);
        const texture = Phaser.Math.Between(0, 1) === 0 ? TEXTURE.PARTICLE_HM_0 : TEXTURE.PARTICLE_HM_1;

        const particle = addImage(this.scene, texture, x, y);
        particle.setScale(4.2);
        this.container.add(particle);
        this.particles.push(particle);

        const targetX = bgRightEdge + 200;
        const duration = 700;

        this.scene.tweens.add({
          targets: particle,
          x: targetX,
          duration,
          ease: EASE.LINEAR,
          onComplete: () => {
            particle.destroy();
          },
        });
      },
    });
  }

  private stopParticle() {
    this.particleTimerEvent.remove();

    for (const particle of this.particles) {
      this.scene.tweens.killTweensOf(particle);
      particle.destroy();
    }

    this.particles = [];
  }
}
