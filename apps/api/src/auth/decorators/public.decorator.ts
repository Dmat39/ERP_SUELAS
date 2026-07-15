import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Marca un endpoint como público (sin JWT). Lo usa el storefront:
// login, catálogo y checkout. El resto de la API exige autenticación.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
