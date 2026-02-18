import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingCostsService } from './shipping-costs.service';
import { ShippingCostsController } from './shipping-costs.controller';
import { ShippingCost } from './entities/shipping-cost.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ShippingCost])],
    controllers: [ShippingCostsController],
    providers: [ShippingCostsService],
    exports: [ShippingCostsService],
})
export class ShippingCostsModule { }
