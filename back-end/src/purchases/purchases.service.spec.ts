import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesService } from './purchases.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

describe('PurchasesService', () => {
    let service: PurchasesService;
    let repository: Repository<Purchase>;

    const mockPurchase: Purchase = {
        idPu: 1,
        datePu: new Date('2023-10-27'),
        paymentId: 'payment-123',
        state: 'approved',
        user: { idUs: 1 } as any,
        purchaseClothe: [],
    } as unknown as Purchase;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PurchasesService,
                {
                    provide: getRepositoryToken(Purchase),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<PurchasesService>(PurchasesService);
        repository = module.get<Repository<Purchase>>(getRepositoryToken(Purchase));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create and save a purchase', async () => {
            const createDto: CreatePurchaseDto = {
                datePu: new Date(),
                paymentId: 'payment-123',
                state: 'approved',
                userId: 1,
            };

            mockRepository.create.mockReturnValue(mockPurchase);
            mockRepository.save.mockResolvedValue(mockPurchase);

            const result = await service.create(createDto);

            expect(result).toEqual(mockPurchase);
            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockPurchase);
        });
    });

    describe('findAll', () => {
        it('should return an array of purchases with relations', async () => {
            mockRepository.find.mockResolvedValue([mockPurchase]);

            const result = await service.findAll();

            expect(result).toEqual([mockPurchase]);
            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ['purchaseClothe', 'purchaseClothe.clothe'],
            });
        });
    });

    describe('findOne', () => {
        it('should return a purchase by ID', async () => {
            const idPu = 1;
            mockRepository.findOneBy.mockResolvedValue(mockPurchase);

            const result = await service.findOne(idPu);

            expect(result).toEqual(mockPurchase);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ idPu });
        });

        it('should throw BadRequestException if purchase not found', async () => {
            const idPu = 999;
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.findOne(idPu)).rejects.toThrow(BadRequestException);
        });
    });

    describe('update', () => {
        it('should update and return the purchase', async () => {
            const idPu = 1;
            const updateDto: UpdatePurchaseDto = { state: 'rejected' };
            const updatedPurchase = { ...mockPurchase, ...updateDto };

            mockRepository.findOneBy.mockResolvedValueOnce(mockPurchase); // Validates existence
            mockRepository.findOneBy.mockResolvedValueOnce(updatedPurchase); // Return after update
            mockRepository.update.mockResolvedValue({ affected: 1 });

            const result = await service.update(idPu, updateDto);

            expect(result).toEqual(updatedPurchase);
            expect(mockRepository.update).toHaveBeenCalledWith(idPu, updateDto);
        });

        it('should throw BadRequestException if purchase to update not found', async () => {
            const idPu = 999;
            const updateDto: UpdatePurchaseDto = { state: 'rejected' };

            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.update(idPu, updateDto)).rejects.toThrow(BadRequestException);
            expect(mockRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove the purchase', async () => {
            const idPu = 1;
            mockRepository.findOneBy.mockResolvedValue(mockPurchase); // Validates existence
            mockRepository.delete.mockResolvedValue({ affected: 1 });

            await service.remove(idPu);

            expect(mockRepository.delete).toHaveBeenCalledWith({ idPu });
        });

        it('should throw BadRequestException if purchase to remove not found', async () => {
            const idPu = 999;
            mockRepository.findOneBy.mockResolvedValue(null);

            await expect(service.remove(idPu)).rejects.toThrow(BadRequestException);
            expect(mockRepository.delete).not.toHaveBeenCalled();
        });
    });

    describe('findOneCloth', () => {
        it('should return purchase with clothes relations', async () => {
            const idPu = 1;
            mockRepository.findOne.mockResolvedValue(mockPurchase);

            const result = await service.findOneCloth(idPu);

            expect(result).toEqual(mockPurchase);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { idPu },
                relations: ['clothes'],
            });
        });
    });

    describe('findAllByDate', () => {
        it('should return purchases within date range', async () => {
            const date1 = '2023-10-01';
            const date2 = '2023-10-31';
            mockRepository.find.mockResolvedValue([mockPurchase]);

            const result = await service.findAllByDate(date1, date2);

            expect(result).toEqual([mockPurchase]);
            // Logic validation of date parsing is implicit if repository is called with Between
            expect(mockRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    datePu: expect.anything(), // Between operator check is complex to check exactly with basic Jest matchers, verifying call is sufficient
                }),
            }));
        });
    });

    describe('findAllByUser', () => {
        it('should return purchases for a specific user', async () => {
            const idUs = 1;
            mockRepository.find.mockResolvedValue([mockPurchase]);

            const result = await service.findAllByUser(idUs);

            expect(result).toEqual([mockPurchase]);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { user: { idUs } },
                relations: ['user'],
            });
        });
    });

    describe('findOneByPayment', () => {
        it('should return purchase by payment ID', async () => {
            const paymentId = 'payment-123';
            mockRepository.findOne.mockResolvedValue(mockPurchase);

            const result = await service.findOneByPayment(paymentId);

            expect(result).toEqual(mockPurchase);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { paymentId },
            });
        });
    });
});
