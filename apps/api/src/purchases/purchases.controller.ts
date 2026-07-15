import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import {
  CreatePurchaseOrderDto,
  ReceivePurchaseDto,
} from './dto/create-purchase-order.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('purchase-orders')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  listOrders() {
    return this.purchasesService.listOrders();
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.purchasesService.getOrder(id);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchasesService.create(dto);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post(':id/receive')
  receive(@Param('id') id: string, @Body() dto: ReceivePurchaseDto) {
    return this.purchasesService.receive(id, dto.warehouseId);
  }

  // Cancelar compra no recibida: solo el administrador.
  @Roles('ADMIN')
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.purchasesService.cancel(id);
  }
}
