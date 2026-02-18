import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateShippingCostDto {
    @IsString()
    @IsNotEmpty()
    provinceId: string;

    @IsString()
    @IsNotEmpty()
    provinceName: string;

    @IsNumber()
    @Min(0)
    cost: number;
}
