import type { SaveData } from './SaveManager';
import { createDefaultSave, SaveManager } from './SaveManager';

/** 全局游戏状态 */
export class GameManager {
  private static instance: GameManager;
  public state: SaveData;

  private constructor() {
    this.state = createDefaultSave();
  }

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /** 初始化：尝试加载存档，无存档则新建 */
  init(): void {
    const saved = SaveManager.load();
    this.state = saved ?? createDefaultSave();
  }

  /** 保存当前状态 */
  save(): void {
    SaveManager.save(this.state);
  }

  /** 新游戏 */
  newGame(): void {
    this.state = createDefaultSave();
    SaveManager.save(this.state);
  }

  get gold(): number { return this.state.gold; }
  set gold(v: number) { this.state.gold = Math.max(0, v); }

  get reputation(): number { return this.state.reputation; }
  set reputation(v: number) { this.state.reputation = Math.max(0, v); }

  get day(): number { return this.state.day; }
  set day(v: number) { this.state.day = v; }
}
