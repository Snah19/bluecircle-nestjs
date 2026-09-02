import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const hashToken = (plaintextToken) => {
  return crypto.createHash('sha256').update(plaintextToken).digest('hex');
};

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
  ){}

  async login(
    {
      dto,
      meta,
    }: {
      dto: LoginDto;
      meta?: {
        userAgent?: string;
        ip?: string;
      }
    }
  ) {
    const userData = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!userData) {
      throw new NotFoundException("Can't find a user with this email.");
    }

    const { password, ...user } = userData;

    const passwordMatches = await bcrypt.compare(dto.password, password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect password');
    }

    const plaintextToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(plaintextToken);

    await this.prismaService.authToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ip,       
      }
    });

    return {
      token: plaintextToken,
      user,
    };
  }

  async logout(plaintextToken: string) {
    const tokenHash = hashToken(plaintextToken);
    await this.prismaService.authToken.deleteMany({
      where: {
        tokenHash,
      },
    });
  }

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