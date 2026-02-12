import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseClotheService } from './purchase-clothe.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PurchaseClothe } from './entities/purchase-clothe.entity';
import { Repository } from 'typeorm';
import { CreatePurchaseClotheDto } from './dto/create-purchase-clothe.dto';

describe('PurchaseClotheService', () => {
    let service: PurchaseClotheService;
    let repository: Repository<PurchaseClothe>;

    const mockPurchaseClothe: PurchaseClothe = {
        id: 1,
        purchase: { idPu: 1 } as any,
        clothe: { idCl: 1 } as any,
        quantity: 2,
        unitPrice: 100,
    };

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PurchaseClotheService,
                {
                    provide: getRepositoryToken(PurchaseClothe),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<PurchaseClotheService>(PurchaseClotheService);
        repository = module.get<Repository<PurchaseClothe>>(getRepositoryToken(PurchaseClothe));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create and save a purchase clothe', async () => {
            const createDto: CreatePurchaseClotheDto = {
                purchase: 1,
                clothe: 1,
                quantity: 2,
                price: 100,
            };

            mockRepository.create.mockReturnValue(mockPurchaseClothe);
            mockRepository.save.mockResolvedValue(mockPurchaseClothe);

            const result = await service.create(createDto);

            expect(result).toEqual(mockPurchaseClothe);
            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockPurchaseClothe);
        });

        it('should throw an error if save fails', async () => {
            const createDto: CreatePurchaseClotheDto = {
                purchase: 1,
                clothe: 1,
                quantity: 2,
                price: 100,
            };

            mockRepository.create.mockReturnValue(mockPurchaseClothe);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createDto)).rejects.toThrow('Database error');
        });
    });

    describe('findAll', () => {
        it('should return an array of purchase clothes', async () => {
            mockRepository.find.mockResolvedValue([mockPurchaseClothe]);

            const result = await service.findAll();

            expect(result).toEqual([mockPurchaseClothe]);
            expect(mockRepository.find).toHaveBeenCalled();
        });
    });

    describe('findByPurchaseId', () => {
        it('should return purchase clothes for a specific purchase ID', async () => {
            const purchaseId = 1;
            mockRepository.find.mockResolvedValue([mockPurchaseClothe]);

            const result = await service.findByPurchaseId(purchaseId);

            expect(result).toEqual([mockPurchaseClothe]);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    purchase: { idPu: purchaseId }
                },
                relations: ['purchase']
            });
        });

        it('should return empty array if no matches found', async () => {
            const purchaseId = 999;
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findByPurchaseId(purchaseId);

            expect(result).toEqual([]);
        });
    });
});
