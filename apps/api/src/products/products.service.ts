import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      team: query.team,
      category: query.category,
      featured:
        query.featured === undefined ? undefined : query.featured === 'true',
      OR: query.search
        ? [
            {
              name: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              team: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };

    return this.prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findFeatured() {
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        featured: true,
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const { imageUrls = [], ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.ensureExists(id);

    const { imageUrls, ...productData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (imageUrls) {
        await tx.productImage.deleteMany({
          where: { productId: id },
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          images: imageUrls
            ? {
                create: imageUrls.map((url, index) => ({
                  url,
                  sortOrder: index,
                })),
              }
            : undefined,
        },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.product.delete({
      where: { id },
    });

    return { success: true };
  }

  private async ensureExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }
  }
}
