// Catálogo central de eventos del sistema.
// Cualquier módulo puede EMITIR o ESCUCHAR estos eventos sin conocer
// la existencia de los otros módulos. Este es el "tablero de anuncios".
//
// Para agregar un módulo nuevo que reaccione a algo, solo agrega su listener
// con @OnEvent(...) — el emisor no cambia. Para un evento nuevo, agrégalo aquí
// junto a su payload tipado, así queda documentado en un solo lugar.

export const EVENTS = {
  PRODUCTION_COMPLETED: 'production.completed',
  ORDER_CONFIRMED: 'order.confirmed',
  PURCHASE_ORDER_RECEIVED: 'purchase_order.received',
  SHIPMENT_DISPATCHED: 'shipment.dispatched',
  SHIPMENT_DELIVERED: 'shipment.delivered',
} as const;

export interface ProductionCompletedPayload {
  productionOrderId: string;
  variantId: string;
  quantityProduced: number;
  rawMaterialsConsumed: { rawMaterialId: string; quantity: number }[];
  warehouseId: string;
}

export interface OrderConfirmedPayload {
  orderId: string;
  items: { variantId: string; quantity: number }[];
  warehouseId: string;
}

export interface PurchaseOrderReceivedPayload {
  purchaseOrderId: string;
  items: { rawMaterialId: string; quantity: number }[];
  warehouseId: string;
}

// Emitidos por Logistics cuando cambia el estado de un despacho.
// Sales escucha para mover el estado del pedido (DESPACHADO / ENTREGADO)
// sin que Logistics toque directamente la tabla Order.
export interface ShipmentStatusPayload {
  shipmentId: string;
  orderId: string;
}
