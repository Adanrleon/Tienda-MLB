import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { CheckoutService } from './checkout.service';
import { CapturePayPalOrderDto } from './dto/capture-paypal-order.dto';
import { ConfirmStripePaymentDto } from './dto/confirm-stripe-payment.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('session')
  createSession(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.checkoutService.createSession(user, dto);
  }

  @Post('stripe/payment-intent')
  createStripePaymentIntent(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.checkoutService.createStripePaymentIntent(user, dto);
  }

  @Post('stripe/confirm')
  confirmStripePayment(
    @CurrentUser() user: RequestUser,
    @Body() dto: ConfirmStripePaymentDto,
  ) {
    return this.checkoutService.confirmStripePayment(user, dto);
  }

  @Post('paypal/order')
  createPayPalOrder(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.checkoutService.createPayPalOrder(user, dto);
  }

  @Post('paypal/capture')
  capturePayPalOrder(
    @CurrentUser() user: RequestUser,
    @Body() dto: CapturePayPalOrderDto,
  ) {
    return this.checkoutService.capturePayPalOrder(user, dto);
  }
}
