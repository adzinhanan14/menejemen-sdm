import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SafeUser, UsersService } from '../users/users.service';
import { AuthenticatedRequestUser, JwtPayload } from './strategies/jwt.strategy';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Used by LocalStrategy. Returns the user (without passwordHash) on
   * success, or null on any failure — caller decides how to react
   * (LocalStrategy throws UnauthorizedException).
   */
  async validateUser(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.usersService.findByEmailForAuth(email);
    if (!user || !user.isActive) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return null;
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Issues a fresh access/refresh token pair for an already-validated user.
   * Called after local login, and again after a successful refresh
   * (refresh token rotation).
   */
  async login(user: SafeUser | AuthenticatedRequestUser): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: this.configService.get<string>(
          'jwt.accessTokenExpiresIn',
        ) as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: this.configService.get<string>(
          'jwt.refreshTokenExpiresIn',
        ) as any,
      }),
    ]);

    await this.usersService.updateLastLogin(user.id);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  /**
   * Called from AuthController#refresh once JwtRefreshGuard has already
   * verified the refresh token's signature and expiry. We still re-fetch
   * the user to make sure the account wasn't deactivated since the token
   * was issued, then rotate both tokens.
   *
   * TODO: for full revocation support, persist a hash of each issued
   * refresh token (e.g. in Redis) and check/invalidate it here.
   */
  async refreshTokens(
    requestUser: AuthenticatedRequestUser,
  ): Promise<AuthTokens> {
    const user = await this.usersService.findByIdWithRoles(requestUser.id);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is no longer active');
    }

    return this.login(user);
  }

  async me(userId: string) {
    return this.usersService.findByIdSafe(userId);
  }
}
