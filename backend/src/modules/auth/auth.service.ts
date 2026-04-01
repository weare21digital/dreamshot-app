import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RefreshTokenDto } from './dto/auth.dto';
import { environmentConfig } from '../../config/config';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtRefreshSecret = environmentConfig.jwt.refreshSecret;
  private readonly jwtRefreshExpiresIn = environmentConfig.jwt.refreshExpiresIn;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Magic link login - email only, no password
   * New users: auto-create account + instant login
   * Existing users: send 6-char code via email
   */
  async emailLogin(email: string) {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // New user: auto-create and login immediately
    if (!existingUser) {
      const nickname = normalizedEmail.split('@')[0] || 'User';
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          nickname,
          isVerified: true,
          isEmailVerified: true,
        },
      });

      const tokens = this.generateTokenPair(user.id, user.email);
      await this.createSession(user.id, tokens.refreshToken);

      this.logger.log(`New user created via email login: ${user.email}`);

      return {
        success: true,
        data: {
          isNewUser: true,
          tokens,
        },
      };
    }

    // Existing user: invalidate old codes and send new one
    await this.prisma.authCode.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    const code = this.generateAuthCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.authCode.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt,
      },
    });

    await this.emailService.sendAuthCodeEmail(normalizedEmail, code);

    this.logger.log(`Auth code generated for: ${normalizedEmail}`);

    return {
      success: true,
      data: {
        isNewUser: false,
        codeSent: true,
      },
    };
  }

  /**
   * Verify the 6-char code and login
   */
  async verifyCode(email: string, code: string) {
    const normalizedEmail = email.toLowerCase();
    const now = new Date();

    const activeCode = await this.prisma.authCode.findFirst({
      where: { email: normalizedEmail, used: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeCode) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    // Max 3 attempts per code
    if (activeCode.attempts >= 3) {
      await this.prisma.authCode.update({
        where: { id: activeCode.id },
        data: { used: true },
      });
      throw new UnauthorizedException('Too many attempts. Please request a new code.');
    }

    // Check expiry
    if (activeCode.expiresAt < now) {
      await this.prisma.authCode.update({
        where: { id: activeCode.id },
        data: { used: true },
      });
      throw new UnauthorizedException('Code expired. Please request a new code.');
    }

    // Check code match
    if (activeCode.code !== code) {
      const updated = await this.prisma.authCode.update({
        where: { id: activeCode.id },
        data: { attempts: { increment: 1 } },
      });

      if (updated.attempts >= 3) {
        await this.prisma.authCode.update({
          where: { id: activeCode.id },
          data: { used: true },
        });
      }

      throw new UnauthorizedException('Invalid code');
    }

    // Code is valid - login the user
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = this.generateTokenPair(user.id, user.email);
    await this.createSession(user.id, tokens.refreshToken);

    // Mark code as used
    await this.prisma.authCode.update({
      where: { id: activeCode.id },
      data: { used: true },
    });

    this.logger.log(`User logged in via auth code: ${user.email}`);

    return {
      success: true,
      data: {
        tokens,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(data: RefreshTokenDto) {
    const { refreshToken } = data;

    try {
      this.jwtService.verify(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.session.delete({ where: { id: session.id } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const newAccessToken = this.generateAccessToken(session.user.id, session.user.email);

    this.logger.log(`Access token refreshed for user: ${session.user.email}`);

    return {
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    };
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({
      where: { token: refreshToken },
    });

    this.logger.log('User logged out successfully');

    return {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    };
  }

  generateTokenPair(userId: string, email: string): TokenPair {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.jwtService.sign(
      { userId, email, type: 'refresh' },
      { secret: this.jwtRefreshSecret, expiresIn: this.jwtRefreshExpiresIn },
    );
    return { accessToken, refreshToken };
  }

  private generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign({ userId, email, type: 'access' });
  }

  private async createSession(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.session.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  private generateAuthCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      const index = crypto.randomInt(0, chars.length);
      code += chars[index];
    }
    return code;
  }
}
