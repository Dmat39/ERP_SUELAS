import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @MinLength(2, { message: 'El nombre del producto es obligatorio' })
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice!: number;
}
