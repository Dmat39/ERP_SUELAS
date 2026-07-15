import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../common/prisma.service';
import { EVENTS, ProductionCompletedPayload } from '../common/events';
import { CreateBomDto } from './dto/create-bom.dto';

@Injectable()
export class ProductionService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ---------- BOM (recetas) ----------
  listBoms() {
    return this.prisma.bom.findMany({
      include: {
        variant: { include: { template: true } },
        lines: { include: { rawMaterial: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  getBom(id: string) {
    return this.prisma.bom.findUniqueOrThrow({
      where: { id },
      include: {
        variant: { include: { template: true } },
        lines: { include: { rawMaterial: true } },
      },
    });
  }

  createBom(dto: CreateBomDto) {
    return this.prisma.bom.create({
      data: {
        variantId: dto.variantId,
        name: dto.name,
        lines: { create: dto.lines },
      },
      include: { lines: true },
    });
  }

  // ---------- Órdenes de producción ----------
  listOrders() {
    return this.prisma.productionOrder.findMany({
      include: { bom: { include: { variant: { include: { template: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getOrder(id: string) {
    return this.prisma.productionOrder.findUniqueOrThrow({
      where: { id },
      include: {
        bom: {
          include: {
            variant: { include: { template: true } },
            lines: { include: { rawMaterial: true } },
          },
        },
      },
    });
  }

  create(bomId: string, quantityToProduce: number) {
    return this.prisma.productionOrder.create({
      data: { bomId, quantityToProduce, status: 'PLANIFICADA' },
    });
  }

  async start(productionOrderId: string) {
    const order = await this.prisma.productionOrder.findUniqueOrThrow({
      where: { id: productionOrderId },
    });
    if (order.status !== 'PLANIFICADA') {
      throw new BadRequestException('Solo una orden planificada puede pasar a en proceso');
    }
    return this.prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: { status: 'EN_PROCESO' },
    });
  }

  // Cancela una orden que aún no se completó (no ha movido stock).
  async cancel(productionOrderId: string) {
    const order = await this.prisma.productionOrder.findUniqueOrThrow({
      where: { id: productionOrderId },
    });
    if (order.status !== 'PLANIFICADA' && order.status !== 'EN_PROCESO') {
      throw new BadRequestException(
        'Solo se puede cancelar una orden planificada o en proceso.',
      );
    }
    return this.prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: { status: 'CANCELADA' },
    });
  }

  // Elimina una receta solo si nunca se usó en una orden de producción.
  async removeBom(id: string) {
    const usos = await this.prisma.productionOrder.count({ where: { bomId: id } });
    if (usos > 0) {
      throw new BadRequestException(
        'No se puede eliminar: la receta ya se usó en órdenes de producción.',
      );
    }
    const [, bom] = await this.prisma.$transaction([
      this.prisma.bomLine.deleteMany({ where: { bomId: id } }),
      this.prisma.bom.delete({ where: { id } }),
    ]);
    return bom;
  }

  // Completa la orden: valida stock de MP, y EMITE el evento.
  // Production NO descuenta materia prima ni aumenta stock de producto terminado
  // directamente — eso lo hacen los módulos que escuchan el evento.
  async complete(productionOrderId: string, warehouseId: string) {
    const order = await this.prisma.productionOrder.findUniqueOrThrow({
      where: { id: productionOrderId },
      include: { bom: { include: { lines: true } } },
    });

    if (order.status !== 'PLANIFICADA' && order.status !== 'EN_PROCESO') {
      throw new BadRequestException('La orden ya fue completada o cancelada');
    }

    // Validar stock de materia prima antes de consumir
    for (const line of order.bom.lines) {
      const needed = Number(line.quantity) * Number(order.quantityToProduce);
      const stock = await this.prisma.rawMaterialStock.findUnique({
        where: {
          rawMaterialId_warehouseId: {
            rawMaterialId: line.rawMaterialId,
            warehouseId,
          },
        },
      });
      if (!stock || Number(stock.quantity) < needed) {
        const rm = await this.prisma.rawMaterial.findUnique({
          where: { id: line.rawMaterialId },
        });
        throw new BadRequestException(
          `Stock insuficiente de "${rm?.name ?? line.rawMaterialId}": se necesitan ${needed} ${rm?.unit ?? ''} y hay ${Number(stock?.quantity ?? 0)}`,
        );
      }
    }

    await this.prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: { status: 'COMPLETADA', completedAt: new Date() },
    });

    const payload: ProductionCompletedPayload = {
      productionOrderId,
      variantId: order.bom.variantId,
      quantityProduced: Number(order.quantityToProduce),
      warehouseId,
      rawMaterialsConsumed: order.bom.lines.map((line) => ({
        rawMaterialId: line.rawMaterialId,
        quantity: Number(line.quantity) * Number(order.quantityToProduce),
      })),
    };

    // Aquí está la magia: Production "grita" el evento y sigue su vida.
    // No sabe ni le importa que Inventory y RawMaterials están escuchando.
    this.eventEmitter.emit(EVENTS.PRODUCTION_COMPLETED, payload);

    return payload;
  }
}
