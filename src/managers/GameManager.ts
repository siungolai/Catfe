import type { SaveData } from './SaveManager';
import { createDefaultSave, SaveManager } from './SaveManager';

/** 完美状态持续时间（秒） */
const PERFECT_DURATION = 10;

/** 全局游戏状态 */
export class GameManager {
  private static instance: GameManager;
  public state: SaveData;

  /** 完美状态是否激活（运行时，不存档） */
  perfActive = false;
  private perfTimer = 0;
  /** 当前所有技能效果额外倍率 */
  skillBoost = 1;

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
    // 老存档兼容（v1 无 perfectStreak）
    if (this.state.perfectStreak === undefined) {
      this.state.perfectStreak = 0;
    }
  }

  /** 保存当前状态 */
  save(): void {
    SaveManager.save(this.state);
  }

  /** 新游戏 */
  newGame(): void {
    this.state = createDefaultSave();
    this.perfActive = false;
    this.perfTimer = 0;
    this.skillBoost = 1;
    SaveManager.save(this.state);
  }

  get gold(): number { return this.state.gold; }
  set gold(v: number) { this.state.gold = Math.max(0, v); }

  get reputation(): number { return this.state.reputation; }
  set reputation(v: number) { this.state.reputation = Math.max(0, v); }

  get day(): number { return this.state.day; }
  set day(v: number) { this.state.day = v; }

  get equipmentLevel(): number {
    return this.state.equipment?.coffee_machine ?? 1;
  }

  /** 提交星级，检查是否需要触发完美状态，返回是否刚触发 */
  submitStars(stars: number): boolean {
    if (stars === 5) {
      this.state.perfectStreak++;
      if (this.state.perfectStreak >= 5) {
        this.state.perfectStreak = 0;
        this.perfActive = true;
        this.perfTimer = PERFECT_DURATION;
        this.skillBoost = 1.3;
        return true;
      }
    } else {
      this.state.perfectStreak = 0;
    }
    return false;
  }

  /** 每帧更新完美状态倒计时 */
  updatePerfect(dt: number): void {
    if (this.perfActive) {
      this.perfTimer -= dt;
      if (this.perfTimer <= 0) {
        this.perfActive = false;
        this.skillBoost = 1;
      }
    }
  }
}
