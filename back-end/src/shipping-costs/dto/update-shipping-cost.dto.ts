import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingCostDto } from './create-shipping-cost.dto';

export class UpdateShippingCostDto extends PartialType(CreateShippingCostDto) { }
