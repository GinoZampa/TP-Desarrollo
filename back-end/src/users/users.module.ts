import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Purchase } from 'src/purchases/entities/purchase.entity';
import { Shipment } from 'src/shipments/entities/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Purchase, Shipment])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
