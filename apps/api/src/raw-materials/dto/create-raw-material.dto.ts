import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateRawMaterialDto {
  @IsString()
  @MinLength(2, { message: 'El nombre es obligatorio' })
  name!: string;

  @IsString()
  @MinLength(1, { message: 'La unidad es obligatoria (kg, lt, unidad)' })
  unit!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPerUnit!: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minStock?: number;
}
