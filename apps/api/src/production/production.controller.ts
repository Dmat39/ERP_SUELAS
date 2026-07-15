import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateBomDto } from './dto/create-bom.dto';
import {
  CompleteProductionDto,
  CreateProductionOrderDto,
} from './dto/production-order.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  // ---------- BOM ----------
  @Get('boms')
  listBoms() {
    return this.productionService.listBoms();
  }

  @Get('boms/:id')
  getBom(@Param('id') id: string) {
    return this.productionService.getBom(id);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post('boms')
  createBom(@Body() dto: CreateBomDto) {
    return this.productionService.createBom(dto);
  }

  // Eliminar receta no usada: solo el administrador.
  @Roles('ADMIN')
  @Delete('boms/:id')
  removeBom(@Param('id') id: string) {
    return this.productionService.removeBom(id);
  }

  // ---------- Órdenes de producción ----------
  @Get('production-orders')
  listOrders() {
    return this.productionService.listOrders();
  }

  @Get('production-orders/:id')
  getOrder(@Param('id') id: string) {
    return this.productionService.getOrder(id);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post('production-orders')
  create(@Body() dto: CreateProductionOrderDto) {
    return this.productionService.create(dto.bomId, dto.quantityToProduce);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post('production-orders/:id/start')
  start(@Param('id') id: string) {
    return this.productionService.start(id);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post('production-orders/:id/complete')
  complete(@Param('id') id: string, @Body() dto: CompleteProductionDto) {
    return this.productionService.complete(id, dto.warehouseId);
  }

  // Cancelar orden no completada: solo el administrador.
  @Roles('ADMIN')
  @Post('production-orders/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.productionService.cancel(id);
  }
}
