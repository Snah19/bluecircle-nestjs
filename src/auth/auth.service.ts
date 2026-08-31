import {
  Injectable
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const hashToken = (plaintextToken) => {
  return crypto.createHash('sha256').update(plaintextToken).digest('hex');
};

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
  ){}

  async validateToken(plaintextToken: string) {
    const tokenHash = hashToken(plaintextToken);

    const authToken = await this.prismaService.authToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: {
          omit: {
            password: true,
          }
        }
      }
    });

    if (!authToken || authToken.expiresAt < new Date()) {
      return null;
    }

    // sliding expiry: touch on use, capped at TOKEN_TTL_MS from now
    await this.prismaService.authToken.update({
      where: {
        id: authToken.id,
      },
      data: {
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      }
    });

    return authToken.user;
  }
}