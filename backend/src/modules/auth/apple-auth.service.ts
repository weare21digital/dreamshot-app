import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { PrismaService } from '../prisma/prisma.service';
import { environmentConfig } from '../../config/config';

interface AppleTokenPayload {
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  iss: string;
  aud: string;
}

@Injectable()
export class AppleAuthService {
  private readonly logger = new Logger(AppleAuthService.name);
  private readonly jwtRefreshSecret = environmentConfig.jwt.refreshSecret;
  private readonly jwksClient = jwksRsa({
    jwksUri: 'https://appleid.apple.com/auth/keys',
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000, // 10 minutes
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err: any, key: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(key!.getPublicKey());
      });
    });
  }

  private async verifyAppleToken(identityToken: string): Promise<AppleTokenPayload> {
    const decoded = jwt.decode(identityToken, { complete: true });
    if (!decoded || !decoded.header.kid) {
      throw new UnauthorizedException('Invalid Apple identity token');
    }

    const publicKey = await this.getSigningKey(decoded.header.kid);

    return new Promise((resolve, reject) => {
      jwt.verify(
        identityToken,
        publicKey,
        {
          algorithms: ['RS256'],
          issuer: 'https://appleid.apple.com',
          audience: 'com.mobileskeleton.app',
        },
        (err, payload) => {
          if (err) {
            reject(new UnauthorizedException('Apple token verification failed: ' + err.message));
            return;
          }
          resolve(payload as AppleTokenPayload);
        },
      );
    });
  }

  async appleLogin(identityToken: string, fullName?: string) {
    this.logger.log('🍎 appleLogin method called');

    try {
      this.logger.log('🍎 Verifying identity token with Apple...');
      const payload = await this.verifyAppleToken(identityToken);
      this.logger.log('✅ Token verified successfully');

      const { sub: appleId, email } = payload;
      this.logger.log(`🍎 Extracted user data - Email: ${email}, AppleID: ${appleId}`);

      if (!email && !appleId) {
        throw new UnauthorizedException('No email or Apple ID in token');
      }

      this.logger.log('🍎 Looking up user in database...');
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { appleId },
            ...(email ? [{ email }] : []),
          ],
        },
      });

      if (user) {
        this.logger.log(`✅ Found existing user: ${user.email} (ID: ${user.id})`);
        if (!user.appleId) {
          this.logger.log('🍎 Updating user with Apple ID...');
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { appleId },
          });
          this.logger.log('✅ User updated with Apple ID');
        }
      } else {
        this.logger.log('🍎 No existing user found, creating new user...');
        const nickname = fullName || email?.split('@')[0] || 'Apple User';
        user = await this.prisma.user.create({
          data: {
            email: email || `${appleId}@privaterelay.appleid.com`,
            nickname,
            appleId,
            isEmailVerified: true,
            isVerified: true,
          },
        });
        this.logger.log(`✅ New user created: ${user.email} (ID: ${user.id})`);
      }

      // Update name if provided and user doesn't have one
      if (fullName && !user.firstName) {
        const nameParts = fullName.split(' ');
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: nameParts[0] || undefined,
            lastName: nameParts.slice(1).join(' ') || undefined,
            nickname: fullName || user.nickname,
          },
        });
      }

      this.logger.log('🍎 Generating JWT tokens...');
      const accessToken = this.jwtService.sign({
        userId: user.id,
        email: user.email,
        type: 'access',
      });

      const refreshToken = this.jwtService.sign(
        { userId: user.id, email: user.email, type: 'refresh' },
        { secret: this.jwtRefreshSecret, expiresIn: '7d' },
      );
      this.logger.log('✅ JWT tokens generated');

      this.logger.log('🍎 Saving refresh token to database...');
      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      this.logger.log('✅ Refresh token saved');

      this.logger.log(`✅✅✅ Apple login successful for user: ${user.email}`);

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            profilePicture: user.profilePicture,
            isEmailVerified: user.isEmailVerified,
            isPremium: user.isPremium,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      };
    } catch (error) {
      this.logger.error('❌❌❌ Apple login failed with error:');
      this.logger.error(error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Apple authentication failed: ' + error);
    }
  }
}
