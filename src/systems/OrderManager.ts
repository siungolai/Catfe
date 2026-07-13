import type { Order } from '../data/orders';
import { generateOrderId } from '../data/orders';
import { DEFAULT_RECIPES } from '../data/recipes';

/** 订单管理器：队列、进度、制作逻辑 */
export class OrderManager {
  orders: Order[] = [];
  queueMax = 3;
  private elapsed = 0;
  private onOrderDone: (order: Order) => void;
  private onProcessNext: () => void;

  constructor(onOrderDone: (order: Order) => void, onProcessNext: () => void) {
    this.onOrderDone = onOrderDone;
    this.onProcessNext = onProcessNext;
  }

  setElapsed(t: number): void { this.elapsed = t; }

  /** 创建新订单入队 */
  createOrder(recipeId: string, customerId: string, seatIndex: number): Order | null {
    if (this.orders.filter(o => o.state !== 'delivered').length >= this.queueMax) return null;

    const recipe = DEFAULT_RECIPES.find(r => r.id === recipeId)!;
    const order: Order = {
      id: generateOrderId(),
      recipeId: recipe.name,
      customerId,
      seatIndex,
      startTime: this.elapsed,
      progress: 0,
      duration: recipe.duration * 1000,
      state: 'queued',
    };
    this.orders.push(order);
    return order;
  }

  /** 处理队列：找第一个等待订单开始制作 */
  processQueue(): void {
    const next = this.orders.find(o => o.state === 'queued');
    if (!next) return;
    next.state = 'making';
    next.startTime = this.elapsed;
    this.onProcessNext();
  }

  /** 更新制作进度 */
  update(dt: number, speedBoost = 1): void {
    for (const order of this.orders) {
      if (order.state === 'making') {
        const elapsed = (this.elapsed - order.startTime) * 1000;
        order.progress = Math.min(elapsed / (order.duration * speedBoost), 1);
        if (order.progress >= 1) {
          order.state = 'done';
          this.onOrderDone(order);
          this.processQueue();
        }
      }
    }
  }

  /** 获取未交付的订单（用于队列 UI） */
  getActiveOrders(): Order[] {
    return this.orders.filter(o => o.state !== 'delivered');
  }

  /** 标记订单为已交付 */
  markDelivered(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) order.state = 'delivered';
  }
}
