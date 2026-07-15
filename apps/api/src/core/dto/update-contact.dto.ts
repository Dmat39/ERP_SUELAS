import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// Todos los campos opcionales: se actualiza solo lo enviado.
export class UpdateContactDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre es obligatorio' })
  name?: string;

  @IsOptional()
  @IsString()
  docType?: string;

  @IsOptional()
  @IsString()
  docNumber?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Correo inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  isCustomer?: boolean;

  @IsOptional()
  @IsBoolean()
  isSupplier?: boolean;
}
