/** 饮品配方数据结构 */
export interface Ingredient {
  name: string;
  grade: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: '黑咖啡' | '奶咖' | '风味特调' | '非咖啡';
  tier: '基础' | '进阶' | '大师';
  ingredients: Ingredient[];
  duration: number; // 秒
  basePrice: number;
  unlocked: boolean;
}

/** 初始解锁的 10 款饮品 */
export const DEFAULT_RECIPES: Recipe[] = [
  // 黑咖啡系
  { id: 'americano', name: '美式', category: '黑咖啡', tier: '基础', ingredients: [{ name: '咖啡豆', grade: '普通' }], duration: 5, basePrice: 18, unlocked: true },
  { id: 'cold_brew', name: '冷萃', category: '黑咖啡', tier: '基础', ingredients: [{ name: '咖啡豆', grade: '精品' }], duration: 5, basePrice: 22, unlocked: true },
  { id: 'espresso', name: '浓缩', category: '黑咖啡', tier: '基础', ingredients: [{ name: '咖啡豆', grade: '普通' }], duration: 5, basePrice: 15, unlocked: true },
  // 奶咖系
  { id: 'latte', name: '拿铁', category: '奶咖', tier: '基础', ingredients: [{ name: '咖啡豆', grade: '普通' }, { name: '牛奶', grade: '普通' }], duration: 8, basePrice: 25, unlocked: true },
  { id: 'cappuccino', name: '卡布奇诺', category: '奶咖', tier: '基础', ingredients: [{ name: '咖啡豆', grade: '普通' }, { name: '牛奶', grade: '普通' }], duration: 8, basePrice: 25, unlocked: true },
  { id: 'flat_white', name: '澳白', category: '奶咖', tier: '进阶', ingredients: [{ name: '咖啡豆', grade: '精品' }, { name: '牛奶', grade: '有机' }], duration: 8, basePrice: 30, unlocked: true },
  // 风味特调
  { id: 'caramel_macchiato', name: '焦糖玛奇朵', category: '风味特调', tier: '基础', ingredients: [{ name: '咖啡豆', grade: '普通' }, { name: '牛奶', grade: '普通' }, { name: '风味糖浆', grade: '香草' }], duration: 8, basePrice: 28, unlocked: true },
  { id: 'mocha', name: '摩卡', category: '风味特调', tier: '基础', ingredients: [{ name: '咖啡豆', grade: '普通' }, { name: '牛奶', grade: '普通' }, { name: '风味糖浆', grade: '焦糖' }], duration: 8, basePrice: 28, unlocked: true },
  // 非咖啡类
  { id: 'hot_choco', name: '热巧克力', category: '非咖啡', tier: '基础', ingredients: [{ name: '牛奶', grade: '普通' }], duration: 5, basePrice: 20, unlocked: true },
  { id: 'matcha_latte', name: '抹茶拿铁', category: '非咖啡', tier: '基础', ingredients: [{ name: '牛奶', grade: '普通' }], duration: 5, basePrice: 22, unlocked: true },
];
