import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Purchase } from 'src/purchases/entities/purchase.entity';
import { Shipment } from 'src/shipments/entities/shipment.entity';
import * as bcryptjs from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  findOneByEmail(emailUs: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ emailUs, isActive: true });
  }

  findByEmailWithPassword(emailUs: string): Promise<User> {
    return this.userRepository.findOne({
      where: { emailUs: emailUs, isActive: true }
    });
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { isActive: true } });
  }

  async findAllWithStats(): Promise<any[]> {
    const users = await this.userRepository.find({
      where: { isActive: true },
    });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Obtener compras del usuario
        const purchases = await this.purchaseRepository.find({
          where: { user: { idUs: user.idUs } },
          relations: ['shipment'],
          order: { datePu: 'DESC' },
        });

        const purchaseCount = purchases.length;
        const lastPurchaseDate = purchases.length > 0 ? purchases[0].datePu : null;

        // Contar envíos pendientes (no entregados)
        const pendingShipments = purchases.filter(
          (p) => p.shipment && p.shipment.status !== 'Delivered',
        ).length;

        // Excluir passwordUs de la respuesta
        const { passwordUs, ...userData } = user;

        return {
          ...userData,
          purchaseCount,
          lastPurchaseDate,
          pendingShipments,
        };
      }),
    );

    return usersWithStats;
  }

  findOne(idUs: number): Promise<User> {
    return this.userRepository.findOne({ where: { idUs: idUs, isActive: true } });
  }

  async update(idUs: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(idUs, updateUserDto);
    return this.findOne(idUs);
  }

  async changePassword(idUs: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { idUs },
      select: ['idUs', 'passwordUs']
    });

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.passwordUs);

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 12);

    await this.userRepository.update(idUs, { passwordUs: hashedNewPassword });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async remove(idUs: number): Promise<void> {
    await this.userRepository.update(idUs, { isActive: false });
  }
}
