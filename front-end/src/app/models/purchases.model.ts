import { User } from './users.model';
import { Shipment } from './shipments.model';
import { PurchaseClothe } from './purchase-clothe.model';

export interface Purchase {
    idPu: number;
    amount: number;
    datePu: Date;
    shipment: Shipment;
    user: User;
    paymentId: string;
    purchaseClothe?: PurchaseClothe[];
}