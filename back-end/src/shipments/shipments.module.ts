import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment } from './entities/shipment.entity';
import { ShippingCost } from 'src/shipping-costs/entities/shipping-cost.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, ShippingCost])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule { }
