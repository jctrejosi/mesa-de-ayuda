import { Request } from 'express';

export interface AuthenticatedUser {
  sub: number; // account.id
  username: string;
  employeeId: number;
  role?: string; // opcional, si se carga desde la BD
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

declare global {
  interface Express {
    Request: {
      user?: AuthenticatedUser;
    };
  }
}
