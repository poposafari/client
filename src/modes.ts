import { HttpStatusCode } from 'axios';
import i18next from 'i18next';
import { MODE } from './enums/mode';
import { Account, Message } from './interface/sys';
import { MessageManager, ModeManager } from './managers';
import { Mode } from './mode';
import { InGameScene } from './scenes/ingame-scene';
import { OverworldUi } from './ui/overworld-test-ui';
import { OverworldMenuUi } from './ui/overworld-menu-ui';
import { Overworld000 } from './ui/overworld-000';
import { OVERWORLD_TYPE } from './enums/overworld-type';
import { Overworld011 } from './ui/overworld-011';
import { Bag, ItemCategory } from './storage/bag';
import { OverworldItemSlotUi } from './ui/overworld-itemslot-ui';
import { Location, PlayerInfo } from './storage/player-info';
import { OverworldHUDUi } from './ui/overworld-hud-ui';
import { OverworldInfo } from './storage/overworld-info';
import { BattleUi } from './ui/battle-ui';
import { PokeBoxUi } from './ui/pokebox-ui';
import { Box } from './storage/box';
import { BagUi } from './ui/bag-ui';
import { ShopUi } from './ui/shop-ui';
import { SafariListUi } from './ui/safari-list-ui';
import { LoginUi } from './ui/login-ui';
import { RegisterUi } from './ui/register-ui';
import { autoLoginApi, deleteAccountApi, getItemsApi, ingameApi, loginApi, logoutApi, nicknameApi, registerApi } from './utils/axios';
import { TitleUi } from './ui/title-ui';
import { NewGameUi } from './ui/newgame-ui';
import { runFadeEffect } from './ui/ui';
import { checkOverworldType } from './data/overworld';
import { AUDIO } from './enums/audio';
import { OverworldLocationUi } from './ui/overworld-location-ui';

export class NoneMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  init(): void {
    for (const ui of this.uis) {
      ui.setup();
    }
  }

  async enter(): Promise<void> {
    await autoLoginApi()
      .then(async () => {
        const res = await ingameApi();
        if (res) {
          this.changeMode(MODE.TITLE);
        } else {
          this.changeMode(MODE.NEWGAME);
        }
      })
      .catch((err: any) => {
        this.changeMode(MODE.LOGIN);
      });
  }

  exit(): void {}

  update(): void {}
}

export class LoginMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  init(): void {
    this.uis.push(new LoginUi(this.scene, this));

    for (const ui of this.uis) {
      ui.setup();
    }
  }

  enter(): void {
    this.scene.sound.get(AUDIO.MENU).play();
    this.addUiStackOverlap('LoginUi');
  }

  exit(): void {
    for (const ui of this.uiStack) {
      ui.clean();
    }
    this.cleanUiStack();
  }

  update(): void {}

  changeRegisterMode() {
    this.changeMode(MODE.REGISTER);
  }

  async submit(username: string, password: string): Promise<void> {
    let res;
    try {
      res = await loginApi({ username, password });
    } catch (err: any) {
      const status = err.status as HttpStatusCode;
      const message = MessageManager.getInstance();
      if (status === 404) {
        await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:accountEmpty3') }]);
      } else {
        await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:registerError5') }]);
      }
    } finally {
      if (res) this.changeMode(MODE.TITLE);
    }
  }
}

export class RegisterMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  init(): void {
    this.uis.push(new RegisterUi(this.scene, this));

    for (const ui of this.uis) {
      ui.setup();
    }
  }

  enter(): void {
    this.scene.sound.get(AUDIO.MENU).play();
    this.addUiStackOverlap('RegisterUi');
  }

  exit(): void {
    for (const ui of this.uiStack) {
      ui.clean();
    }
    this.cleanUiStack();
  }

  update(): void {}

  changeLoginMode() {
    this.changeMode(MODE.LOGIN);
  }

  async submit(username: string, password: string): Promise<void> {
    let res;
    try {
      res = await registerApi({ username, password });
    } catch (err: any) {
      const status = err.status as HttpStatusCode;
      const message = MessageManager.getInstance();
      if (status === 409) {
        await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:registerError4') }]);
      } else {
        await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:registerError5') }]);
      }
    } finally {
      if (res) this.changeMode(MODE.NEWGAME);
    }
  }
}

export class TitleMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  init(): void {
    this.uis.push(new TitleUi(this.scene, this));

