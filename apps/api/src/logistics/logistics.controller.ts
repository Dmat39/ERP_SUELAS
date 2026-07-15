import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('shipments')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get()
  list() {
    return this.logisticsService.list();
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post()
  create(@Body() dto: CreateShipmentDto) {
    return this.logisticsService.createShipment(dto);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post(':id/dispatch')
  dispatch(@Param('id') id: string) {
    return this.logisticsService.dispatch(id);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post(':id/deliver')
  markDelivered(@Param('id') id: string) {
    return this.logisticsService.markDelivered(id);
  }
}
