import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Global()
@Module({})
export class SentryModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const dsn = this.configService.get<string>('SENTRY_DSN');

    if (!dsn) {
      console.warn(
        'SENTRY_DSN not configured. Sentry will not be initialized.',
      );
      return;
    }

    Sentry.init({
      dsn,

      environment: this.configService.get('NODE_ENV', 'development'),

      release: this.configService.get('SENTRY_RELEASE', '1.0.0'),

      integrations: [nodeProfilingIntegration()],

      tracesSampleRate: this.configService.get(
        'SENTRY_TRACES_SAMPLE_RATE',
        0.1,
      ),

      profilesSampleRate: this.configService.get(
        'SENTRY_PROFILES_SAMPLE_RATE',
        0.1,
      ),

      attachStacktrace: true,

      includeLocalVariables: true,

      ignoreErrors: [
        'AxiosError',
        'ValidationError',
        'BadRequestException',
        'NotFoundException',
      ],

      beforeSend(event) {
        const headers = event.request?.headers;

        if (headers) {
          delete headers.authorization;
          delete headers['x-api-key'];
          delete headers.cookie;
        }

        const data = event.request?.data;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const requestData = data as Record<string, unknown>;

          if ('password' in requestData) {
            requestData.password = '[FILTERED]';
          }

          if ('passwordHash' in requestData) {
            requestData.passwordHash = '[FILTERED]';
          }
        }

        return event;
      },
    });

    console.log('Sentry initialized successfully.');
  }
}
