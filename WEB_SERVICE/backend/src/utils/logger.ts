/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
  LoggerOptions,
} from 'winston';

const { combine, timestamp, printf, colorize, json, errors } = format;

// Tipos para el contexto del log
interface LogContext {
  context?: string;
  stack?: string;
  [key: string]: unknown;
}

// Formato para consola (colorizado y legible)
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),

  printf((info) => {
    const {
      level,
      message,
      timestamp: ts,
      context,
      stack,
    } = info as unknown as LogContext & {
      level: string;
      message: string;
      timestamp: string;
    };
    const ctx = context ? `[${context}] ` : '';

    const msg = `${ts} ${level}: ${ctx}${message}`;
    return stack ? `${msg}\n${stack}` : msg;
  }),
);

// Formato para archivos (JSON)
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),

  json(),
);

// Niveles de log personalizados
const customLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colores para los niveles
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Aplicar colores
format.colorize().addColors(customColors);

// Interfaz para los métodos de logging
interface ILogger {
  error(message: string, context?: string, ...meta: unknown[]): void;
  warn(message: string, context?: string, ...meta: unknown[]): void;
  info(message: string, context?: string, ...meta: unknown[]): void;
  http(message: string, context?: string, ...meta: unknown[]): void;
  debug(message: string, context?: string, ...meta: unknown[]): void;
  child(context: string): ILogger;
}

/**
 * Logger singleton para la aplicación
 */
class LoggerService implements ILogger {
  private logger: WinstonLogger;
  private static instance: LoggerService | null = null;

  private constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    const options: LoggerOptions = {
      levels: customLevels,
      level: isProduction ? 'info' : 'debug',
      format: fileFormat,
      transports: [
        // Transporte para consola
        new transports.Console({
          format: consoleFormat,
          level: isProduction ? 'info' : 'debug',
        }),
        // Transporte para archivo de errores
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: fileFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Transporte para archivo combinado
        new transports.File({
          filename: 'logs/combined.log',
          format: fileFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    };

    this.logger = createLogger(options);

    // Si estamos en producción, añadir transporte para archivo de warnings
    if (isProduction) {
      this.logger.add(
        new transports.File({
          filename: 'logs/warn.log',
          level: 'warn',
          format: fileFormat,
          maxsize: 5242880,
          maxFiles: 5,
        }),
      );
    }
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public error(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.error(message, { context, ...meta });
  }

  public warn(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.warn(message, { context, ...meta });
  }

  public info(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.info(message, { context, ...meta });
  }

  public http(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.http(message, { context, ...meta });
  }

  public debug(message: string, context?: string, ...meta: unknown[]): void {
    this.logger.debug(message, { context, ...meta });
  }

  /**
   * Crea un child logger con un contexto fijo
   */
  public child(context: string): ILogger {
    const child = this.logger.child({ context });
    return {
      error: (message: string, ...meta: unknown[]) =>
        child.error(message, ...meta),
      warn: (message: string, ...meta: unknown[]) =>
        child.warn(message, ...meta),
      info: (message: string, ...meta: unknown[]) =>
        child.info(message, ...meta),
      http: (message: string, ...meta: unknown[]) =>
        child.http(message, ...meta),
      debug: (message: string, ...meta: unknown[]) =>
        child.debug(message, ...meta),
      error: function (
        message: string,
        context?: string,
        ...meta: unknown[]
      ): void {
        throw new Error('Function not implemented.');
      },
      warn: function (
        message: string,
        context?: string,
        ...meta: unknown[]
      ): void {
        throw new Error('Function not implemented.');
      },
      info: function (
        message: string,
        context?: string,
        ...meta: unknown[]
      ): void {
        throw new Error('Function not implemented.');
      },
      http: function (
        message: string,
        context?: string,
        ...meta: unknown[]
      ): void {
        throw new Error('Function not implemented.');
      },
      debug: function (
        message: string,
        context?: string,
        ...meta: unknown[]
      ): void {
        throw new Error('Function not implemented.');
      },
      child: function (context: string): ILogger {
        throw new Error('Function not implemented.');
      },
    };
  }
}

// Exportar una instancia única
export const logger = LoggerService.getInstance();

// Exportar una función para crear loggers con contexto
export function createContextLogger(context: string): ILogger {
  return logger.child(context);
}

// Tipos para el middleware HTTP
interface Request {
  method: string;
  originalUrl: string;
  ip?: string;
}

interface Response {
  statusCode: number;
  on: (event: string, callback: () => void) => void;
}

type NextFunction = () => void;

/**
 * Middleware para logging de requests HTTP
 */
export function httpLoggerMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { method, originalUrl } = req;
      const { statusCode } = res;

      const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

      if (statusCode >= 500) {
        logger.error(message, 'HTTP');
      } else if (statusCode >= 400) {
        logger.warn(message, 'HTTP');
      } else {
        logger.http(message, 'HTTP');
      }
    });

    next();
  };
}
