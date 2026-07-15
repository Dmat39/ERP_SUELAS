import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';

@Injectable()
export class RawMaterialsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.rawMaterial.findMany({
      include: { stock: true },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.rawMaterial.findUniqueOrThrow({
      where: { id },
      include: { stock: { include: { warehouse: true } } },
    });
  }

  create(data: CreateRawMaterialDto) {
    return this.prisma.rawMaterial.create({ data });
  }

  update(id: string, data: UpdateRawMaterialDto) {
    return this.prisma.rawMaterial.update({ where: { id }, data });
  }

  // Elimina solo si el insumo no está en uso (movimientos, recetas o compras).
  async remove(id: string) {
    const [movs, bomLines, poItems] = await Promise.all([
      this.prisma.rawMaterialMovement.count({ where: { rawMaterialId: id } }),
      this.prisma.bomLine.count({ where: { rawMaterialId: id } }),
      this.prisma.purchaseOrderItem.count({ where: { rawMaterialId: id } }),
    ]);
    if (movs + bomLines + poItems > 0) {
      throw new BadRequestException(
        'No se puede eliminar: el insumo tiene movimientos, recetas o compras asociadas. Corrige sus datos con Editar.',
      );
    }
    const [, material] = await this.prisma.$transaction([
      this.prisma.rawMaterialStock.deleteMany({ where: { rawMaterialId: id } }),
      this.prisma.rawMaterial.delete({ where: { id } }),
    ]);
    return material;
  }

  // Alerta simple de reposición (para dashboard)
  async findBelowMinStock() {
    const materials = await this.prisma.rawMaterial.findMany({ include: { stock: true } });
    return materials
      .map((m) => ({
        ...m,
        totalStock: m.stock.reduce((sum, s) => sum + Number(s.quantity), 0),
      }))
      .filter((m) => m.totalStock < Number(m.minStock));
  }

  // Kardex de materia prima (últimos movimientos)
  listMovements(rawMaterialId?: string) {
    return this.prisma.rawMaterialMovement.findMany({
      where: rawMaterialId ? { rawMaterialId } : undefined,
      include: { rawMaterial: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // ----- Almacenes (tabla compartida, la expone Raw Materials como dueño del stock) -----
  listWarehouses() {
    return this.prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  }

  createWarehouse(data: CreateWarehouseDto) {
    return this.prisma.warehouse.create({ data });
  }
}
