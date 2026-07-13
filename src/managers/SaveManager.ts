import { STORAGE_KEY } from '../utils/constants';
import type { Cat } from '../data/cats';
import { DEFAULT_CATS } from '../data/cats';
import type { Recipe } from '../data/recipes';
import { DEFAULT_RECIPES } from '../data/recipes';

/** 游戏存档结构 */
export interface SaveData {
  version: number;
  gold: number;
  reputation: number;
  day: number;
  cats: Cat[];
  unlockedRecipes: string[];
  unlockedAreas: string[];
  equipment: Record<string, number>;
  lastSaved: number;
}

export function createDefaultSave(): SaveData {
  return {
    version: 1,
    gold: 500,
    reputation: 0,
    day: 1,
    cats: DEFAULT_CATS.map(c => ({ ...c })),
    unlockedRecipes: DEFAULT_RECIPES.filter(r => r.unlocked).map(r => r.id),
    unlockedAreas: ['hall', 'bar'],
    equipment: { coffee_machine: 1, grinder: 1, fridge: 1 },
    lastSaved: Date.now(),
  };
}

export class SaveManager {
  static save(data: SaveData): void {
    data.lastSaved = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  static load(): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SaveData;
    } catch {
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
