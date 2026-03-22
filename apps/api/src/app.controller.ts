import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return {
      name: 'Tienda MLB API',
      status: 'ok',
      docs: {
        products: '/api/products',
        featuredProducts: '/api/products/featured',
        authLogin: '/api/auth/login',
        health: '/api/health',
      },
    };
  }

  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
