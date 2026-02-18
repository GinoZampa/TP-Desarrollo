import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Shipment, STATUS } from './entities/shipment.entity';
import { ShippingCost } from 'src/shipping-costs/entities/shipping-cost.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(ShippingCost)
    private shippingCostsRepository: Repository<ShippingCost>,
  ) { }

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const shippingCost = await this.shippingCostsRepository.findOne({ where: { provinceId: createShipmentDto.provinceId } });
    if (!shippingCost) {
      throw new Error('Shipping cost not found for province');
    }

    const shipment = this.shipmentRepository.create({
      dateSh: createShipmentDto.dateSh,
      shippingCost: shippingCost,
      status: createShipmentDto.status,
    });
    return this.shipmentRepository.save(shipment);
  }

  findAll(): Promise<Shipment[]> {
    return this.shipmentRepository.find();
  }

  findOne(idSh: number): Promise<Shipment> {
    return this.shipmentRepository.findOne({ where: { idSh: idSh } });
  }

  async update(
    idSh: number,
    updateShipmentDto: UpdateShipmentDto,
  ): Promise<Shipment> {
    await this.shipmentRepository.update(idSh, updateShipmentDto);
    return this.findOne(idSh);
  }

  async remove(idSh: number): Promise<void> {
    await this.shipmentRepository.delete(idSh);
  }

}
