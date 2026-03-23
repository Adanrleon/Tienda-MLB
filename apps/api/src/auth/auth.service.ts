import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from '../users/users.service';


import { ExchangeSessionDto } from './dto/exchange-session.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.createCredentialsUser(dto);
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.validateCredentials(dto.email, dto.password);
    return this.buildAuthResponse(user);
  }

  async exchangeSession(dto: ExchangeSessionDto) {
    const user = await this.usersService.upsertOAuthUser(dto);
    return this.buildAuthResponse(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    
    if (user) {
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await this.usersService.setResetToken(user.id, token, expires);

      console.log(`[AUTH] Password reset requested for ${user.email}.`);
      console.log(`[AUTH] Reset Link: http://localhost:3000/reset-password?token=${token}`);
    }

    return { 
      message: 'If an account exists with that email, a reset link has been sent.' 
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    await this.usersService.updatePassword(user.id, dto.password);

    return { message: 'Password has been successfully updated.' };
  }




  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string | null;
  }) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      accessToken,
      user,
    };
  }
}
