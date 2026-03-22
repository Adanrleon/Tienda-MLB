import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.ensureCart(userId);
    return this.serializeCart(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.ensureCart(userId);
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found.');
    }

    const stockBySize = this.parseStockMap(product.stockBySize);
    const availableStock = stockBySize[dto.size] ?? 0;
    const existingLine = cart.items.find(
      (item) => item.productId === dto.productId && item.size === dto.size,
    );
    const requestedQuantity = (existingLine?.quantity ?? 0) + dto.quantity;

    if (availableStock < requestedQuantity) {
      throw new BadRequestException('Not enough stock for the selected size.');
    }

    await this.prisma.cartItem.upsert({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId: dto.productId,
          size: dto.size,
        },
      },
      create: {
        cartId: cart.id,
        productId: dto.productId,
        size: dto.size,
        quantity: dto.quantity,
      },
      update: {
        quantity: {
          increment: dto.quantity,
        },
      },
    });

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
      include: {
        product: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found.');
    }

    const stockBySize = this.parseStockMap(item.product.stockBySize);
    const availableStock = stockBySize[item.size] ?? 0;

    if (availableStock < dto.quantity) {
      throw new BadRequestException('Requested quantity exceeds stock.');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    await this.prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cart: {
          userId,
        },
      },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }

  private async ensureCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });
  }

  private serializeCart(
    cart: Awaited<ReturnType<CartService['ensureCart']>>,
  ) {
    const subtotalInCents = cart.items.reduce(
      (sum, item) => sum + item.product.priceInCents * item.quantity,
      0,
    );
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...cart,
      subtotalInCents,
      totalItems,
    };
  }

  private parseStockMap(input: Prisma.JsonValue): Record<string, number> {
    if (!input || Array.isArray(input) || typeof input !== 'object') {
      return {};
    }

    return Object.fromEntries(
      Object.entries(input).map(([size, quantity]) => [
        size,
        Number(quantity ?? 0),
      ]),
    );
  }
}
