import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../common/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

// Módulo de autenticación. Registra los dos guards globales (APP_GUARD):
// 1) JwtAuthGuard  -> exige token en todo endpoint salvo los @Public()
// 2) RolesGuard    -> aplica @Roles(...) cuando esté presente
// Al ser APP_GUARD, protegen toda la app sin que cada módulo tenga que enterarse.
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-secret',
        // expiresIn acepta formato de `ms` (ej. "8h"); el tipo es más estrecho que string.
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '8h') as any },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
