import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { RawMaterialsModule } from './raw-materials/raw-materials.module';
import { ProductionModule } from './production/production.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SalesModule } from './sales/sales.module';
import { InvoicingModule } from './invoicing/invoicing.module';
import { LogisticsModule } from './logistics/logistics.module';

// ESTA es la lista de módulos "instalados". Para agregar un módulo nuevo
// (ej. Accounting, CRM), solo lo importas y lo agregas al array —
// nunca necesitas tocar los módulos existentes.
//
// Para "quitar" un módulo, lo comentas/eliminas de este array.
// Como ningún módulo llama directamente a otro (solo vía eventos),
// el resto sigue funcionando sin romperse.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // carga .env para toda la app
    EventEmitterModule.forRoot(), // el "tablero de anuncios" central
    AuthModule, // autenticación + guards globales (JWT + roles)
    CoreModule,
    RawMaterialsModule,
    ProductionModule,
    InventoryModule,
    PurchasesModule,
    SalesModule,
    InvoicingModule,
    LogisticsModule,
    // AccountingModule,   <- así se vería agregar un módulo futuro
    // CrmModule,
  ],
})
export class AppModule {}
