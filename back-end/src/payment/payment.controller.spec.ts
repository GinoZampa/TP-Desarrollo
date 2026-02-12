import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { PaymentItemDto } from './dto/payment-item.dto';
import { User } from 'src/users/entities/user.entity';

describe('PaymentController', () => {
    let controller: PaymentController;
    let service: PaymentService;

    const mockPaymentService = {
        createPayment: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                {
                    provide: PaymentService,
                    useValue: mockPaymentService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<PaymentController>(PaymentController);
        service = module.get<PaymentService>(PaymentService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createPayment', () => {
        it('should call service.createPayment and return result', async () => {
            const items: PaymentItemDto[] = [{ idCl: 1, nameCl: 'Item', price: 100, quantity: 1 }];
            const user = { idUs: 1 } as User;
            const expectedResult = { init_point: 'url' };

            mockPaymentService.createPayment.mockResolvedValue(expectedResult);

            const result = await controller.createPayment({ items, user });

            expect(result).toEqual(expectedResult);
            expect(service.createPayment).toHaveBeenCalledWith(items, user);
        });
    });
});
