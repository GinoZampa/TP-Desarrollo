import { Purchase } from './purchases.model';
import { Clothe } from './clothes.model';

export interface PurchaseClothe {
    id: number;
    purchase: Purchase;
    clothe: Clothe;
    quantity: number;
    unitPrice: number;
}
