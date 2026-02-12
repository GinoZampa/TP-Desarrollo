import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseClotheController } from './purchase-clothe.controller';
import { PurchaseClotheService } from './purchase-clothe.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { PurchaseClothe } from './entities/purchase-clothe.entity';

describe('PurchaseClotheController', () => {
    let controller: PurchaseClotheController;
    let service: PurchaseClotheService;

    const mockPurchaseClothe: PurchaseClothe = {
        id: 1,
        purchase: { idPu: 1 } as any,
        clothe: { idCl: 1 } as any,
        quantity: 2,
        unitPrice: 100,
    };

    const mockService = {
        findAll: jest.fn(),
        findByPurchaseId: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PurchaseClotheController],
            providers: [
                {
                    provide: PurchaseClotheService,
                    useValue: mockService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<PurchaseClotheController>(PurchaseClotheController);
        service = module.get<PurchaseClotheService>(PurchaseClotheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of purchase clothes', async () => {
            mockService.findAll.mockResolvedValue([mockPurchaseClothe]);

            const result = await controller.findAll();

            expect(result).toEqual([mockPurchaseClothe]);
            expect(mockService.findAll).toHaveBeenCalled();
        });
    });

    describe('findByPurchaseId', () => {
        it('should return purchase clothes for a specific purchase ID', async () => {
            const purchaseId = 1;
            mockService.findByPurchaseId.mockResolvedValue([mockPurchaseClothe]);

            const result = await controller.findByPurchaseId(purchaseId);

            expect(result).toEqual([mockPurchaseClothe]);
            expect(mockService.findByPurchaseId).toHaveBeenCalledWith(purchaseId);
        });

        it('should handle errors thrown by the service', async () => {
            const purchaseId = 1;
            mockService.findByPurchaseId.mockRejectedValue(new Error('Service error'));

            await expect(controller.findByPurchaseId(purchaseId)).rejects.toThrow('Service error');
        });
    });
});
