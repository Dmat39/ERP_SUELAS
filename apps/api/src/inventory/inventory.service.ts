import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Catálogo para el storefront público: forma limpia (precio y stock ya resueltos).
  async findCatalog() {
    const templates = await this.prisma.productTemplate.findMany({
      where: { active: true },
      include: {
        category: true,
        variants: {
          include: {
            attributes: { include: { attributeValue: { include: { attribute: true } } } },
            stock: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      basePrice: Number(t.basePrice),
      category: t.category?.name ?? null,
      variants: t.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        price: v.priceOverride != null ? Number(v.priceOverride) : Number(t.basePrice),
        stock: v.stock.reduce((sum, s) => sum + Number(s.quantity), 0),
        attributes: v.attributes.map((a) => ({
          attribute: a.attributeValue.attribute.name,
          value: a.attributeValue.value,
        })),
      })),
    }));
  }

  // Listado admin de productos terminados (template + variantes + stock).
  listTemplates() {
    return this.prisma.productTemplate.findMany({
      include: {
        category: true,
        variants: { include: { stock: true, attributes: { include: { attributeValue: true } } } },
      },
      orderBy: { name: 'asc' },
    });
  }

  // Variantes "planas" para selects (ventas, producción, BOM): incluye nombre, precio y stock.
  async listVariants() {
    const variants = await this.prisma.productVariant.findMany({
      include: {
        template: true,
        stock: true,
        attributes: { include: { attributeValue: { include: { attribute: true } } } },
      },
      orderBy: { sku: 'asc' },
    });

    return variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      productName: v.template.name,
      price: v.priceOverride != null ? Number(v.priceOverride) : Number(v.template.basePrice),
      priceOverride: v.priceOverride != null ? Number(v.priceOverride) : null,
      stock: v.stock.reduce((sum, s) => sum + Number(s.quantity), 0),
      attributes: v.attributes.map((a) => ({
        attribute: a.attributeValue.attribute.name,
        value: a.attributeValue.value,
      })),
    }));
  }

  // Atributos + valores (para el formulario de creación de variante).
  listAttributes() {
    return this.prisma.attribute.findMany({ include: { values: true } });
  }

  createTemplate(data: CreateTemplateDto) {
    return this.prisma.productTemplate.create({ data });
  }

  // Crea una variante (ej: talla 39) para un template existente.
  createVariant(dto: CreateVariantDto) {
    return this.prisma.productVariant.create({
      data: {
        templateId: dto.templateId,
        sku: dto.sku,
        priceOverride: dto.priceOverride,
        attributes: { create: dto.attributeValueIds.map((id) => ({ attributeValueId: id })) },
      },
    });
  }

  updateVariant(id: string, dto: UpdateVariantDto) {
    return this.prisma.productVariant.update({
      where: { id },
      data: { sku: dto.sku, priceOverride: dto.priceOverride },
    });
  }

  // Elimina una variante solo si no tiene historia (stock, movimientos,
  // pedidos o recetas). Limpia sus atributos y filas de stock en cero.
  async removeVariant(id: string) {
    const [movs, orderItems, boms, stock] = await Promise.all([
      this.prisma.stockMovement.count({ where: { variantId: id } }),
      this.prisma.orderItem.count({ where: { variantId: id } }),
      this.prisma.bom.count({ where: { variantId: id } }),
      this.prisma.productStock.findMany({ where: { variantId: id } }),
    ]);
    const stockTotal = stock.reduce((s, x) => s + Number(x.quantity), 0);
    if (movs + orderItems + boms > 0 || stockTotal > 0) {
      throw new BadRequestException(
        'No se puede eliminar: la variante tiene stock, movimientos, pedidos o recetas asociadas.',
      );
    }
    const [, , variant] = await this.prisma.$transaction([
      this.prisma.productVariantAttribute.deleteMany({ where: { variantId: id } }),
      this.prisma.productStock.deleteMany({ where: { variantId: id } }),
      this.prisma.productVariant.delete({ where: { id } }),
    ]);
    return variant;
  }

  getStock(variantId: string, warehouseId: string) {
    return this.prisma.productStock.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } },
    });
  }

  // Kardex de producto terminado.
  listMovements(variantId?: string) {
    return this.prisma.stockMovement.findMany({
      where: variantId ? { variantId } : undefined,
      include: { variant: { include: { template: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
