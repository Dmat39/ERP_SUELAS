import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../common/prisma.service';
import { EVENTS, ProductionCompletedPayload, OrderConfirmedPayload } from '../common/events';

// Inventory no sabe que Production existe. Solo sabe: "cuando algo se produce, sumo stock".
@Injectable()
export class InventoryListener {
  constructor(private prisma: PrismaService) {}

  @OnEvent(EVENTS.PRODUCTION_COMPLETED)
  async handleProductionCompleted(payload: ProductionCompletedPayload) {
    await this.prisma.stockMovement.create({
      data: {
        variantId: payload.variantId,
        warehouseId: payload.warehouseId,
        type: 'ENTRADA',
        quantity: payload.quantityProduced,
        referenceType: 'production_order',
        referenceId: payload.productionOrderId,
      },
    });

    await this.prisma.productStock.upsert({
      where: {
        variantId_warehouseId: {
          variantId: payload.variantId,
          warehouseId: payload.warehouseId,
        },
      },
      create: {
        variantId: payload.variantId,
        warehouseId: payload.warehouseId,
        quantity: payload.quantityProduced,
      },
      update: {
        quantity: { increment: payload.quantityProduced },
      },
    });
  }

  // Cuando se confirma una venta, se descuenta el stock del producto vendido.
  @OnEvent(EVENTS.ORDER_CONFIRMED)
  async handleOrderConfirmed(payload: OrderConfirmedPayload) {
    for (const item of payload.items) {
      await this.prisma.stockMovement.create({
        data: {
          variantId: item.variantId,
          warehouseId: payload.warehouseId,
          type: 'SALIDA',
          quantity: item.quantity,
          referenceType: 'order',
          referenceId: payload.orderId,
        },
      });

      await this.prisma.productStock.update({
        where: {
          variantId_warehouseId: {
            variantId: item.variantId,
            warehouseId: payload.warehouseId,
          },
        },
        data: { quantity: { decrement: item.quantity } },
      });
    }
  }
}
