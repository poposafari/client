import { KEY } from './enums/key';
import { MODE } from './enums/mode';
import { Message, MyPokemon } from './interface/sys';
import { Mode } from './mode';
import { LoginMode, NewGameMode, NoneMode, OverworldMode, RegisterMode, TitleMode } from './modes';
import { InGameScene } from './scenes/ingame-scene';
import { MessageUi } from './ui/message-ui';
import { QuestionUi } from './ui/question-ui';
import { Ui } from './ui/ui';

interface Modes {
  key: MODE;
  value: Mode;
}

export class MessageManager {
  private static instance: MessageManager;
  private scene!: InGameScene;
  private messageUi!: MessageUi;
  private questionUi!: QuestionUi;
  private isMessageAcive: boolean = false;

  initialize(scene: InGameScene): void {
    this.scene = scene;
    this.messageUi = new MessageUi(scene);
    this.messageUi.setup();
    this.questionUi = new QuestionUi(scene);
    this.questionUi.setup();
  }

  static getInstance(): MessageManager {
    if (!MessageManager.instance) {
      MessageManager.instance = new MessageManager();
    }
    return MessageManager.instance;
  }

  async show(currentUi: Ui, messages: Message[]): Promise<boolean> {
    let ret = false;
    if (this.isMessageAcive) return ret;
    this.isMessageAcive = true;

    try {
      for (const msg of messages) {
        const result = await this.messageUi.show(msg);
        if (msg.format === 'question' && result) {
          ret = result;
        }
      }
    } finally {
      this.isMessageAcive = false;
      this.messageUi.pause(true);
      currentUi.pause(false);
    }

    return ret;
  }
}

type KeyCallback = (key: KEY) => void;

export class KeyboardManager {
  private static instance: KeyboardManager;
  private scene!: InGameScene;
  private allowKey: Map<KEY, Phaser.Input.Keyboard.Key> = new Map();
  private keyDownCallback!: KeyCallback;
  private keyUpCallback!: KeyCallback;

  static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  initialize(scene: InGameScene): void {
    this.scene = scene;
    this.scene.events.on('update', this.updateKeys, this);
  }

  setAllowKey(keys: KEY[]): void {
    this.allowKey.clear();

    keys.forEach((keyCode) => {
      const key = this.scene.input.keyboard?.addKey(keyCode);
      if (key) this.allowKey.set(keyCode, key);
    });
  }

  setKeyDownCallback(callback: KeyCallback): void {
    this.keyDownCallback = callback;
  }

  setKeyUpCallback(callback: KeyCallback): void {
    this.keyUpCallback = callback;
  }

  clearCallbacks(): void {
    this.keyDownCallback = undefined!;
    this.keyUpCallback = undefined!;
  }

  private updateKeys(): void {
    this.allowKey.forEach((key, keyCode) => {
      if (Phaser.Input.Keyboard.JustDown(key) && this.keyDownCallback) {
        this.keyDownCallback(keyCode);
      } else if (Phaser.Input.Keyboard.JustUp(key) && this.keyUpCallback) {
        this.keyUpCallback(keyCode);
      }
    });
  }
}

export class ModeManager {
  private scene: InGameScene;
  private modes: Modes[];
  private modeCache: Map<MODE, Mode> = new Map();
  private currentMode!: Mode;

  constructor(scene: InGameScene) {
    this.scene = scene;

    this.modes = [
      { key: MODE.NONE, value: new NoneMode(scene, this) },
      { key: MODE.LOGIN, value: new LoginMode(scene, this) },
      { key: MODE.REGISTER, value: new RegisterMode(scene, this) },
      { key: MODE.TITLE, value: new TitleMode(scene, this) },
      { key: MODE.NEWGAME, value: new NewGameMode(scene, this) },
      { key: MODE.OVERWORLD, value: new OverworldMode(scene, this) },
    ];
  }

  registerModes() {
    for (const mode of this.modes) {
      mode.value.init();
      this.modeCache.set(mode.key, mode.value);
    }
  }

  changeMode(mode: MODE) {
    if (this.currentMode) {
      this.currentMode.exit();
    }

    const targetMode = this.modeCache.get(mode);
    if (targetMode) {
      this.currentMode = targetMode;
      this.currentMode.enter();
    } else {
      console.error(`Mode ${mode} not found`);
    }
  }

