import { Test, TestingModule } from '@nestjs/testing';
import { ClothesService } from './clothes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ILike } from 'typeorm';
import { Clothe } from './entities/clothe.entity';

describe('ClothesService', () => {
    let service: ClothesService;
    let clotheRepository: any;

    const mockClotheRepository = {
        create: jest.fn().mockImplementation((dto) => dto),
        save: jest.fn().mockImplementation((clothe) => Promise.resolve({ idCl: 1, ...clothe })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClothesService,
                {
                    provide: getRepositoryToken(Clothe),
                    useValue: mockClotheRepository,
                },
            ],
        }).compile();

        service = module.get<ClothesService>(ClothesService);
        clotheRepository = module.get(getRepositoryToken(Clothe));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a new clothe', async () => {
        const clotheDto = {
            nameCl: 'Polo',
            price: 100,
            stock: 10,
            typeCl: 'Camiseta',
            image: 'url',
            size: 'M',
            description: 'Polo de algodon'
        }

        const result = await service.create(clotheDto as any);
        expect(result).toEqual({ idCl: 1, ...clotheDto });
        expect(clotheRepository.create).toHaveBeenCalledWith(clotheDto);
        expect(clotheRepository.save).toHaveBeenCalledWith(clotheDto);
    })

    it('should find all clothes', async () => {
        const result = await service.findAll();
        expect(result).toEqual([]);
        expect(clotheRepository.find).toHaveBeenCalledWith({ where: { isActive: true } });
    })

    it('should find a specific clothe', async () => {
        const result = await service.findOne(1);
        expect(result).toEqual({ idCl: 1 });
        expect(clotheRepository.findOne).toHaveBeenCalledWith({ where: { idCl: 1, isActive: true } });
    })

    it('not found clothe', async () => {
        const result = await service.findOne(2);
        expect(result).toEqual(null);
        expect(clotheRepository.findOne).toHaveBeenCalledWith({ where: { idCl: 2, isActive: true } });
    })

    it('should update a specific clothe', async () => {
        const result = await service.update(1, { nameCl: 'Polo' });
        expect(result).toEqual({ idCl: 1, nameCl: 'Polo' });
        expect(clotheRepository.update).toHaveBeenCalledWith(1, { nameCl: 'Polo' });
    })

    it('should update a specific clothe price', async () => {
        const result = await service.updateProductPrice(1, 200);
        expect(result).toEqual({ idCl: 1, price: 200 });
        expect(clotheRepository.update).toHaveBeenCalledWith(1, { price: 200 });
    })

    it('should fail when updating with a negative price', async () => {
        const result = await service.updateProductPrice(1, -200)
        expect(result).rejects.toThrow(
            'Price cannot be negative',
        );
        expect(clotheRepository.update).not.toHaveBeenCalled();
    })

    it('should update a specific clothe stock', async () => {
        const result = await service.updateProductStock(1, 20);
        expect(result).toEqual({ idCl: 1, stock: 20 });
        expect(clotheRepository.update).toHaveBeenCalledWith(1, { stock: 20 });
    })

    it('should find clothes by category', async () => {
        const result = await service.findByCategory('Shoes');
        expect(result).toEqual([]);
        expect(clotheRepository.find).toHaveBeenCalledWith({ where: { typeCl: 'Shoes', isActive: true } });
    })

    it('should decrease stock', async () => {
        const result = await service.decreaseStock(1, 1);
        expect(result).toEqual({ idCl: 1, stock: 9 });
        expect(clotheRepository.update).toHaveBeenCalledWith(1, { stock: 9 });
    })

    it('should search clothes by name', async () => {
        const result = await service.searchByName('Polo');
        expect(result).toEqual([]);
        expect(clotheRepository.find).toHaveBeenCalledWith({ where: { nameCl: ILike('%Polo%'), isActive: true } });
    })

    it('should deactivate a specific clothe', async () => {
        const result = await service.deactivateProduct(1);
        expect(result).toEqual({ idCl: 1, isActive: false });
        expect(clotheRepository.update).toHaveBeenCalledWith(1, { isActive: false });
    })

});
