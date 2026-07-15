import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../common/prisma.service';
import { EVENTS, PurchaseOrderReceivedPayload } from '../common/events';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  listOrders() {
    return this.prisma.purchaseOrder.findMany({
      include: { supplier: true, items: { include: { rawMaterial: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getOrder(id: string) {
    return this.prisma.purchaseOrder.findUniqueOrThrow({
      where: { id },
      include: { supplier: true, items: { include: { rawMaterial: true } } },
    });
  }

  create(data: CreatePurchaseOrderDto) {
    return this.prisma.purchaseOrder.create({
      data: {
        supplierId: data.supplierId,
        status: 'BORRADOR',
        items: { create: data.items },
      },
      include: { items: true },
    });
  }

  // Cancela una orden de compra que aún no fue recibida.
  async cancel(purchaseOrderId: string) {
    const order = await this.prisma.purchaseOrder.findUniqueOrThrow({
      where: { id: purchaseOrderId },
    });
    if (order.status === 'RECIBIDA') {
      throw new BadRequestException(
        'No se puede cancelar: la compra ya fue recibida y el stock ya ingresó.',
      );
    }
    if (order.status === 'CANCELADA') {
      throw new BadRequestException('Esta orden ya está cancelada.');
    }
    return this.prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'CANCELADA' },
    });
  }

  // Al marcar como recibida, Purchases NO toca el stock de materia prima directamente.
  // Solo emite el evento — Raw Materials es quien reacciona.
  async receive(purchaseOrderId: string, warehouseId: string) {
    const existing = await this.prisma.purchaseOrder.findUniqueOrThrow({
      where: { id: purchaseOrderId },
    });
    if (existing.status === 'RECIBIDA') {
      throw new BadRequestException('Esta orden de compra ya fue recibida');
    }
    if (existing.status === 'CANCELADA') {
      throw new BadRequestException('No se puede recibir una orden cancelada');
    }

    const order = await this.prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'RECIBIDA', receivedAt: new Date() },
      include: { items: true },
    });

    const payload: PurchaseOrderReceivedPayload = {
      purchaseOrderId,
      warehouseId,
      items: order.items.map((i) => ({
        rawMaterialId: i.rawMaterialId,
        quantity: Number(i.quantity),
      })),
    };

    this.eventEmitter.emit(EVENTS.PURCHASE_ORDER_RECEIVED, payload);

    return order;
  }
}
