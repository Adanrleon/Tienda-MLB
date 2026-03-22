import { IsString } from 'class-validator';

export class ConfirmStripePaymentDto {
  @IsString()
  orderId!: string;

  @IsString()
  paymentIntentId!: string;
}
