import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request as ExRequest, Response as ExResponse } from 'express';

export interface Response<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<ExRequest>();
    const response = ctx.getResponse<ExResponse>();

    return next.handle().pipe(
      map((data: T) => ({
        data,
        statusCode: response.statusCode || HttpStatus.OK,
        message: 'Operación exitosa',
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
