import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsHexColor,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(3)
  slug!: string;

  @IsString()
  team!: string;

  @IsString()
  category!: string;

  @IsString()
  @MinLength(16)
  description!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  priceInCents!: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsHexColor()
  accent?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  availableSizes!: string[];

  @IsObject()
  stockBySize!: Record<string, number>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(/^(https?:\/\/|\/)/, {
    each: true,
    message: 'Each image URL must be an absolute URL or start with /.',
  })
  imageUrls?: string[];
}