    for (const ui of this.uis) {
      ui.setup();
    }
  }

  async enter(): Promise<void> {
    try {
      const res = await ingameApi();
      PlayerInfo.getInstance().setup(res);
      runFadeEffect(this.scene, 500, 'in');
      this.addUiStackOverlap('TitleUi');
    } catch (err: any) {
      const message = MessageManager.getInstance();

      await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:unexpectedError') }]);
    }
  }

  exit(): void {
    for (const ui of this.uiStack) {
      ui.clean();
    }
    this.cleanUiStack();
  }

  update(): void {}

  changeLoginMode() {
    this.changeMode(MODE.LOGIN);
  }

  async logout() {
    await logoutApi();
    this.changeLoginMode();
  }

  async deleteAccount() {
    const message = MessageManager.getInstance();
    try {
      await deleteAccountApi();
      await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:accountDelete4') }]);
      await this.logout();
    } catch (err: any) {
      await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:unexpectedError') }]);
    }
  }

  changeOverworldMode() {
    this.changeMode(MODE.OVERWORLD);
  }
}

export class NewGameMode extends Mode {
  constructor(scene: InGameScene) {
    super(scene);
  }

  init(): void {
    this.uis.push(new NewGameUi(this.scene, this));

    for (const ui of this.uis) {
      ui.setup();
    }
  }

  enter(): void {
    this.addUiStackOverlap('NewGameUi');
  }

  exit(): void {
    for (const ui of this.uiStack) {
      ui.clean();
    }
    this.cleanUiStack();
  }

  update(): void {}

  async submit(nickname: string, gender: 'boy' | 'girl', avatar: '1' | '2' | '3' | '4') {
    let res;
    try {
      res = await nicknameApi({ nickname, gender, avatar });
    } catch (err: any) {
      const status = err.status as HttpStatusCode;
      const message = MessageManager.getInstance();
      if (status === 409) {
        await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:nicknameError3') }]);
      } else {
        await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:unexpectedError') }]);
      }
    } finally {
      console.log(res);
      if (res) {
        this.changeMode(MODE.TITLE);
      }
    }
  }
}

export class OverworldMode extends Mode {
  private currentOverworldUisIndex!: number;
  private overworldUiBlock: boolean;

  constructor(scene: InGameScene) {
    super(scene);

    this.overworldUiBlock = false;
  }

  init(): void {
    this.uis.push(new Overworld000(this.scene, this, OVERWORLD_TYPE.PLAZA));
    // this.uis.push(new Overworld011(this.scene, this, OVERWORLD_TYPE.SAFARI));
    this.uis.push(new OverworldHUDUi(this.scene, this));
    this.uis.push(new OverworldMenuUi(this.scene, this));
    this.uis.push(new BagUi(this.scene, this));
    this.uis.push(new PokeBoxUi(this.scene, this));

    for (const ui of this.uis) {
      ui.setup();
    }

    Bag.getInstance();
  }

  enter(): void {
    this.addUiStackOverlap('OverworldHUDUi');
    this.updateOverworld(PlayerInfo.getInstance().getLocation());
  }

  exit(): void {
    for (const ui of this.uiStack) {
      ui.clean();
    }
    this.cleanUiStack();
  }

  update(time: number, delta: number): void {
    if (this.uiStack.length <= 1) return;

    const hud = this.uiStack[this.currentOverworldUisIndex - 1];
    if (hud instanceof OverworldHUDUi) hud.updateInfoUi();

    if (this.overworldUiBlock) return;

    const overworld = this.uiStack[this.currentOverworldUisIndex];
    if (overworld instanceof OverworldUi) overworld.update(time, delta);
  }

