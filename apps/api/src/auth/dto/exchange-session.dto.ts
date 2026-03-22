import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ExchangeSessionDto {
  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsString()
  authProvider!: string;

  @IsOptional()
  @IsString()
  providerAccountId?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