  isOverworldMode(): boolean {
    return this.currentMode instanceof OverworldMode;
  }

  getCurrentMode() {
    return this.currentMode;
  }
}

export const MAX_PARTY_SLOT = 6;

export class PlayerPokemonManager {
  private static instance: PlayerPokemonManager;
  private myPokemons: Array<MyPokemon> = [];
  private myPokemonSlots: Array<number> = [];

  static getInstance(): PlayerPokemonManager {
    if (!PlayerPokemonManager.instance) {
      PlayerPokemonManager.instance = new PlayerPokemonManager();
    }
    return PlayerPokemonManager.instance;
  }

  init() {
    //TODO: axios로 데이터를 받아와야 한다.
    for (let i = 0; i < MAX_PARTY_SLOT; i++) {
      this.myPokemonSlots.push(-1);
    }

    this.addMyPokemon('001', '2024-12-25 09:10', true, 'b', -1);
    this.addMyPokemon('002', '2024-12-17 09:46', true, 'g', -1);
    this.addMyPokemon('003', '2024-12-20 09:10', true, 'b', -1);
    this.addMyPokemon('004', '2024-10-17 09:10', false, 'b', -1);
    this.addMyPokemon('005', '2024-12-17 09:10', false, 'g', -1);
    this.addMyPokemon('006', '2024-11-17 13:15', false, 'b', -1);
    this.addMyPokemon('007', '2024-12-17 09:10', false, 'b', -1);
    this.addMyPokemon('008', '2024-09-17 09:10', false, 'g', -1);
    this.addMyPokemon('009', '2024-12-17 09:10', false, 'b', -1);
    this.addMyPokemon('002', '2024-12-17 09:10', false, 'g', -1);

    this.addMyPokemon('002', '2024-04-17 09:10', false, 'g', -1);
    this.addMyPokemon('006', '2024-12-17 08:32', true, 'g', -1);
    this.addMyPokemon('001', '2024-06-17 09:10', false, 'g', -1);
    this.addMyPokemon('007', '2024-12-17 09:10', true, 'b', -1);
    this.addMyPokemon('005', '2024-02-17 10:30', true, 'b', -1);
    this.addMyPokemon('008', '2024-12-17 09:10', false, 'b', -1);
    this.addMyPokemon('003', '2024-12-17 09:10', false, 'b', -1);
    this.addMyPokemon('004', '2024-12-17 09:10', false, 'b', -1);
  }

  getMyPokemons() {
    if (this.myPokemons) return this.myPokemons;

    return [];
  }

  getMyPokemon(idx: number): MyPokemon {
    if (this.myPokemons[idx]) return this.myPokemons[idx];

    throw new Error('가지고 있지 않은 포켓몬인데요^^');
  }

  getMyPokemonKey(idx: number): string | '000' {
    if (idx < 0) return '000';
    const myPokemon = this.getMyPokemon(idx);
    let pokedex = myPokemon.idx;

    if (!myPokemon || !pokedex) return '000';
    if (myPokemon.isShiny) pokedex += 's';

    return pokedex;
  }

  getMyPokemonSlots() {
    if (this.myPokemonSlots) return this.myPokemonSlots;

    return [];
  }

  setMyPokemonSlot(idx: number, pokeIdx: number) {
    if (idx < 0) throw new Error('잘못된 인덱스임.^^');
    if (this.myPokemons[pokeIdx]) {
      this.myPokemons[pokeIdx].partySlot = idx;
      this.myPokemonSlots[idx] = pokeIdx;
    }
  }

  resetMyPokemonSlot(idx: number, pokeIdx: number) {
    if (idx < 0) throw new Error('잘못된 인덱스임.^^');
    if (this.myPokemons[pokeIdx]) {
      this.myPokemons[pokeIdx].partySlot = -1;
      this.myPokemonSlots[idx] = -1;
    }
  }

  addMyPokemon(key: string, capturedDate: string, isShiny: boolean, gender: string, partySlot: number) {
    this.myPokemons.push({
      idx: key,
      capturedDate: capturedDate,
      isShiny: isShiny,
      gender: gender,
      partySlot: partySlot,
    });
  }
}
