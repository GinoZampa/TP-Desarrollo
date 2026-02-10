import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    minLength: 2,
    maxLength: 150
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nameUs: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastNameUs: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address'
  })
  @IsEmail()
  emailUs: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 6 characters)',
    minLength: 6,
    maxLength: 200
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(6)
  @MaxLength(200)
  passwordUs: string;

  @ApiProperty({
    example: 12345678,
    description: 'User DNI/ID number'
  })
  @IsInt()
  @IsPositive()
  dni: number;

  @ApiProperty({
    example: '+54 9 11 1234-5678',
    description: 'User phone number',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  phoneUs: string;

  @ApiProperty({
    example: 'Av. Corrientes 1234',
    description: 'User address',
    maxLength: 50
  })
  @IsString()
  @MaxLength(50)
  addressUs: string;

  @ApiProperty({
    example: 1,
    description: 'Locality ID (foreign key)'
  })
  @IsInt()
  idLo: number;

  //rol: Rol;
}
