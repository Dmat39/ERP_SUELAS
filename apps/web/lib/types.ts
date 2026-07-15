// Formas de respuesta de la API para el panel admin.
// Nota: Prisma serializa los campos Decimal como STRING en JSON.

export interface Warehouse {
  id: string;
  name: string;
}

export interface Contact {
  id: string;
  name: string;
  docType: string | null;
  docNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isCustomer: boolean;
  isSupplier: boolean;
  createdAt: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  costPerUnit: string;
  minStock: string;
  stock: { warehouseId: string; quantity: string }[];
}

export interface VariantFlat {
  id: string;
  sku: string;
  productName: string;
  price: number;
  priceOverride: number | null; // precio propio; null = usa el precio base
  stock: number;
  attributes: { attribute: string; value: string }[];
}

export interface TemplateAdmin {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  category: { name: string } | null;
  variants: {
    id: string;
    sku: string;
    priceOverride: string | null;
    stock: { warehouseId: string; quantity: string }[];
    attributes: { attributeValue: { value: string } }[];
  }[];
}

export interface AttributeWithValues {
  id: string;
  name: string;
  values: { id: string; value: string }[];
}

export interface Bom {
  id: string;
  name: string;
  variantId: string;
  variant: { sku: string; template: { name: string } };
  lines: { id: string; quantity: string; rawMaterial: { name: string; unit: string } }[];
}

export interface ProductionOrder {
  id: string;
  quantityToProduce: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  bom: { name: string; variant: { sku: string; template: { name: string } } };
}

export interface PurchaseOrder {
  id: string;
  status: string;
  createdAt: string;
  receivedAt: string | null;
  supplier: { name: string };
  items: { id: string; quantity: string; unitCost: string; rawMaterial: { name: string; unit: string } }[];
}

export interface Order {
  id: string;
  origin: string;
  status: string;
  total: string;
  createdAt: string;
  customer: { name: string; phone: string | null; email: string | null };
  items: { id: string; quantity: number; unitPrice: string; variant: { sku: string; template: { name: string } } }[];
  invoice: { id: string; serie: string; numero: number } | null;
  shipment: { id: string; status: string } | null;
}

export interface Invoice {
  id: string;
  type: string;
  serie: string;
  numero: number;
  sunatStatus: string;
  createdAt: string;
  order: {
    id: string;
    total: string;
    customer: { name: string; phone: string | null; email: string | null };
  };
}

export interface Shipment {
  id: string;
  status: string;
  address: string;
  deliveredAt: string | null;
  order: {
    id: string;
    customer: { name: string; phone: string | null; email: string | null };
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
}
