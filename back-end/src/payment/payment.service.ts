import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { User } from 'src/users/entities/user.entity';
import { PaymentItemDto } from './dto/payment-item.dto';
import { ShippingCostsService } from 'src/shipping-costs/shipping-costs.service';

@Injectable()
export class PaymentService {

  constructor(
    private readonly configService: ConfigService,
    private readonly shippingCostsService: ShippingCostsService,
  ) { }

  async createPayment(items: PaymentItemDto[], user: User) {
    try {
      const shippingCost = await this.shippingCostsService.findByProvinceId(user.provinceId);
      const cost = shippingCost ? shippingCost.cost : 0;

      const mercadopago = new MercadoPagoConfig({
        accessToken: this.configService.get('MP_ACCESS_TOKEN'),
      });
      const preference = await new Preference(mercadopago).create({
        body: {
          items: [...items.map(item => ({
            id: item.idCl.toString(),
            title: item.nameCl,
            quantity: item.quantity,
            currency_id: 'ARS',
            unit_price: item.price,
          })),
          {
            id: 'shipping',
            title: `Envío a ${user.provinceName}`,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: cost,
          }],
          back_urls: {
            success: this.configService.get('back_url_success'),
            failure: this.configService.get('back_url_failure'),
            pending: this.configService.get('back_url_pending'),
          },
          auto_return: 'approved',
          notification_url: this.configService.get('notification_url'),
          metadata: {
            user: {
              id: user.idUs,
              provinceId: user.provinceId,
              cost: cost,
            },
            products: items.map(item => ({
              idCl: item.idCl,
              name: item.nameCl,
              price: item.price,
              quantity: item.quantity
            })),
            totalAmount: items.reduce((total, item) => total + (item.price * item.quantity), cost)
          }
        }
      });

      return { init_point: preference.init_point };
    } catch (error) {
      throw new InternalServerErrorException(`Error al crear el pago: ${error.message}`);
    }
  }
}
