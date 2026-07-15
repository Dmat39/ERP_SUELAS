import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SalesService } from './sales.service';
import { ConfirmOrderDto, CreateOrderDto } from './dto/create-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  listOrders() {
    return this.salesService.listOrders();
  }

  // Público: checkout del storefront (sin login). Crea el pedido WEB.
  @Public()
  @Post('checkout')
  checkout(@Body() dto: CheckoutDto) {
    return this.salesService.checkout(dto);
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.salesService.getOrder(id);
  }

  // Pedido interno del panel admin.
  @Roles('ADMIN', 'VENDEDOR')
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.salesService.create(dto);
  }

  @Roles('ADMIN', 'VENDEDOR')
  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body() dto: ConfirmOrderDto) {
    return this.salesService.confirm(id, dto.warehouseId);
  }

  // Cancelar pedido pendiente: solo el administrador.
  @Roles('ADMIN')
  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.salesService.cancel(id);
  }
}
