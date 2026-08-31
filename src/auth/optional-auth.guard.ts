// src/auth/optional-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      return true; // no token - proceed as an anonymous request
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const user = await this.authService.validateToken(token);

    if (user) {
      request.user = user;
    }

    return true;
  }
}