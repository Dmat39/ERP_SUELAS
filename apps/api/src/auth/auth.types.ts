import { UserRole } from '@prisma/client';

// Forma del usuario que viaja en el request tras validar el JWT.
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Contenido (claims) del JWT.
export interface JwtPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: UserRole;
}
