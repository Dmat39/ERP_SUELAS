import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Público: este endpoint lo consume el storefront.
  @Public()
  @Get('catalog')
  getCatalog() {
    return this.inventoryService.findCatalog();
  }

  @Get()
  listTemplates() {
    return this.inventoryService.listTemplates();
  }

  @Get('variants')
  listVariants() {
    return this.inventoryService.listVariants();
  }

  @Get('attributes')
  listAttributes() {
    return this.inventoryService.listAttributes();
  }

  @Get('movements')
  listMovements(@Query('variantId') variantId?: string) {
    return this.inventoryService.listMovements(variantId);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post('templates')
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.inventoryService.createTemplate(dto);
  }

  @Roles('ADMIN', 'ALMACENERO')
  @Post('variants')
  createVariant(@Body() dto: CreateVariantDto) {
    return this.inventoryService.createVariant(dto);
  }

  @Roles('ADMIN')
  @Patch('variants/:id')
  updateVariant(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.inventoryService.updateVariant(id, dto);
  }

  @Roles('ADMIN')
  @Delete('variants/:id')
  removeVariant(@Param('id') id: string) {
    return this.inventoryService.removeVariant(id);
  }
}
