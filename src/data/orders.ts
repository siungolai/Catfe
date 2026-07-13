/** 订单实例 */
export interface Order {
  id: string;
  recipeId: string;
  customerId: string;
  seatIndex: number;
  startTime: number;        // 入队时间戳
  progress: number;         // 0-1
  duration: number;         // 制作时长（ms）
  state: 'queued' | 'making' | 'done' | 'delivered';
}

let orderSeq = 0;
export function generateOrderId(): string {
  return `ord_${++orderSeq}_${Date.now()}`;
}
