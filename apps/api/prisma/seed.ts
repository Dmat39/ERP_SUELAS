// Seed de datos de ejemplo para el ERP de suelas.
// Re-ejecutable: limpia las tablas en orden de dependencia y vuelve a poblar.
//
//   npm run db:seed        (desde la raíz)
//   npm run prisma:seed    (desde apps/api)
//
// Deja el sistema listo para el flujo e2e:
//   compra -> recepción -> producción -> completar -> venta -> comprobante -> envío.

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando datos previos...');
  // Orden inverso a las dependencias (hijos antes que padres).
  await prisma.shipment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.bomLine.deleteMany();
  await prisma.bom.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productStock.deleteMany();
  await prisma.productVariantAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productTemplate.deleteMany();
  await prisma.attributeValue.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.category.deleteMany();
  await prisma.rawMaterialMovement.deleteMany();
  await prisma.rawMaterialStock.deleteMany();
  await prisma.rawMaterial.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  // ---------- Usuarios (uno por rol) ----------
  console.log('👤 Creando usuarios...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.createMany({
    data: [
      { email: 'admin@erp.com', name: 'Administrador', role: 'ADMIN', passwordHash },
      { email: 'almacen@erp.com', name: 'Almacenero', role: 'ALMACENERO', passwordHash },
      { email: 'ventas@erp.com', name: 'Vendedor', role: 'VENDEDOR', passwordHash },
    ],
  });

  // ---------- Almacén ----------
  console.log('🏭 Creando almacén...');
  const warehouse = await prisma.warehouse.create({
    data: { name: 'Almacén Principal' },
  });

  // ---------- Contactos (proveedor + cliente) ----------
  console.log('🤝 Creando contactos...');
  const supplier = await prisma.contact.create({
    data: {
      name: 'Insumos Químicos del Sur SAC',
      docType: 'RUC',
      docNumber: '20512345678',
      phone: '054-234567',
      email: 'ventas@insumossur.pe',
      address: 'Parque Industrial Mz. B Lt. 12, Arequipa',
      isSupplier: true,
    },
  });
  const customer = await prisma.contact.create({
    data: {
      name: 'Calzados El Roble EIRL',
      docType: 'RUC',
      docNumber: '20487654321',
      phone: '01-4567890',
      email: 'compras@elroble.pe',
      address: 'Av. Grau 1450, La Victoria, Lima',
      isCustomer: true,
    },
  });

  // ---------- Materias primas ----------
  console.log('🧪 Creando materias primas...');
  const caucho = await prisma.rawMaterial.create({
    data: { name: 'Caucho SBR', unit: 'kg', costPerUnit: 8.5, minStock: 50 },
  });
  const pu = await prisma.rawMaterial.create({
    data: { name: 'Poliuretano (PU)', unit: 'kg', costPerUnit: 12.0, minStock: 30 },
  });
  const pegamento = await prisma.rawMaterial.create({
    data: { name: 'Pegamento PU', unit: 'lt', costPerUnit: 15.0, minStock: 10 },
  });

  // Stock inicial modesto (el flujo e2e sumará más vía compra).
  console.log('📦 Cargando stock inicial de materia prima...');
  await prisma.rawMaterialStock.createMany({
    data: [
      { rawMaterialId: caucho.id, warehouseId: warehouse.id, quantity: 20 },
      { rawMaterialId: pu.id, warehouseId: warehouse.id, quantity: 10 },
      { rawMaterialId: pegamento.id, warehouseId: warehouse.id, quantity: 5 },
    ],
  });

  // ---------- Atributo Talla + valores ----------
  console.log('📏 Creando atributo Talla y variantes...');
  const talla = await prisma.attribute.create({ data: { name: 'Talla' } });
  const tallas = ['38', '39', '40', '41'];
  const tallaValues: Record<string, string> = {};
  for (const t of tallas) {
    const v = await prisma.attributeValue.create({
      data: { attributeId: talla.id, value: t },
    });
    tallaValues[t] = v.id;
  }

  // ---------- Categoría + producto terminado (template + variantes) ----------
  const categoria = await prisma.category.create({ data: { name: 'Suelas' } });
  const template = await prisma.productTemplate.create({
    data: {
      name: 'Suela Runner',
      description: 'Suela deportiva de caucho con núcleo de PU. Antideslizante.',
      categoryId: categoria.id,
      basePrice: 25.0,
      active: true,
    },
  });

  const variantsByTalla: Record<string, string> = {};
  for (const t of tallas) {
    const variant = await prisma.productVariant.create({
      data: {
        templateId: template.id,
        sku: `SR-RUN-${t}`,
        attributes: { create: [{ attributeValueId: tallaValues[t] }] },
      },
    });
    variantsByTalla[t] = variant.id;
  }

  // ---------- BOM (receta) para la talla 40 ----------
  console.log('🧾 Creando BOM de ejemplo (Suela Runner Talla 40)...');
  await prisma.bom.create({
    data: {
      variantId: variantsByTalla['40'],
      name: 'Receta Suela Runner Talla 40',
      lines: {
        create: [
          { rawMaterialId: caucho.id, quantity: 0.25 }, // kg por unidad
          { rawMaterialId: pu.id, quantity: 0.15 },
          { rawMaterialId: pegamento.id, quantity: 0.03 }, // lt por unidad
        ],
      },
    },
  });

  // ---------- Stock inicial de producto terminado ----------
  console.log('📦 Cargando stock de producto terminado...');
  const stockPorTalla: Record<string, number> = { '38': 120, '39': 200, '40': 150, '41': 80 };
  for (const t of tallas) {
    await prisma.productStock.create({
      data: {
        variantId: variantsByTalla[t],
        warehouseId: warehouse.id,
        quantity: stockPorTalla[t],
      },
    });
  }

  // ---------- Segundo cliente (variedad) ----------
  const customer2 = await prisma.contact.create({
    data: {
      name: 'Distribuidora Andina SAC',
      docType: 'RUC',
      docNumber: '20600112233',
      phone: '084-221100',
      email: 'pedidos@andina.pe',
      address: 'Av. La Cultura 890, Cusco',
      isCustomer: true,
    },
  });

  // ---------- Historial de pedidos (para el tablero y gráficos) ----------
  console.log('🧾 Creando historial de pedidos de ejemplo...');
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(10, 30, 0, 0);
    return d;
  };
  const PRICE = 25.0;

  // { díasAtrás, cliente, origen, talla, cant, estado, comprobante?, envío? }
  const plantillas: {
    dias: number;
    customerId: string;
    origin: 'INTERNO' | 'WEB';
    talla: string;
    cant: number;
    status: 'PENDIENTE' | 'CONFIRMADO' | 'DESPACHADO' | 'ENTREGADO';
    invoice?: { type: 'BOLETA' | 'FACTURA'; serie: string; numero: number };
    ship?: 'EN_RUTA' | 'ENTREGADO';
  }[] = [
    { dias: 6, customerId: customer.id, origin: 'INTERNO', talla: '39', cant: 10, status: 'ENTREGADO', invoice: { type: 'BOLETA', serie: 'B001', numero: 1 }, ship: 'ENTREGADO' },
    { dias: 5, customerId: customer2.id, origin: 'WEB', talla: '40', cant: 20, status: 'ENTREGADO', invoice: { type: 'BOLETA', serie: 'B001', numero: 2 }, ship: 'ENTREGADO' },
    { dias: 4, customerId: customer.id, origin: 'INTERNO', talla: '38', cant: 8, status: 'CONFIRMADO' },
    { dias: 3, customerId: customer2.id, origin: 'WEB', talla: '40', cant: 15, status: 'ENTREGADO', invoice: { type: 'FACTURA', serie: 'F001', numero: 1 }, ship: 'ENTREGADO' },
    { dias: 2, customerId: customer2.id, origin: 'WEB', talla: '41', cant: 12, status: 'DESPACHADO', ship: 'EN_RUTA' },
    { dias: 1, customerId: customer.id, origin: 'INTERNO', talla: '39', cant: 5, status: 'CONFIRMADO' },
    { dias: 0, customerId: customer2.id, origin: 'WEB', talla: '40', cant: 18, status: 'PENDIENTE' },
  ];

  for (const p of plantillas) {
    const total = p.cant * PRICE;
    const order = await prisma.order.create({
      data: {
        customerId: p.customerId,
        origin: p.origin,
        status: p.status,
        total,
        createdAt: daysAgo(p.dias),
        items: {
          create: [{ variantId: variantsByTalla[p.talla], quantity: p.cant, unitPrice: PRICE }],
        },
      },
    });
    if (p.invoice) {
      await prisma.invoice.create({
        data: {
          orderId: order.id,
          type: p.invoice.type,
          serie: p.invoice.serie,
          numero: p.invoice.numero,
          sunatStatus: 'NO_ENVIADO',
          createdAt: daysAgo(p.dias),
        },
      });
    }
    if (p.ship) {
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          status: p.ship,
          address: 'Av. La Cultura 890, Cusco',
          deliveredAt: p.ship === 'ENTREGADO' ? daysAgo(p.dias) : null,
        },
      });
    }
  }

  console.log('\n✅ Seed completado.');
  console.log('   Login de prueba:');
  console.log('     admin@erp.com   / admin123  (ADMIN)');
  console.log('     almacen@erp.com / admin123  (ALMACENERO)');
  console.log('     ventas@erp.com  / admin123  (VENDEDOR)');
  console.log(`   Almacén: ${warehouse.name} (${warehouse.id})`);
  console.log(`   Proveedor: ${supplier.name}`);
  console.log(`   Cliente:   ${customer.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
