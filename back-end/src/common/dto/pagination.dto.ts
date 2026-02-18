import { IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;

    @IsOptional()
    @IsString()
    typeCl?: string;

    @IsOptional()
    @IsString()
    size?: string;

    @IsOptional()
    @Min(0)
    @Type(() => Number)
    minPrice?: number;

    @IsOptional()
    @Min(0)
    @Type(() => Number)
    maxPrice?: number;
}
