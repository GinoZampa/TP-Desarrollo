import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShippingCostDto } from './dto/create-shipping-cost.dto';
import { UpdateShippingCostDto } from './dto/update-shipping-cost.dto';
import { ShippingCost } from './entities/shipping-cost.entity';

@Injectable()
export class ShippingCostsService {
    constructor(
        @InjectRepository(ShippingCost)
        private repository: Repository<ShippingCost>,
    ) { }

    create(createDto: CreateShippingCostDto) {
        const shippingCost = this.repository.create(createDto);
        return this.repository.save(shippingCost);
    }

    findAll() {
        return this.repository.find();
    }

    async findOne(id: number) {
        const shippingCost = await this.repository.findOne({ where: { id } });
        if (!shippingCost) {
            throw new NotFoundException(`Shipping cost with ID ${id} not found`);
        }
        return shippingCost;
    }

    async findByProvinceId(provinceId: string) {
        return this.repository.findOne({ where: { provinceId } });
    }

    async update(id: number, updateDto: UpdateShippingCostDto) {
        const shippingCost = await this.repository.preload({
            id,
            ...updateDto,
        });
        if (!shippingCost) {
            throw new NotFoundException(`Shipping cost with ID ${id} not found`);
        }
        return this.repository.save(shippingCost);
    }

    async remove(id: number) {
        const shippingCost = await this.findOne(id);
        return this.repository.remove(shippingCost);
    }
}
