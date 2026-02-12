import { Test, TestingModule } from '@nestjs/testing';
import { ClothesController } from './clothes.controller';
import { ClothesService } from './clothes.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { CreateClotheDto } from './dto/create-clothe.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ClothesController', () => {
    let controller: ClothesController;
    let service: ClothesService;

    const mockClothesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        updateProductPrice: jest.fn(),
        updateProductStock: jest.fn(),
        searchByName: jest.fn(),
        findByCategory: jest.fn(),
        deactivateProduct: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClothesController],
            providers: [
                {
                    provide: ClothesService,
                    useValue: mockClothesService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ClothesController>(ClothesController);
        service = module.get<ClothesService>(ClothesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new clothe', async () => {
            const createClotheDto: CreateClotheDto = {
                nameCl: 'Test Clothe',
                price: 100,
                stock: 10,
                typeCl: 'Test Type',
                image: 'test-image.jpg',
                size: 'M',
                description: 'Test Description',
            };
            const expectedResult = { idCl: 1, ...createClotheDto, isActive: true };
            mockClothesService.create.mockResolvedValue(expectedResult);

            const result = await controller.create(createClotheDto);

            expect(result).toEqual(expectedResult);
            expect(service.create).toHaveBeenCalledWith(createClotheDto);
        });
    });

    describe('findAll', () => {
        it('should return an array of clothes with total count', async () => {
            const expectedResult = { data: [{ idCl: 1, nameCl: 'Test Clothe' }], total: 1 };
            // @ts-ignore
            mockClothesService.findAll.mockResolvedValue(expectedResult);

            const result = await controller.findAll({});

            expect(result).toEqual(expectedResult);
            expect(service.findAll).toHaveBeenCalledWith({});
        });
    });

    describe('findOne', () => {
        it('should return a clothe by ID', async () => {
            const expectedResult = { idCl: 1, nameCl: 'Test Clothe' };
            mockClothesService.findOne.mockResolvedValue(expectedResult);

            const result = await controller.findOne(1);

            expect(result).toEqual(expectedResult);
            expect(service.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if clothe not found', async () => {
            mockClothesService.findOne.mockRejectedValue(new NotFoundException());

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
            expect(service.findOne).toHaveBeenCalledWith(999);
        });
    });

    describe('update', () => {
        it('should update a clothe', async () => {
            const updateClotheDto = { nameCl: 'Updated Name' };
            const expectedResult = { idCl: 1, nameCl: 'Updated Name' };
            mockClothesService.update.mockResolvedValue(expectedResult);

            const result = await controller.update(1, updateClotheDto);

            expect(result).toEqual(expectedResult);
            expect(service.update).toHaveBeenCalledWith(1, updateClotheDto);
        });
    });

    describe('updateProductPrice', () => {
        it('should update product price', async () => {
            mockClothesService.updateProductPrice.mockResolvedValue(undefined);

            await controller.updateProductPrice(1, 150);

            expect(service.updateProductPrice).toHaveBeenCalledWith(1, 150);
        });

        it('should throw BadRequestException if price is negative', async () => {
            mockClothesService.updateProductPrice.mockRejectedValue(new BadRequestException());

            await expect(controller.updateProductPrice(1, -50)).rejects.toThrow(BadRequestException);
            expect(service.updateProductPrice).toHaveBeenCalledWith(1, -50);
        });
    });

    describe('updateProductStock', () => {
        it('should update product stock', async () => {
            mockClothesService.updateProductStock.mockResolvedValue(undefined);

            await controller.updateProductStock(1, 20);

            expect(service.updateProductStock).toHaveBeenCalledWith(1, 20);
        });
    });

    describe('searchProducts', () => {
        it('should return search results', async () => {
            const expectedResult = [{ idCl: 1, nameCl: 'Test Clothe' }];
            mockClothesService.searchByName.mockResolvedValue(expectedResult);

            const result = await controller.searchProducts('Test');

            expect(result).toEqual(expectedResult);
            expect(service.searchByName).toHaveBeenCalledWith('Test');
        });
    });

    describe('findByCategory', () => {
        it('should return filtered results', async () => {
            const expectedResult = [{ idCl: 1, typeCl: 'Category' }];
            mockClothesService.findByCategory.mockResolvedValue(expectedResult);

            const result = await controller.findByCategory('Category');

            expect(result).toEqual(expectedResult);
            expect(service.findByCategory).toHaveBeenCalledWith('Category');
        });
    });

    describe('deactivateProduct', () => {
        it('should deactivate a product', async () => {
            const expectedResult = { idCl: 1, isActive: false };
            mockClothesService.deactivateProduct.mockResolvedValue(expectedResult);

            const result = await controller.deactivateProduct(1);

            expect(result).toEqual(expectedResult);
            expect(service.deactivateProduct).toHaveBeenCalledWith(1);
        });
    });
});
