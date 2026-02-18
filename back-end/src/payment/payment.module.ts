import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ShippingCostsModule } from 'src/shipping-costs/shipping-costs.module';

@Module({
  imports: [ShippingCostsModule],
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule { }
