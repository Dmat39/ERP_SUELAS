import { BadRequestException, Injectable } from '@nestjs/common';
import { InvoiceType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { InvoicePdfService, notaVentaSerie } from './invoice-pdf.service';

@Injectable()
export class InvoicingService {
  constructor(
    private prisma: PrismaService,
    private pdf: InvoicePdfService,
  ) {}

  list() {
    return this.prisma.invoice.findMany({
      include: { order: { include: { customer: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getByOrder(orderId: string) {
    return this.prisma.invoice.findUnique({
      where: { orderId },
      include: { order: { include: { customer: true } } },
    });
  }

  // Genera comprobante interno con numeración propia.
  // sunatStatus queda en 'NO_ENVIADO' — punto de entrada listo para
  // cuando conectes un PSE real (Nubefact, Efact, etc.) más adelante.
  async generate(orderId: string, type: InvoiceType) {
    const order = await this.prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    if (order.status === 'PENDIENTE') {
      throw new BadRequestException('Confirma el pedido antes de emitir el comprobante');
    }

    const existing = await this.prisma.invoice.findUnique({ where: { orderId } });
    if (existing) {
      throw new BadRequestException('Este pedido ya tiene un comprobante emitido');
    }

    const serie = type === 'BOLETA' ? 'B001' : 'F001';
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { serie },
      orderBy: { numero: 'desc' },
    });
    const numero = (lastInvoice?.numero ?? 0) + 1;

    const invoice = await this.prisma.invoice.create({
      data: { orderId, type, serie, numero, sunatStatus: 'NO_ENVIADO' },
    });

    // El PDF se genera al vuelo al descargarlo; guardamos la ruta de descarga.
    return this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl: `/invoices/${invoice.id}/pdf` },
    });
  }

  // Corrige el tipo del comprobante (solo ADMIN, por si hubo equivocación).
  // Al cambiar de tipo se asigna la serie correspondiente y el SIGUIENTE
  // número de esa serie — el número anterior queda como hueco anulado.
  async updateType(id: string, type: InvoiceType) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({ where: { id } });
    if (invoice.type === type) return invoice;

    const serie = type === 'BOLETA' ? 'B001' : 'F001';
    const last = await this.prisma.invoice.findFirst({
      where: { serie },
      orderBy: { numero: 'desc' },
    });

    return this.prisma.invoice.update({
      where: { id },
      data: { type, serie, numero: (last?.numero ?? 0) + 1 },
    });
  }

  // Anula (elimina) el comprobante — el pedido queda libre para emitir uno nuevo.
  remove(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }

  // Genera el PDF del comprobante al vuelo (sin almacenarlo — suficiente para el MVP).
  async getPdf(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: {
        order: {
          include: {
            customer: true,
            items: {
              include: {
                variant: {
                  include: {
                    template: true,
                    attributes: { include: { attributeValue: { include: { attribute: true } } } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const buffer = await this.pdf.build(invoice);
    const filename = `nota-venta-${notaVentaSerie(invoice.serie)}-${String(invoice.numero).padStart(6, '0')}.pdf`;
    return { buffer, filename };
  }
}
