import { IsEmail, IsOptional } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}
