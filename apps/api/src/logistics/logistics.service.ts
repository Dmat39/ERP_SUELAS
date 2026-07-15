import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../common/prisma.service';
import { EVENTS, ShipmentStatusPayload } from '../common/events';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@Injectable()
export class LogisticsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  list() {
    return this.prisma.shipment.findMany({
      include: { order: { include: { customer: true } } },
      orderBy: { order: { createdAt: 'desc' } },
    });
  }

  createShipment(dto: CreateShipmentDto) {
    return this.prisma.shipment.create({
      data: { orderId: dto.orderId, address: dto.address, status: 'PENDIENTE' },
    });
  }

  // Sale a ruta. Emite evento -> Sales marca el pedido como DESPACHADO.
  async dispatch(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUniqueOrThrow({ where: { id: shipmentId } });
    if (shipment.status !== 'PENDIENTE') {
      throw new BadRequestException('El despacho ya salió a ruta o fue entregado');
    }
    const updated = await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: 'EN_RUTA' },
    });

    const payload: ShipmentStatusPayload = { shipmentId, orderId: updated.orderId };
    this.eventEmitter.emit(EVENTS.SHIPMENT_DISPATCHED, payload);
    return updated;
  }

  // Entregado. Emite evento -> Sales marca el pedido como ENTREGADO.
  async markDelivered(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUniqueOrThrow({ where: { id: shipmentId } });
    if (shipment.status === 'ENTREGADO') {
      throw new BadRequestException('Este despacho ya fue entregado');
    }
    const updated = await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: 'ENTREGADO', deliveredAt: new Date() },
    });

    const payload: ShipmentStatusPayload = { shipmentId, orderId: updated.orderId };
    this.eventEmitter.emit(EVENTS.SHIPMENT_DELIVERED, payload);
    return updated;
  }
}
