import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  // Filtro opcional por tipo para poblar selects (clientes en Ventas, proveedores en Compras).
  findAll(filter?: { isCustomer?: boolean; isSupplier?: boolean }) {
    return this.prisma.contact.findMany({
      where: {
        ...(filter?.isCustomer ? { isCustomer: true } : {}),
        ...(filter?.isSupplier ? { isSupplier: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.contact.findUniqueOrThrow({ where: { id } });
  }

  create(data: CreateContactDto) {
    return this.prisma.contact.create({ data });
  }

  update(id: string, data: UpdateContactDto) {
    return this.prisma.contact.update({ where: { id }, data });
  }

  // Elimina solo si el contacto no tiene historial (pedidos o compras).
  async remove(id: string) {
    const [orders, purchases] = await Promise.all([
      this.prisma.order.count({ where: { customerId: id } }),
      this.prisma.purchaseOrder.count({ where: { supplierId: id } }),
    ]);
    if (orders + purchases > 0) {
      throw new BadRequestException(
        'No se puede eliminar: el contacto tiene pedidos o compras registradas. Corrige sus datos con Editar.',
      );
    }
    return this.prisma.contact.delete({ where: { id } });
  }
}
