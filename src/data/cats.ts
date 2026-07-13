export type AreaType = 'bar' | 'seat' | 'cashier' | 'rest' | null;

export const AREA_LABELS: Record<string, string> = {
  bar: '吧台区',
  seat: '客座区',
  cashier: '收银区',
  rest: '休息区',
};

/** 技能节点 */
export interface SkillNode {
  name: string;
  level: number;
  maxLevel: number;
  description: string;
  area: AreaType;            // 该技能生效区域
  effectValue: number;       // 数值效果（百分比或秒数）
}

/** 猫咪 */
export interface Cat {
  id: string;
  name: string;
  species: string;
  rarity: '普通' | '稀有' | '传说';
  level: number;
  intimacy: number;
  energy: number;
  mood: number;
  personality: '粘人' | '胆小' | '调皮' | '慵懒' | '好奇';
  skills: SkillNode[];
  area: AreaType;
}

export const DEFAULT_CATS: Cat[] = [
  {
    id: 'dango', name: '团子', species: '橘猫', rarity: '普通',
    level: 5, intimacy: 2, energy: 100, mood: 80,
    personality: '慵懒',
    skills: [
      { name: '招财', level: 1, maxLevel: 3, description: '小费概率 +15%', area: 'cashier', effectValue: 0.15 },
      { name: '亲和力', level: 0, maxLevel: 1, description: '耐心消耗 -10%', area: 'seat', effectValue: 0.10 },
      { name: '双重天赋', level: 0, maxLevel: 1, description: '可同时指派两区', area: 'bar', effectValue: 0.7 },
    ],
    area: null,
  },
  {
    id: 'mocha', name: '摩卡', species: '黑猫', rarity: '普通',
    level: 5, intimacy: 2, energy: 100, mood: 85,
    personality: '粘人',
    skills: [
      { name: '安抚', level: 1, maxLevel: 3, description: '延长耐心 5 秒', area: 'seat', effectValue: 5 },
      { name: '夜色守护', level: 0, maxLevel: 1, description: '闭店精力恢复 +15%', area: 'rest', effectValue: 0.15 },
    ],
    area: null,
  },
  {
    id: 'huahua', name: '花花', species: '三花', rarity: '普通',
    level: 3, intimacy: 1, energy: 100, mood: 75,
    personality: '好奇',
    skills: [
      { name: '探索', level: 1, maxLevel: 2, description: '发现隐藏金币概率 +20%', area: 'seat', effectValue: 0.20 },
      { name: '人气', level: 0, maxLevel: 2, description: '稀有顾客出现率 +10%', area: 'cashier', effectValue: 0.10 },
    ],
    area: null,
  },
  {
    id: 'cloud', name: '云朵', species: '布偶', rarity: '稀有',
    level: 2, intimacy: 1, energy: 100, mood: 90,
    personality: '胆小',
    skills: [
      { name: '治愈', level: 1, maxLevel: 2, description: '顾客满意度 +15%', area: 'seat', effectValue: 0.15 },
      { name: '柔软', level: 0, maxLevel: 1, description: '闭店亲密度翻倍', area: 'rest', effectValue: 2 },
    ],
    area: null,
  },
  {
    id: 'lightning', name: '闪电', species: '暹罗', rarity: '稀有',
    level: 2, intimacy: 1, energy: 100, mood: 70,
    personality: '调皮',
    skills: [
      { name: '神速', level: 1, maxLevel: 3, description: '制作速度 +15%', area: 'bar', effectValue: 0.15 },
    ],
    area: null,
  },
  {
    id: 'snow', name: '小雪', species: '白猫', rarity: '普通',
    level: 1, intimacy: 1, energy: 100, mood: 80,
    personality: '粘人',
    skills: [
      { name: '净洁', level: 1, maxLevel: 2, description: '掉毛事件 -30%', area: 'rest', effectValue: 0.30 },
    ],
    area: null,
  },
];
