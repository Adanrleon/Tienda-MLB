import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? this.sanitizeUser(user) : null;
  }

  async setResetToken(userId: string, token: string, expires: Date) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });
  }

  async findByResetToken(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { resetPasswordToken: token },
    });
    
    if (!user || (user.resetPasswordExpires && user.resetPasswordExpires < new Date())) {
      return null;
    }

    return user; // Return full user to allow update
  }

  async updatePassword(userId: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  async createCredentialsUser(data: {

    email: string;
    name: string;
    password: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
        role: Role.USER,
      },
    });

    return this.sanitizeUser(user);
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.sanitizeUser(user);
  }

  async upsertOAuthUser(data: {
    email: string;
    name: string;
    image?: string;
    authProvider: string;
    providerAccountId?: string;
  }) {
    const payload: Prisma.UserUncheckedCreateInput = {
      email: data.email.toLowerCase(),
      name: data.name,
      image: data.image,
      authProvider: data.authProvider,
      providerAccountId: data.providerAccountId,
      role: Role.USER,
    };

    const user = await this.prisma.user.upsert({
      where: { email: data.email.toLowerCase() },
      create: payload,
      update: {
        name: data.name,
        image: data.image,
        authProvider: data.authProvider,
        providerAccountId: data.providerAccountId,
      },
    });

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User): SafeUser {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
