import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Purchase } from './entities/purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

describe('PurchasesController', () => {
    let controller: PurchasesController;
    let service: PurchasesService;

    const mockPurchase: Purchase = {
        idPu: 1,
        datePu: new Date('2023-10-27'),
        paymentId: 'payment-123',
        state: 'approved',
        user: { idUs: 1 } as any,
        purchaseClothe: [],
    } as unknown as Purchase;

    const mockService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        findOneCloth: jest.fn(),
        findAllByDate: jest.fn(),
        findAllByUser: jest.fn(),
        findOneByPayment: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PurchasesController],
            providers: [
                {
                    provide: PurchasesService,
                    useValue: mockService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<PurchasesController>(PurchasesController);
        service = module.get<PurchasesService>(PurchasesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service.create', async () => {
            const createDto: CreatePurchaseDto = {
                datePu: new Date(),
                paymentId: 'payment-123',
                state: 'approved',
                userId: 1,
            };
            mockService.create.mockResolvedValue(mockPurchase);

            const result = await controller.create(createDto);

            expect(result).toEqual(mockPurchase);
            expect(mockService.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findAll', () => {
        it('should call service.findAll', async () => {
            mockService.findAll.mockResolvedValue([mockPurchase]);

            const result = await controller.findAll();

            expect(result).toEqual([mockPurchase]);
            expect(mockService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should call service.findOne', async () => {
            const idPu = 1;
            mockService.findOne.mockResolvedValue(mockPurchase);

            const result = await controller.findOne(idPu);

            expect(result).toEqual(mockPurchase);
            expect(mockService.findOne).toHaveBeenCalledWith(idPu);
        });
    });

    describe('update', () => {
        it('should call service.update', async () => {
            const idPu = 1;
            const updateDto: UpdatePurchaseDto = { state: 'sent' };
            mockService.update.mockResolvedValue({ ...mockPurchase, ...updateDto });

            const result = await controller.update(idPu, updateDto);

            expect(result).toEqual({ ...mockPurchase, ...updateDto });
            expect(mockService.update).toHaveBeenCalledWith(idPu, updateDto);
        });
    });

    describe('remove', () => {
        it('should call service.remove', async () => {
            const idPu = 1;
            mockService.remove.mockResolvedValue(undefined);

            await controller.remove(idPu);

            expect(mockService.remove).toHaveBeenCalledWith(idPu);
        });
    });

    describe('findOneCloth', () => {
        it('should call service.findOneCloth', async () => {
            const idPu = 1;
            mockService.findOneCloth.mockResolvedValue(mockPurchase);

            const result = await controller.findOneCloth(idPu);

            expect(result).toEqual(mockPurchase);
            expect(mockService.findOneCloth).toHaveBeenCalledWith(idPu);
        });
    });

    describe('findAllByDate', () => {
        it('should call service.findAllByDate', async () => {
            const date1 = '2023-10-01';
            const date2 = '2023-10-31';
            mockService.findAllByDate.mockResolvedValue([mockPurchase]);

            const result = await controller.findAllByDate(date1, date2);

            expect(result).toEqual([mockPurchase]);
            expect(mockService.findAllByDate).toHaveBeenCalledWith(date1, date2);
        });
    });

    describe('findAllByUser', () => {
        it('should call service.findAllByUser', async () => {
            const idUs = 1;
            mockService.findAllByUser.mockResolvedValue([mockPurchase]);

            const result = await controller.findAllByUser(idUs);

            expect(result).toEqual([mockPurchase]);
            expect(mockService.findAllByUser).toHaveBeenCalledWith(idUs);
        });
    });

    describe('findOneByPayment', () => {
        it('should call service.findOneByPayment', async () => {
            const paymentId = 'payment-123';
            mockService.findOneByPayment.mockResolvedValue(mockPurchase);

            const result = await controller.findOneByPayment(paymentId);

            expect(result).toEqual(mockPurchase);
            expect(mockService.findOneByPayment).toHaveBeenCalledWith(paymentId);
        });
    });
});
