/** 顾客类型定义 */
export interface CustomerType {
  id: string;
  name: string;
  variants: string[];
  patience: number;       // 基础耐心值（秒）
  spending: '低' | '中' | '高';
  tipChance: number;      // 小费概率 0-1
}

export const CUSTOMER_TYPES: CustomerType[] = [
  { id: 'worker', name: '上班族', variants: ['初级', '资深', '高管'], patience: 45, spending: '高', tipChance: 0.3 },
  { id: 'student', name: '学生', variants: ['初中', '高中', '大学'], patience: 90, spending: '低', tipChance: 0.1 },
  { id: 'elder', name: '退休人士', variants: ['老奶奶', '老爷爷'], patience: 120, spending: '中', tipChance: 0.4 },
  { id: 'tourist', name: '游客', variants: ['国内', '国外'], patience: 60, spending: '高', tipChance: 0.2 },
];

/** 活跃顾客实例 */
export interface Customer {
  id: string;
  typeId: string;
  variant: string;
  patience: number;
  maxPatience: number;
  seatIndex: number;
  orderId: string | null;   // 已点订单 ID
  state: 'entering' | 'seated' | 'ordering' | 'waiting' | 'served' | 'leaving';
}