  updateOverworld(key: string) {
    const playerData = PlayerInfo.getInstance();
    const overworldKey = key;
    const overworldType = checkOverworldType(playerData.getLocation());

    try {
      if (overworldType === OVERWORLD_TYPE.PLAZA) {
        //network plaza info.
      } else if (overworldType === OVERWORLD_TYPE.SAFARI) {
        //network safari info.
      } else {
        //network error.
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      const overworld = this.getUiStackTop();
      if (overworld instanceof OverworldUi) {
        overworld.clean();
        this.popUiStack();
      }
      if (overworld instanceof OverworldHUDUi) {
        overworld.showLocationUi(overworldKey);
      }
      this.addUiStackOverlap(`Overworld${overworldKey}`);
      this.currentOverworldUisIndex = this.uiStack.length - 1;
    }
  }

  setOverworldUiBlock(onoff: boolean) {
    onoff ? (this.overworldUiBlock = true) : (this.overworldUiBlock = false);
  }

  async getBag(category: ItemCategory) {
    const bag = Bag.getInstance();

    try {
      const res = await getItemsApi({ category: category });
      bag.setup(res);
    } catch (err: any) {
      const message = MessageManager.getInstance();
      await message.show(this.getUiStackTop(), [{ type: 'sys', format: 'talk', content: i18next.t('message:registerError5') }]);
    }
  }
}

// export class OverworldMode extends Mode {
//   private currentOverworldUisIndex!: number;

//   constructor(scene: InGameScene) {
//     super(scene);
//   }

//   init(): void {
//     this.uis.push(new Overworld000(this.scene, this, OVERWORLD_TYPE.PLAZA));
//     this.uis.push(new Overworld011(this.scene, this, OVERWORLD_TYPE.SAFARI));
//     this.uis.push(new OverworldHUDUi(this.scene, this));
//     this.uis.push(new OverworldMenuUi(this.scene, this));
//     this.uis.push(new OverworldItemSlotUi(this.scene, this));
//     this.uis.push(new SafariListUi(this.scene, this));
//     this.uis.push(new BagUi(this.scene, this));
//     this.uis.push(new BattleUi(this.scene, this));
//     this.uis.push(new PokeBoxUi(this.scene, this));
//     this.uis.push(new ShopUi(this.scene, this));

//     for (const ui of this.uis) {
//       ui.setup();
//     }
//   }

//   enter(data?: any): void {
//     const playerData = PlayerInfo.getInstance();
//     const overworldKey = playerData.getLocation();
//     const overworldType = checkOverworldType(playerData.getLocation());

//     try {
//       if (overworldType === OVERWORLD_TYPE.SAFARI) {
//       } else if (overworldType === OVERWORLD_TYPE.PLAZA) {
//       } else {
//         throw new Error(`Invalid overworld type: ${overworldType}`);
//       }

//       if (playerData.getLocation()) this.addUiStackOverlap('OverworldHUDUi', data);
//       this.addUiStackOverlap(`Overworld${overworldKey}`, data);

//       this.currentOverworldUisIndex = 1;
//     } catch (err: any) {}
//   }

//   exit(): void {
//     for (const ui of this.uiStack) {
//       ui.clean();
//     }
//     this.cleanUiStack();
//   }

//   update(time: number, delta: number): void {
//     const overworld = this.uiStack[this.currentOverworldUisIndex];
//     overworld.update(time, delta);

//     //TODO: 적절한 제어? overworldHUDUi가 들어올 경우, update가 실행되버린다.
//   }

//   updateOverworldInfoUi() {
//     const ui = this.getUiType('OverworldHUDUi');
//     if (ui instanceof OverworldHUDUi) {
//       ui.updateOverworldInfoUi();
//     }
//   }

//   updateOverworldLocationUi(location: Location) {
//     const ui = this.getUiType('OverworldHUDUi');
//     if (ui instanceof OverworldHUDUi) {
//       ui.updateOverworldLocationUi(location);
//     }
//   }

//   updateOverworld(key: string) {
//     const overworld = this.getUiStackTop() as OverworldUi;

//     overworld.clean();
//     this.popUiStack();

//     this.addUiStackOverlap(`Overworld${key}`);
//   }

//   changeTitleMode() {
//     this.changeMode(MODE.TITLE);
//   }

//   moveToVillage() {
//     this.getUiStackTop().clean();
//     this.popUiStack();
//     this.addUiStackOverlap(`Overworld000`, { x: 7, y: 8 });
//   }

//   async startMessage(data: Message[]) {
//     const overworld = this.getUiStackTop();

//     this.pauseOverworldSystem(true);

//     const message = MessageManager.getInstance();
//     const ret = await message.show(overworld, data);

//     this.pauseOverworldSystem(false);

//     return ret;
//   }

//   pauseOverworldSystem(onoff: boolean) {
//     const overworldHUDUi = this.getUiType('OverworldHUDUi');
//     const overworld = this.getUiStackTop() as OverworldUi;

//     if (overworldHUDUi && overworld) {
//       overworldHUDUi.pause(onoff ? true : false);
//       overworld.pause(onoff ? true : false);
//     }
//   }
// }
