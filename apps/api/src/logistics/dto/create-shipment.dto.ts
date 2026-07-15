import { IsString, MinLength } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  orderId!: string;

  @IsString()
  @MinLength(5, { message: 'Ingresa una dirección de despacho válida' })
  address!: string;
}
