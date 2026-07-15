import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

// Datos de la empresa que aparecen en el encabezado del comprobante.
// Cuando haya multi-configuración, esto puede salir de una tabla Settings.
const EMPRESA = {
  nombre: 'Suelas ZPT',
  ruc: 'RUC 20000000001',
  direccion: 'Parque Industrial Mz. A Lt. 1, Lima - Perú',
  contacto: 'ventas@suelaszpt.pe · 999 999 999',
};

// Paleta alineada al sistema de diseño del panel ("claro técnico").
const C = {
  primary: '#0d9488',
  ink: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  soft: '#f8fafc',
};

// Forma mínima de los datos que necesita el PDF (subconjunto del include de Prisma).
export interface InvoicePdfData {
  type: 'BOLETA' | 'FACTURA';
  serie: string;
  numero: number;
  createdAt: Date;
  order: {
    total: unknown; // Prisma Decimal
    createdAt: Date;
    customer: {
      name: string;
      docType: string | null;
      docNumber: string | null;
      address: string | null;
    };
    items: {
      quantity: number;
      unitPrice: unknown; // Prisma Decimal
      variant: {
        sku: string;
        template: { name: string };
        attributes: { attributeValue: { value: string; attribute: { name: string } } }[];
      };
    }[];
  };
}

const money = (v: unknown) =>
  `S/ ${new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(v))}`;

const fechaLarga = (d: Date) =>
  new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);

// El PDF que se entrega al cliente es una NOTA DE VENTA (documento no
// tributario, estándar mientras no hay integración SUNAT). Internamente se
// mantienen las series B001/F001; aquí se mapean a series de nota de venta
// para que las numeraciones no choquen entre sí.
export const notaVentaSerie = (serie: string) => (serie.startsWith('F') ? 'NV02' : 'NV01');

@Injectable()
export class InvoicePdfService {
  // Genera el comprobante como Buffer (A4, formato clásico tipo Odoo).
  build(inv: InvoicePdfData): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(chunks))),
    );

    const numeroFmt = `${notaVentaSerie(inv.serie)}-${String(inv.numero).padStart(6, '0')}`;
    const titulo = 'NOTA DE VENTA';

    // ---------- Encabezado: logo + empresa (izquierda) ----------
    doc.roundedRect(50, 50, 44, 44, 9).fill(C.primary);
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(14)
      .text('ZPT', 50, 65, { width: 44, align: 'center' });

    doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(16).text(EMPRESA.nombre, 106, 52);
    doc
      .fillColor(C.muted)
      .font('Helvetica')
      .fontSize(9)
      .text(EMPRESA.ruc, 106, 72)
      .text(EMPRESA.direccion, 106, 84)
      .text(EMPRESA.contacto, 106, 96);

    // ---------- Recuadro del comprobante (derecha) ----------
    doc.roundedRect(380, 50, 165, 62, 6).lineWidth(1).stroke(C.border);
    doc
      .fillColor(C.primary)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titulo, 380, 60, { width: 165, align: 'center' });
    doc
      .fillColor(C.ink)
      .fontSize(14)
      .text(numeroFmt, 380, 74, { width: 165, align: 'center' });
    doc
      .fillColor(C.muted)
      .font('Helvetica')
      .fontSize(9)
      .text(fechaLarga(inv.createdAt), 380, 94, { width: 165, align: 'center' });

    // ---------- Datos del cliente ----------
    const cliente = inv.order.customer;
    let y = 140;
    doc.moveTo(50, y).lineTo(545, y).lineWidth(1).stroke(C.border);
    y += 12;
    doc.fillColor(C.muted).font('Helvetica-Bold').fontSize(8.5).text('CLIENTE', 50, y);
    y += 13;
    doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(11).text(cliente.name, 50, y);
    y += 15;
    doc.fillColor(C.muted).font('Helvetica').fontSize(9);
    if (cliente.docType && cliente.docNumber) {
      doc.text(`${cliente.docType}: ${cliente.docNumber}`, 50, y);
      y += 12;
    }
    if (cliente.address) {
      doc.text(cliente.address, 50, y, { width: 400 });
      y += doc.heightOfString(cliente.address, { width: 400 }) + 2;
    }
    y += 14;

    // ---------- Tabla de items ----------
    const col = { item: 50, qty: 340, price: 400, sub: 475 };
    const right = 545;

    // Cabecera de tabla
    doc.rect(50, y, right - 50, 20).fill(C.soft);
    doc.fillColor(C.muted).font('Helvetica-Bold').fontSize(8.5);
    doc.text('PRODUCTO', col.item + 6, y + 6);
    doc.text('CANT.', col.qty, y + 6, { width: 50, align: 'right' });
    doc.text('P. UNIT.', col.price, y + 6, { width: 65, align: 'right' });
    doc.text('SUBTOTAL', col.sub, y + 6, { width: right - col.sub - 6, align: 'right' });
    y += 20;

    doc.font('Helvetica').fontSize(9.5);
    for (const item of inv.order.items) {
      const talla = item.variant.attributes.find(
        (a) => a.attributeValue.attribute.name.toLowerCase() === 'talla',
      )?.attributeValue.value;
      const nombre = `${item.variant.template.name}${talla ? ` — Talla ${talla}` : ''}  (${item.variant.sku})`;
      const subtotal = item.quantity * Number(item.unitPrice);

      const rowH = Math.max(
        18,
        doc.heightOfString(nombre, { width: col.qty - col.item - 16 }) + 8,
      );
      doc.fillColor(C.ink).text(nombre, col.item + 6, y + 5, { width: col.qty - col.item - 16 });
      doc.text(String(item.quantity), col.qty, y + 5, { width: 50, align: 'right' });
      doc.text(money(item.unitPrice), col.price, y + 5, { width: 65, align: 'right' });
      doc.text(money(subtotal), col.sub, y + 5, {
        width: right - col.sub - 6,
        align: 'right',
      });
      y += rowH;
      doc.moveTo(50, y).lineTo(right, y).lineWidth(0.5).stroke(C.border);
    }

    // ---------- Total destacado ----------
    y += 12;
    doc.roundedRect(360, y, right - 360, 30, 6).fill(C.soft);
    doc
      .fillColor(C.ink)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('TOTAL', 372, y + 9);
    doc
      .fillColor(C.primary)
      .fontSize(13)
      .text(money(inv.order.total), 430, y + 8, { width: right - 430 - 8, align: 'right' });

    // ---------- Footer ----------
    doc
      .fillColor(C.muted)
      .font('Helvetica')
      .fontSize(8)
      .text(`Generado por ${EMPRESA.nombre} ERP`, 50, 760, { width: 495, align: 'center' });

    doc.end();
    return done;
  }
}
