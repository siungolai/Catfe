import type { Recipe } from '../data/recipes';

/** 原料品级 → 分数 (0-1) */
const GRADE_SCORE: Record<string, number> = {
  '普通': 0.3,
  '精品': 0.6,
  '有机': 0.6,
  '香草': 0.3,  // 风味糖浆同普通
  '焦糖': 0.3,
  '竞标级': 1.0,
};

/** 品质评级输入 */
export interface QualityInput {
  recipe: Recipe;
  /** 顾客耐心剩余比例 0-1 */
  patienceRatio: number;
  /** 吧台区是否有猫 */
  hasBarCat: boolean;
  /** 咖啡机等级 1-5 */
  equipmentLevel: number;
}

/** 品质评级结果 */
export interface QualityResult {
  stars: number;          // 1-5
  priceMultiplier: number; // 售价倍率
  breakdown: {
    ingredient: number;   // 原料分
    timing: number;       // 时机分
    catBonus: number;     // 猫咪分
    equipment: number;    // 设备分
  };
}

/** 原料品质得分 (加权平均 0-1) */
function calcIngredientScore(recipe: Recipe): number {
  if (recipe.ingredients.length === 0) return 0;
  const sum = recipe.ingredients.reduce((acc, ing) => {
    return acc + (GRADE_SCORE[ing.grade] ?? 0.3);
  }, 0);
  return sum / recipe.ingredients.length;
}

/** 设备等级 → 品质加成 (Lv1=0.25, Lv5=0.75) */
function calcEquipmentScore(level: number): number {
  return 0.25 + (level - 1) * 0.125; // 0.25, 0.375, 0.5, 0.625, 0.75
}

/** 总分 → 星级 (1-5) */
function scoreToStars(score: number): number {
  if (score >= 0.80) return 5;
  if (score >= 0.60) return 4;
  if (score >= 0.40) return 3;
  if (score >= 0.20) return 2;
  return 1;
}

/**
 * 计算一杯咖啡的品质评级
 */
export function calcQuality(input: QualityInput): QualityResult {
  const ingredient = calcIngredientScore(input.recipe);
  const timing = Math.max(0, Math.min(1, input.patienceRatio));
  const catBonus = input.hasBarCat ? 0.5 : 0;
  const equipment = calcEquipmentScore(input.equipmentLevel);

  // 加权总分
  const total = ingredient * 0.4 + timing * 0.3 + catBonus * 0.2 + equipment * 0.1;

  const stars = scoreToStars(total);
  const priceMultiplier = 1 + stars * 0.2;

  return { stars, priceMultiplier, breakdown: { ingredient, timing, catBonus, equipment } };
}

/** 获取星星的文本（填充/空心混合） */
export function starsText(stars: number): string {
  return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
}

/** 连续 5 星计数器 — 达到 5 次触发完美状态 */
export function checkPerfectStreak(streak: number, stars: number): { newStreak: number; triggered: boolean } {
  const newStreak = stars === 5 ? streak + 1 : 0;
  return { newStreak, triggered: newStreak >= 5 };
}
