import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateClotheDto } from './dto/create-clothe.dto';
import { UpdateClotheDto } from './dto/update-clothe.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Clothe } from './entities/clothe.entity';

@Injectable()
export class ClothesService {
  constructor(
    @InjectRepository(Clothe)
    private clotheRepository: Repository<Clothe>,
  ) { }

  create(createClotheDto: CreateClotheDto): Promise<Clothe> {
    const clothe = this.clotheRepository.create(createClotheDto);
    return this.clotheRepository.save(clothe);
  }

  async findAll(paginationDto: PaginationDto = {}): Promise<{ data: Clothe[]; total: number }> {
    const { limit = 12, offset = 0, typeCl, size, minPrice, maxPrice } = paginationDto;

    const where: any = { isActive: true };

    if (typeCl) where.typeCl = typeCl;
    if (size) where.size = size;

    if (minPrice && maxPrice) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice) {
      where.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice) {
      where.price = LessThanOrEqual(maxPrice);
    }

    const [data, total] = await this.clotheRepository.findAndCount({
      where,
      take: limit,
      skip: offset,
    });
    return { data, total };
  }

  async findOne(idCl: number): Promise<Clothe> {
    const clothe = await this.clotheRepository.findOne({ where: { idCl: idCl, isActive: true } });

    if (!clothe) {
      throw new NotFoundException(`Clothing item with ID ${idCl} not found`);
    }

    return clothe;
  }


  async update(idCl: number, updateClotheDto: UpdateClotheDto,): Promise<Clothe> {
    await this.clotheRepository.update(idCl, updateClotheDto);
    return this.findOne(idCl);
  }

  async updateProductPrice(id: number, newPrice: number): Promise<void> {
    if (newPrice < 0) {
      throw new BadRequestException('Price cannot be negative');
    }
    await this.clotheRepository.update(id, { price: newPrice });
  }

  async updateProductStock(id: number, newStock: number): Promise<void> {
    await this.clotheRepository.update(id, { stock: newStock });
  }

  async findByCategory(category: string): Promise<Clothe[]> {
    return this.clotheRepository.find({ where: { typeCl: category, isActive: true } });
  }

  async decreaseStock(id: number, quantity: number): Promise<void> {
    const product = await this.findOne(id);
    await this.updateProductStock(id, product.stock - quantity);
  }

  async searchByName(query: string): Promise<Clothe[]> {
    return this.clotheRepository.find({
      where: { nameCl: ILike(`%${query}%`), isActive: true }
    });
  }

  async deactivateProduct(idCl: number): Promise<void> {
    await this.clotheRepository.update(idCl, { isActive: false });
  }

}
