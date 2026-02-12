import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { PaymentItemDto } from './dto/payment-item.dto';
import { User } from 'src/users/entities/user.entity';

import { MercadoPagoConfig, Preference } from 'mercadopago';

// Mock mercadopago
jest.mock('mercadopago', () => ({
    MercadoPagoConfig: jest.fn(),
    Preference: jest.fn(),
}));

describe('PaymentService', () => {
    let service: PaymentService;
    let configService: ConfigService;
    let mockCreate: jest.Mock;

    const mockConfigService = {
        get: jest.fn((key: string) => {
            switch (key) {
                case 'MP_ACCESS_TOKEN': return 'test-token';
                case 'back_url_success': return 'http://success.com';
                case 'back_url_failure': return 'http://failure.com';
                case 'back_url_pending': return 'http://pending.com';
                case 'notification_url': return 'http://webhook.com';
                default: return null;
            }
        }),
    };

    beforeEach(async () => {
        mockCreate = jest.fn();
        (Preference as unknown as jest.Mock).mockImplementation(() => ({
            create: mockCreate,
        }));
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPayment', () => {
        it('should create a payment preference successfully', async () => {
            const mockItems: PaymentItemDto[] = [
                { idCl: 1, nameCl: 'Test User Clothe', price: 100, quantity: 2 },
            ];
            const mockUser = {
                idUs: 1,
                locality: { idLo: 1, nameLo: 'Test Locality', cost: 50 },
            } as User;

            const expectedInitPoint = 'https://mercadopago.com/init-point';
            mockCreate.mockResolvedValue({ init_point: expectedInitPoint });

            const result = await service.createPayment(mockItems, mockUser);

            expect(result).toEqual({ init_point: expectedInitPoint });
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                body: expect.objectContaining({
                    items: expect.arrayContaining([
                        expect.objectContaining({
                            id: '1',
                            title: 'Test User Clothe',
                            quantity: 2,
                            unit_price: 100,
                        }),
                        expect.objectContaining({
                            id: 'shipping',
                            unit_price: 50,
                        }),
                    ]),
                    back_urls: {
                        success: 'http://success.com',
                        failure: 'http://failure.com',
                        pending: 'http://pending.com',
                    },
                }),
            }));
        });

        it('should throw InternalServerErrorException on error', async () => {
            const mockItems: PaymentItemDto[] = [];
            const mockUser = {
                idUs: 1,
                locality: { idLo: 1, nameLo: 'Test Locality', cost: 50 },
            } as User;

            mockCreate.mockRejectedValue(new Error('MP Error'));

            await expect(service.createPayment(mockItems, mockUser)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });
});
