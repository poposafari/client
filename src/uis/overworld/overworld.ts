import { OVERWORLD_TYPE } from '../../enums/overworld-type';
import { ModeHandler } from '../../handlers/mode-handler';
import { OverworldUi } from './overworld-ui';

export abstract class Overworld {
  protected ui!: OverworldUi;

  constructor(ui: OverworldUi) {
    this.ui = ui;
  }

  abstract setup(): void;
}
