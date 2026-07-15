import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../common/prisma.service';
import { EVENTS, OrderConfirmedPayload } from '../common/events';
import { CreateOrderDto } from './dto/create-order.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  listOrders() {
    return this.prisma.order.findMany({
      include: {
        customer: true,
        items: { include: { variant: { include: { template: true } } } },
        invoice: true,
        shipment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getOrder(id: string) {
    return this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: {
        customer: true,
        items: { include: { variant: { include: { template: true } } } },
        invoice: true,
        shipment: true,
      },
    });
  }

  // Pedido interno (panel admin): confía en customerId y precios enviados.
  create(data: CreateOrderDto) {
    const total = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    return this.prisma.order.create({
      data: {
        customerId: data.customerId,
        origin: data.origin,
        total,
        items: { create: data.items },
      },
      include: { items: true },
    });
  }

  // Checkout público (storefront): crea/reutiliza el contacto cliente y
  // RESUELVE el precio desde la variante (no confía en el precio del cliente).
  async checkout(dto: CheckoutDto) {
    // 1) Cliente: reutiliza por doc si viene, si no crea uno nuevo.
    let customer =
      dto.customer.docNumber
        ? await this.prisma.contact.findFirst({
            where: { docNumber: dto.customer.docNumber },
          })
        : null;

    if (!customer) {
      customer = await this.prisma.contact.create({
        data: {
          name: dto.customer.name,
          docType: dto.customer.docType,
          docNumber: dto.customer.docNumber,
          phone: dto.customer.phone,
          email: dto.customer.email,
          address: dto.customer.address,
          isCustomer: true,
        },
      });
    }

    // 2) Precios resueltos en el servidor.
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: dto.items.map((i) => i.variantId) } },
      include: { template: true },
    });
    const priceOf = new Map(
      variants.map((v) => [
        v.id,
        v.priceOverride != null ? Number(v.priceOverride) : Number(v.template.basePrice),
      ]),
    );

    const items = dto.items.map((i) => {
      const unitPrice = priceOf.get(i.variantId);
      if (unitPrice == null) {
        throw new BadRequestException(`La variante ${i.variantId} no existe`);
      }
      return { variantId: i.variantId, quantity: i.quantity, unitPrice };
    });

    const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    return this.prisma.order.create({
      data: {
        customerId: customer.id,
        origin: 'WEB',
        total,
        items: { create: items },
      },
      include: { items: true, customer: true },
    });
  }

  // Cancela un pedido. Solo PENDIENTE: los confirmados ya descontaron stock
  // y revertirlos requiere un flujo de devolución (módulo futuro).
  async cancel(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.status !== 'PENDIENTE') {
      throw new BadRequestException(
        'Solo se puede cancelar un pedido pendiente. Los confirmados ya movieron stock.',
      );
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELADO' },
    });
  }

  // Al confirmar, Sales emite el evento — no descuenta stock directamente.
  async confirm(orderId: string, warehouseId: string) {
    const existing = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    if (existing.status !== 'PENDIENTE') {
      throw new BadRequestException('Solo se puede confirmar un pedido pendiente');
    }

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMADO' },
      include: { items: true },
    });

    const payload: OrderConfirmedPayload = {
      orderId,
      warehouseId,
      items: order.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    };

    this.eventEmitter.emit(EVENTS.ORDER_CONFIRMED, payload);

    return order;
  }
}
