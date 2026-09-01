import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { LoginDto } from './dto/login.dto';
import { SafeUser } from '../users/users.service';
import { AuthenticatedRequestUser } from './strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Body: { "email": string, "password": string }
   * The `dto` param exists purely so the global ValidationPipe validates
   * the shape of the request body (email format, password length).
   * LocalAuthGuard runs LocalStrategy -> AuthService.validateUser()
   * against the *same* req.body fields and attaches the resulting user
   * to request.user (available via @CurrentUser()) before this handler runs.
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() _dto: LoginDto, @CurrentUser() user: SafeUser) {
    return this.authService.login(user);
  }

  /**
   * Send the refresh token as a Bearer token:
   *   Authorization: Bearer <refresh_token>
   * JwtRefreshGuard verifies it against JWT_REFRESH_SECRET before this
   * handler runs, and rotates both tokens on success.
   */
  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.authService.refreshTokens(user);
  }

  @Get('me')
  me(@CurrentUser('id') userId: string) {
    return this.authService.me(userId);
  }
}
