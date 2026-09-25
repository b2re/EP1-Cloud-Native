export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
}

export type OrderStatus = 'CREADO' | 'ACEPTADO' | 'EN_PREPARACION' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO';

export interface Order {
  id: number;
  customerId: string;
  productId: number;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
}

// Formato de respuesta de ms-pedidos360-orders
export interface ApiResponse<T> {
  ok: boolean;
  statusCode: number;
  message: string;
  data: T;
  count: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  CREADO: 'Creado',
  ACEPTADO: 'Aceptado',
  EN_PREPARACION: 'En preparación',
  DESPACHADO: 'Despachado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

// Transiciones permitidas (misma regla que ms-pedidos360-orders)
export const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  CREADO: ['ACEPTADO', 'CANCELADO'],
  ACEPTADO: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['DESPACHADO', 'CANCELADO'],
  DESPACHADO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};
