import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// Datos del cliente que llegan desde el storefront (sin login).
export class CheckoutCustomerDto {
  @IsString()
  @MinLength(2, { message: 'Ingresa tu nombre' })
  name!: string;

  @IsOptional()
  @IsString()
  docType?: string;

  @IsOptional()
  @IsString()
  docNumber?: string;

  // Obligatorio: la fábrica llama al cliente para validar el pedido web
  // antes de confirmarlo.
  @IsString()
  @MinLength(6, { message: 'Ingresa un teléfono para coordinar tu pedido' })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo inválido' })
  email?: string;

  @IsString()
  @MinLength(5, { message: 'Ingresa una dirección de entrega' })
  address!: string;
}

export class CheckoutItemDto {
  @IsString()
  variantId!: string;

  @IsInt()
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity!: number;
}

// El precio NO viene del cliente: lo resuelve la API desde la variante.
export class CheckoutDto {
  @ValidateNested()
  @Type(() => CheckoutCustomerDto)
  customer!: CheckoutCustomerDto;

  @IsArray()
  @ArrayNotEmpty({ message: 'Tu carrito está vacío' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];
}
