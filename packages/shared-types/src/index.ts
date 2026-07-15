// Tipos compartidos entre la API (NestJS) y el frontend (Next.js).
// Fuente única de verdad para enums de dominio y formas de respuesta que
// cruzan la frontera api <-> web. Debe mantenerse alineado con schema.prisma.

// ---------- Enums de dominio (como uniones de strings) ----------

export type UserRole = 'ADMIN' | 'ALMACENERO' | 'VENDEDOR';

export type RawMaterialMovementType = 'COMPRA' | 'CONSUMO' | 'AJUSTE';

export type StockMovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export type ProductionStatus =
  | 'PLANIFICADA'
  | 'EN_PROCESO'
  | 'COMPLETADA'
  | 'CANCELADA';

export type PurchaseOrderStatus =
  | 'BORRADOR'
  | 'ENVIADA'
  | 'RECIBIDA'
  | 'CANCELADA';

export type OrderOrigin = 'INTERNO' | 'WEB';

export type OrderStatus =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'DESPACHADO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type InvoiceType = 'BOLETA' | 'FACTURA';

export type SunatStatus = 'NO_ENVIADO' | 'ACEPTADO' | 'RECHAZADO' | 'OBSERVADO';

export type ShipmentStatus = 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO';

// ---------- Auth ----------

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

// ---------- Catálogo (storefront público) ----------

export interface CatalogAttribute {
  attribute: string; // ej: "Talla"
  value: string; // ej: "39"
}

export interface CatalogVariant {
  id: string;
  sku: string;
  price: number; // priceOverride ?? basePrice, ya resuelto por la API
  stock: number; // stock total sumado entre almacenes
  attributes: CatalogAttribute[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: string | null;
  variants: CatalogVariant[];
}

// ---------- Carrito / checkout ----------

export interface CartLine {
  variantId: string;
  sku: string;
  productName: string;
  attributes: CatalogAttribute[];
  unitPrice: number;
  quantity: number;
}

export interface CheckoutPayload {
  customer: {
    name: string;
    docType?: string;
    docNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: { variantId: string; quantity: number; unitPrice: number }[];
}
