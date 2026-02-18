import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Purchase } from '../models/purchases.model';
import { PurchaseClothe } from '../models/purchase-clothe.model';
import { Shipment } from '../models/shipments.model';

@Injectable({
    providedIn: 'root',
})
export class PurchaseService {
    private urlPurchases = environment.apiUrl + '/purchases';
    private urlShipments = environment.apiUrl + '/shipments';
    private urlPurchaseClothes = environment.apiUrl + '/purchase-clothe';

    constructor(private http: HttpClient) { }

    getPurchases(): Observable<Purchase[]> {
        return this.http.get<Purchase[]>(this.urlPurchases);
    }

    getPurchasesByDate(startDate: string, endDate: string): Observable<Purchase[]> {
        return this.http.get<Purchase[]>(`${this.urlPurchases}/dates/${startDate}/${endDate}`);
    }

    getUserPurchases(userId: number): Observable<Purchase[]> {
        return this.http.get<Purchase[]>(`${this.urlPurchases}/user/${userId}`);
    }

    getPurchaseByPaymentId(paymentId: string): Observable<Purchase> {
        return this.http.get<Purchase>(`${this.urlPurchases}/payment/${paymentId}`);
    }

    getClotheByPurchaseId(purchaseId: number): Observable<PurchaseClothe[]> {
        return this.http.get<PurchaseClothe[]>(`${this.urlPurchaseClothes}/${purchaseId}`);
    }

    createPurchase(purchaseData: { amount: number; paymentId: string; idUs: number }): Observable<Purchase> {
        return this.http.post<Purchase>(this.urlPurchases, purchaseData);
    }

    createShipment(shipmentData: { idLo: number }): Observable<Shipment> {
        return this.http.post<Shipment>(this.urlShipments, shipmentData);
    }

    updateShipmentStatus(idSh: number, status: string): Observable<Shipment> {
        return this.http.patch<Shipment>(`${this.urlShipments}/${idSh}`, { status });
    }
}
