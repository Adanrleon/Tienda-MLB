import { IsString } from 'class-validator';

export class CapturePayPalOrderDto {
  @IsString()
  orderId!: string;

  @IsString()
  paypalOrderId!: string;
}
