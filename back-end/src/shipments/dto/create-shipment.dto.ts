import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { STATUS } from '../entities/shipment.entity';

export class CreateShipmentDto {
  @IsDate()
  dateSh: Date;

  @IsString()
  provinceId: string;

  @IsOptional()
  @IsEnum(STATUS)
  status?: STATUS;

}
