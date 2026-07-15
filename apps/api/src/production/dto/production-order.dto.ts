import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductionOrderDto {
  @IsString()
  bomId!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001, { message: 'La cantidad a producir debe ser mayor a 0' })
  quantityToProduce!: number;
}

export class CompleteProductionDto {
  @IsString()
  warehouseId!: string;
}
