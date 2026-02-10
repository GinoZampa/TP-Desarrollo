import { IsNumber, IsPositive, IsString } from "class-validator";

export class PaymentItemDto {
    @IsNumber()
    @IsPositive()
    idCl: number;

    @IsString()
    nameCl: string;
    
    @IsNumber()
    @IsPositive()
    quantity: number;
    
    @IsNumber()
    @IsPositive()
    price: number;
}