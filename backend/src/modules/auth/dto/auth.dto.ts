import { IsEmail, IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class EmailLoginDto {
  @IsEmail()
  email: string;
}

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^[A-Z0-9]{6}$/, { message: 'Code must be 6 characters (A-Z, 0-9)' })
  code: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @IsString()
  refreshToken: string;
}

export class GoogleLoginDto {
  @IsString()
  idToken: string;
}

export class AppleLoginDto {
  @IsString()
  identityToken: string;

  @IsString()
  @IsOptional()
  fullName?: string;
}
