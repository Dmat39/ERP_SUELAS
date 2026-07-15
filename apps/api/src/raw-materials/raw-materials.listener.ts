import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../common/prisma.service';
import {
  EVENTS,
  ProductionCompletedPayload,
  PurchaseOrderReceivedPayload,
} from '../common/events';

// Raw Materials tampoco sabe que Production o Purchases existen.
// Solo reacciona a "algo se produjo" (consumo) y "algo se recibió" (entrada).
@Injectable()
export class RawMaterialsListener {
  constructor(private prisma: PrismaService) {}

  @OnEvent(EVENTS.PRODUCTION_COMPLETED)
  async handleProductionCompleted(payload: ProductionCompletedPayload) {
    for (const consumed of payload.rawMaterialsConsumed) {
      await this.prisma.rawMaterialMovement.create({
        data: {
          rawMaterialId: consumed.rawMaterialId,
          warehouseId: payload.warehouseId,
          type: 'CONSUMO',
          quantity: consumed.quantity,
          referenceType: 'production_order',
          referenceId: payload.productionOrderId,
        },
      });

      await this.prisma.rawMaterialStock.update({
        where: {
          rawMaterialId_warehouseId: {
            rawMaterialId: consumed.rawMaterialId,
            warehouseId: payload.warehouseId,
          },
        },
        data: { quantity: { decrement: consumed.quantity } },
      });
    }
  }

  @OnEvent(EVENTS.PURCHASE_ORDER_RECEIVED)
  async handlePurchaseOrderReceived(payload: PurchaseOrderReceivedPayload) {
    for (const item of payload.items) {
      await this.prisma.rawMaterialMovement.create({
        data: {
          rawMaterialId: item.rawMaterialId,
          warehouseId: payload.warehouseId,
          type: 'COMPRA',
          quantity: item.quantity,
          referenceType: 'purchase_order',
          referenceId: payload.purchaseOrderId,
        },
      });

      await this.prisma.rawMaterialStock.upsert({
        where: {
          rawMaterialId_warehouseId: {
            rawMaterialId: item.rawMaterialId,
            warehouseId: payload.warehouseId,
          },
        },
        create: {
          rawMaterialId: item.rawMaterialId,
          warehouseId: payload.warehouseId,
          quantity: item.quantity,
        },
        update: { quantity: { increment: item.quantity } },
      });
    }
  }
}
