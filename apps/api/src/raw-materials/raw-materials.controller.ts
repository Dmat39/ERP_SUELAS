import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RawMaterialsService } from './raw-materials.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('raw-materials')
export class RawMaterialsController {
  constructor(private readonly rawMaterialsService: RawMaterialsService) {}

  @Get()
  findAll() {
    return this.rawMaterialsService.findAll();
  }

  @Get('below-min-stock')
  findBelowMinStock() {
    return this.rawMaterialsService.findBelowMinStock();
  }

  @Get('movements')
  listMovements(@Query('rawMaterialId') rawMaterialId?: string) {
    return this.rawMaterialsService.listMovements(rawMaterialId);
  }

  // Almacenes (selects de compras/producción/inventario).
  @Get('warehouses')
  listWarehouses() {
    return this.rawMaterialsService.listWarehouses();
  }

  @Roles('ADMIN')
  @Post('warehouses')
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.rawMaterialsService.createWarehouse(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rawMaterialsService.findOne(id);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post()
  create(@Body() dto: CreateRawMaterialDto) {
    return this.rawMaterialsService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRawMaterialDto) {
    return this.rawMaterialsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rawMaterialsService.remove(id);
  }
}
