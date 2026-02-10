import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Logindto {

  @ApiProperty({
    example: 'user@example.com',
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
  @Transform(({ value }) => value.trim())
  @IsString()
  @MinLength(6)
  @MaxLength(200)
  passwordUs: string;
}
