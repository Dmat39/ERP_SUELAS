import { IsString, MinLength } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @MinLength(2, { message: 'El nombre del almacén es obligatorio' })
  name!: string;
}
