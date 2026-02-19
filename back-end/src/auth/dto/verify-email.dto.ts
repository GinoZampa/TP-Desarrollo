import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    emailUs: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @Length(6, 6)
    code: string;
}

export class ResendCodeDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    emailUs: string;
}
