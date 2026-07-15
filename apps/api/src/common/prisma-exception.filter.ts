import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

// Convierte errores conocidos de Prisma en respuestas HTTP claras en español,
// en vez de dejar que se filtre un 500 genérico con el stack de la base de datos.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Error de base de datos';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        message = `Ya existe un registro con ese valor único${target ? ` (${target})` : ''}`;
        break;
      }
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'El registro solicitado no existe';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message =
          'No se puede completar la operación: el registro está vinculado a otros datos del sistema';
        break;
    }

    res.status(status).json({
      statusCode: status,
      error: message,
      code: exception.code,
    });
  }
}
