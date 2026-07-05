import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

// Tipo para el usuario autenticado
interface AuthenticatedUser {
  sub: number;
  username: string;
  employeeId: number;
  role: 'admin' | 'manager' | 'employee';
}

// Tipo para Request con usuario
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// Tipo para la respuesta de HttpException
interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class SentryFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<AuthenticatedRequest>();

    // Enviar a Sentry
    Sentry.captureException(exception, {
      tags: {
        endpoint: request.url,
        method: request.method,
        statusCode: this.getStatusCode(exception),
      },
      extra: {
        headers: this.sanitizeHeaders(request.headers),
        body: this.sanitizeBody(request.body),
        query: request.query,
        params: request.params,
        user: request.user,
      },
    });
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && response !== null) {
        const resp = response as HttpExceptionResponse;
        if (Array.isArray(resp.message)) {
          return resp.message.join(', ');
        }
        return resp.message || 'Error en la solicitud';
      }
      return 'Error en la solicitud';
    }
    return 'Error interno del servidor';
  }

  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const sanitized = { ...headers };
    const sensitiveKeys = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-request-id',
    ];
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[FILTERED]';
      }
    }
    return sanitized;
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body } as Record<string, unknown>;
    const sensitiveKeys = [
      'password',
      'passwordHash',
      'currentPassword',
      'newPassword',
      'token',
    ];

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[FILTERED]';
      }
    }

    return sanitized;
  }
}
