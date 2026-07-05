import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditLogService } from '../../modules/audit/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Solo registrar métodos de escritura (POST, PUT, PATCH, DELETE)
    const method = request.method;
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Obtener información del usuario autenticado
    const user = (request as any).user;
    const accountId = user?.sub || null;

    // Obtener IP real
    const forwardedFor = request.headers['x-forwarded-for'];
    const ip = forwardedFor
      ? (Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : forwardedFor.split(',')[0]
        ).trim()
      : request.ip || request.connection?.remoteAddress || 'unknown';

    const userAgent = request.headers['user-agent'] || 'unknown';

    // Obtener datos de la entidad
    const entityName = controller.name.replace('Controller', '');
    const action = method;
    const entityId = request.params?.id
      ? parseInt(request.params.id, 10)
      : null;

    // Guardar datos antiguos para PUT/PATCH/DELETE
    const oldValues: Record<string, unknown> | null = null;
    const isUpdateOrDelete = ['PUT', 'PATCH', 'DELETE'].includes(method);

    // Para DELETE, no podemos obtener los datos antiguos después de la operación
    // Así que los guardamos antes
    if (method === 'DELETE' && entityId) {
      try {
        // Intentar obtener la entidad antes de eliminar
        // Esto depende del servicio, pero aquí lo dejamos como placeholder
        // idealmente deberías inyectar el servicio correspondiente
        // o usar un enfoque más genérico
      } catch (error) {
        // Si no se puede obtener, continuar
      }
    }

    return next.handle().pipe(
      tap({
        next: async (data: any) => {
          // Para PUT/PATCH, obtener los nuevos valores
          const newValues: Record<string, unknown> | null = null;

          if (['PUT', 'PATCH'].includes(method) && entityId) {
            // Intentar obtener la entidad después de la actualización
            // Esto depende del servicio específico
            // Lo dejamos como placeholder
          }

          // Si es DELETE o UPDATE, registrar el cambio
          if (isUpdateOrDelete || method === 'POST') {
            await this.auditLogService.log({
              accountId,
              moduleName: entityName,
              action: this.getActionName(method),
              entityName: entityName,
              entityId: entityId || undefined,
              oldValues: oldValues || undefined,
              newValues: newValues || undefined,
              ip,
              userAgent,
              metadata: {
                endpoint: request.url,
                method: request.method,
                statusCode: response.statusCode,
              },
            });
          }
        },
        error: async (error: any) => {
          // Registrar errores también
          await this.auditLogService.log({
            accountId,
            moduleName: entityName,
            action: `${this.getActionName(method)}_ERROR`,
            entityName: entityName,
            entityId: entityId || undefined,
            oldValues: oldValues || undefined,
            newValues: {
              error: error.message,
              stack: error.stack,
              statusCode: error.status || 500,
            },
            ip,
            userAgent,
            metadata: {
              endpoint: request.url,
              method: request.method,
              error: true,
            },
          });
        },
      }),
    );
  }

  private getActionName(method: string): string {
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actionMap[method] || method;
  }
}
