import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { ShipmentsService } from '../shipments/shipments.service';
import { PurchasesService } from '../purchases/purchases.service';
import { ClothesService } from '../clothes/clothes.service';
import { PurchaseClotheService } from '../purchase-clothe/purchase-clothe.service';
import { STATUS } from '../shipments/entities/shipment.entity';
import axios from 'axios';
import * as crypto from 'crypto';
import { Request, Response } from 'express';

jest.mock('axios');

describe('WebhookController', () => {
    let controller: WebhookController;
    let shipmentsService: ShipmentsService;
    let purchasesService: PurchasesService;
    let clothesService: ClothesService;
    let purchaseClotheService: PurchaseClotheService;

    const mockShipmentsService = {
        create: jest.fn(),
    };
    const mockPurchasesService = {
        create: jest.fn(),
        findOneByPayment: jest.fn(),
    };
    const mockClothesService = {
        findOne: jest.fn(),
        decreaseStock: jest.fn(),
    };
    const mockPurchaseClotheService = {
        create: jest.fn(),
    };

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    } as unknown as Response;

    const mockReq = {
        body: {},
    } as unknown as Request;

    const MP_WEBHOOK_SECRET = 'test_secret';

    beforeEach(async () => {
        process.env.MP_WEBHOOK_SECRET = MP_WEBHOOK_SECRET;
        process.env.MP_ACCESS_TOKEN = 'test_token';

        const module: TestingModule = await Test.createTestingModule({
            controllers: [WebhookController],
            providers: [
                { provide: ShipmentsService, useValue: mockShipmentsService },
                { provide: PurchasesService, useValue: mockPurchasesService },
                { provide: ClothesService, useValue: mockClothesService },
                { provide: PurchaseClotheService, useValue: mockPurchaseClotheService },
            ],
        }).compile();

        controller = module.get<WebhookController>(WebhookController);
        shipmentsService = module.get<ShipmentsService>(ShipmentsService);
        purchasesService = module.get<PurchasesService>(PurchasesService);
        clothesService = module.get<ClothesService>(ClothesService);
        purchaseClotheService = module.get<PurchaseClotheService>(PurchaseClotheService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const generateSignature = (id: string, requestId: string, ts: string) => {
        const manifest = `id:${id};request-id:${requestId};ts:${ts};`;
        const hmac = crypto.createHmac('sha256', MP_WEBHOOK_SECRET);
        hmac.update(manifest);
        return `ts=${ts},v1=${hmac.digest('hex')}`;
    };

    describe('handleWebhook', () => {
        it('should return 403 if signature is invalid', async () => {
            const req = {
                body: { type: 'payment', data: { id: '123' } },
            } as Request;
            const requestId = 'req_123';
            const signature = 'ts=123,v1=invalid_hash';

            await controller.handleWebhook(req, mockRes, signature, requestId);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.send).toHaveBeenCalledWith('Firma inválida');
        });

        it('should return 200 if payment is already processed', async () => {
            const paymentId = '12345';
            const req = {
                body: { type: 'payment', data: { id: paymentId } },
            } as Request;
            const requestId = 'req_123';
            const ts = '1234567890';
            const signature = generateSignature(paymentId, requestId, ts);

            (axios.get as jest.Mock).mockResolvedValue({
                data: { status: 'approved' },
            });
            mockPurchasesService.findOneByPayment.mockResolvedValue({ id: 1 });

            await controller.handleWebhook(req, mockRes, signature, requestId);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith('Compra ya procesada');
            expect(mockPurchasesService.create).not.toHaveBeenCalled();
        });

        it('should process approved payment and return 200', async () => {
            const paymentId = '12345';
            const req = {
                body: { type: 'payment', data: { id: paymentId } },
            } as Request;
            const requestId = 'req_123';
            const ts = '1234567890';
            const signature = generateSignature(paymentId, requestId, ts);

            const mpResponse = {
                data: {
                    status: 'approved',
                    metadata: {
                        total_amount: 100,
                        user: { id_lo: 1, id: 1 },
                        products: [{ id_cl: 1, quantity: 2, price: 50 }],
                    },
                },
            };

            (axios.get as jest.Mock).mockResolvedValue(mpResponse);
            mockPurchasesService.findOneByPayment.mockResolvedValue(null);
            mockShipmentsService.create.mockResolvedValue({ idSh: 1 });
            mockPurchasesService.create.mockResolvedValue({ idPu: 1 });
            mockClothesService.findOne.mockResolvedValue({ idCl: 1 });

            await controller.handleWebhook(req, mockRes, signature, requestId);

            expect(mockShipmentsService.create).toHaveBeenCalledWith({
                dateSh: expect.any(Date),
                idLocality: 1,
                status: STATUS.PENDING,
            });
            expect(mockPurchasesService.create).toHaveBeenCalledWith({
                amount: 100,
                shipment: 1,
                user: 1,
                paymentId: paymentId,
            });
            expect(mockClothesService.decreaseStock).toHaveBeenCalledWith(1, 2);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith('Webhook recibido correctamente');
        });

        it('should return 500 on error', async () => {
            const paymentId = '12345';
            const req = {
                body: { type: 'payment', data: { id: paymentId } },
            } as Request;
            const requestId = 'req_123';
            const ts = '1234567890';
            const signature = generateSignature(paymentId, requestId, ts);

            (axios.get as jest.Mock).mockRejectedValue(new Error('API Error'));

            await controller.handleWebhook(req, mockRes, signature, requestId);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.send).toHaveBeenCalledWith('Error interno del servidor');
        });

        it('should pass through if type is not payment', async () => {
            const req = {
                body: { type: 'test', data: { id: '123' } },
            } as Request;

            await controller.handleWebhook(req, mockRes, 'sig', 'reqId');
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.send).not.toHaveBeenCalled();
        });
    });
});
