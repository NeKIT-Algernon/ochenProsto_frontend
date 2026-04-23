import api from './client'
import type {
  CreateOrderItemPayload,
  CreateOrderPayload,
  DirectusSingletonResponse,
  DirectusListResponse,
  Order,
  OrderItem,
} from './types'

export function createOrder(payload: CreateOrderPayload) {
  return api.post<DirectusSingletonResponse<Order>>('/items/orders', payload)
}

export function createOrderItem(payload: CreateOrderItemPayload) {
  return api.post<DirectusSingletonResponse<OrderItem>>('/items/order_items', payload)
}

export function updateOrder(orderId: number, payload: Partial<CreateOrderPayload>) {
  return api.patch<DirectusSingletonResponse<Order>>(`/items/orders/${orderId}`, payload)
}
