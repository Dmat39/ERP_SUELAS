import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

// Módulo base del que dependen los demás (usuarios, contactos).
// Equivalente al módulo "base" de Odoo.
@Module({
  controllers: [ContactsController, UsersController],
  providers: [ContactsService, UsersService, PrismaService],
  exports: [PrismaService],
})
export class CoreModule {}
