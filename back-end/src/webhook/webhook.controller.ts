import { Controller, Post, Req, Res, Headers, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { ShipmentsService } from '../shipments/shipments.service';
import { PurchasesService } from '../purchases/purchases.service';
import { ClothesService } from '../clothes/clothes.service';
import { PurchaseClotheService } from 'src/purchase-clothe/purchase-clothe.service';
import { STATUS, Shipment } from '../shipments/entities/shipment.entity';
import * as crypto from 'crypto';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Purchase } from '../purchases/entities/purchase.entity';
import { Clothe } from '../clothes/entities/clothe.entity';
import { PurchaseClothe } from 'src/purchase-clothe/entities/purchase-clothe.entity';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly shipmentService: ShipmentsService,
        private readonly purchaseService: PurchasesService,
        private readonly clothesService: ClothesService,
        private readonly purchaseClotheService: PurchaseClotheService,
        private readonly dataSource: DataSource,
    ) { }

    @Post('mercadopago')
    async handleWebhook(@Req() req: Request, @Res() res: Response, @Headers('x-signature') signature: string, @Headers('x-request-id') requestId: string) {
        const payment = req.body;

        if (payment.type === 'payment' && payment.data?.id) {
            const isValidSignature = this.validateSignature(signature, requestId, req.body);

            if (!isValidSignature) {
                console.error('Firma inválida para webhook payment');
                return res.status(403).send('Firma inválida');
            }
        }


        if (payment.type === 'payment') {
            const paymentId = payment.data.id;

            try {
                const { data } = await axios.get(
                    `https://api.mercadopago.com/v1/payments/${paymentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                        },
                    },
                );

                if (data.status === 'approved') {

                    const existingPurchase = await this.purchaseService.findOneByPayment(paymentId);
                    if (existingPurchase) {
                        return res.status(200).send('Compra ya procesada');
                    }

                    await this.dataSource.transaction(async (manager) => {
                        const { total_amount, user, products } = data.metadata;

                        // 1. Create Shipment
                        const shipment = manager.create(Shipment, {
                            dateSh: new Date(),
                            idLocality: user.id_lo,
                            status: STATUS.PENDING,
                        });
                        const savedShipment = await manager.save(shipment);

                        // 2. Create Purchase
                        const purchase = manager.create(Purchase, {
                            amount: total_amount,
                            shipment: savedShipment.idSh, // Relacionamos con el ID del envío guardado
                            user: user.id,
                            paymentId: paymentId,
                        } as any);
                        const savedPurchase = await manager.save(Purchase, purchase);

                        // 3. Process Products
                        for (const product of products) {
                            // Find clothe inside transaction to ensure we see current state (optional: add locking)
                            const clotheEntity = await manager.findOne(Clothe, { where: { idCl: product.id_cl } });

                            if (!clotheEntity) {
                                throw new BadRequestException(`Producto ${product.id_cl} no encontrado`);
                            }

                            if (clotheEntity.stock < product.quantity) {
                                throw new BadRequestException(`Stock insuficiente para ${clotheEntity.nameCl}`);
                            }

                            // Create PurchaseClothe relation
                            const purchaseItem = manager.create(PurchaseClothe, {
                                purchase: savedPurchase,
                                clothe: clotheEntity,
                                quantity: product.quantity,
                                unitPrice: product.price,
                            });
                            await manager.save(PurchaseClothe, purchaseItem);

                            // Update Stock
                            await manager.decrement(Clothe, { idCl: clotheEntity.idCl }, 'stock', product.quantity);
                        }
                    });

                }

                res.status(200).send('Webhook recibido correctamente');
            } catch (error) {
                console.error('Error procesando el webhook:', error.message);
                res.status(500).send('Error interno del servidor');
            }
        }
    }

    private validateSignature(
        signature: string,
        requestId: string,
        body: any
    ): boolean {
        try {
            const parts = signature.split(',');
            const tsMatch = parts.find(p => p.startsWith('ts='));
            const v1Match = parts.find(p => p.startsWith('v1='));

            if (!tsMatch || !v1Match) {
                console.error('Header x-signature inválido');
                return false;
            }

            const ts = tsMatch.replace('ts=', '');
            const hash = v1Match.replace('v1=', '');

            const dataId = body.data?.id;
            if (!dataId) {
                console.error('No se encontró data.id en el body');
                return false;
            }

            const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

            const secret = process.env.MP_WEBHOOK_SECRET;

            if (!secret) {
                console.error('MP_WEBHOOK_SECRET no configurado');
                return false;
            }

            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(manifest);
            const calculatedHash = hmac.digest('hex');

            const isValid = calculatedHash === hash;

            if (!isValid) {
                console.error('Firma inválida');
                console.error('Manifest:', manifest);
                console.error('Hash esperado:', hash);
                console.error('Hash calculado:', calculatedHash);
            }

            return isValid;
        } catch (error) {
            console.error('Error validando firma:', error);
            return false;
        }
    }
}
