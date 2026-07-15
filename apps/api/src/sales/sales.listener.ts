import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../common/prisma.service';
import { EVENTS, ShipmentStatusPayload } from '../common/events';

// Sales no sabe que Logistics existe. Solo reacciona a "un despacho salió/llegó"
// y actualiza el estado del pedido (su propia tabla).
@Injectable()
export class SalesListener {
  constructor(private prisma: PrismaService) {}

  @OnEvent(EVENTS.SHIPMENT_DISPATCHED)
  async handleDispatched(payload: ShipmentStatusPayload) {
    await this.prisma.order.update({
      where: { id: payload.orderId },
      data: { status: 'DESPACHADO' },
    });
  }

  @OnEvent(EVENTS.SHIPMENT_DELIVERED)
  async handleDelivered(payload: ShipmentStatusPayload) {
    await this.prisma.order.update({
      where: { id: payload.orderId },
      data: { status: 'ENTREGADO' },
    });
  }
}
