import { IsInt, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClotheDto {
    @ApiProperty({
        example: 'Classic Cotton T-Shirt',
        description: 'Clothing item name',
        minLength: 1,
        maxLength: 70
    })
    @IsString()
    @MinLength(1)
    @MaxLength(70)
    nameCl: string;

    @ApiProperty({
        example: 'Comfortable cotton t-shirt perfect for everyday wear',
        description: 'Clothing item description (optional)',
        required: false,
        maxLength: 200
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    description?: string;

    @ApiProperty({
        example: 'M',
        description: 'Size (S, M, L, XL, etc.)',
        maxLength: 3
    })
    @IsString()
    @MaxLength(3)
    size: string;

    @ApiProperty({
        example: 'T-Shirt',
        description: 'Clothing category/type',
        maxLength: 200
    })
    @IsString()
    @MaxLength(200)
    typeCl: string;

    @ApiProperty({
        example: 50,
        description: 'Available stock quantity'
    })
    @IsInt()
    @IsPositive()
    stock: number;

    @ApiProperty({
        example: 'https://example.com/images/tshirt.jpg',
        description: 'Image URL',
        maxLength: 700
    })
    @IsString()
    @MaxLength(700)
    image: string;

    @ApiProperty({
        example: 2999.99,
        description: 'Price in local currency'
    })
    @IsNumber()
    @IsPositive()
    price: number;
}
