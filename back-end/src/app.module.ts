import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PurchasesModule } from './purchases/purchases.module';
import { ClothesModule } from './clothes/clothes.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { UsersModule } from './users/users.module';
import { Clothe } from './clothes/entities/clothe.entity';
import { Purchase } from './purchases/entities/purchase.entity';
import { Shipment } from './shipments/entities/shipment.entity';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { PaymentModule } from './payment/payment.module';
import { WebhookController } from './webhook/webhook.controller';
import { WebhookModule } from './webhook/webhook.module';
import { PurchaseClotheController } from './purchase-clothe/purchase-clothe.controller';
import { PurchaseClotheModule } from './purchase-clothe/purchase-clothe.module';
import { PurchaseClothe } from './purchase-clothe/entities/purchase-clothe.entity';
import { ShippingCostsModule } from './shipping-costs/shipping-costs.module';
import { ShippingCost } from './shipping-costs/entities/shipping-cost.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<'mysql'>('DB_TYPE'),
        url: configService.get<string>('DB_URL'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        timezone: '-03:00',
        synchronize: true,
        entities: [
          Clothe,
          Purchase,
          Shipment,
          User,
          PurchaseClothe,
          ShippingCost,
        ],
      }),
      inject: [ConfigService],
    }),
    PurchasesModule,
    ClothesModule,
    ShipmentsModule,
    UsersModule,
    AuthModule,
    PaymentModule,
    WebhookModule,
    PurchaseClotheModule,
    ShippingCostsModule,
  ],
  controllers: [AppController, WebhookController, PurchaseClotheController],
  providers: [AppService],
})
export class AppModule { }
