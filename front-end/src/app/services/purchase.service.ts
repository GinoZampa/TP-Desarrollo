import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class PurchaseService {
    private urlPurchases = environment.apiUrl + '/purchases';
    private urlShipments = environment.apiUrl + '/shipments';
    private urlPurchaseClothes = environment.apiUrl + '/purchase-clothe';

    constructor(private http: HttpClient) { }

    getPurchases(): Observable<any> {
        return this.http.get(this.urlPurchases);
    }

    getPurchasesByDate(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${this.urlPurchases}/dates/${startDate}/${endDate}`);
    }

    getUserPurchases(userId: number): Observable<any> {
        return this.http.get(`${this.urlPurchases}/user/${userId}`);
    }

    getPurchaseByPaymentId(paymentId: string): Observable<any> {
        return this.http.get(`${this.urlPurchases}/payment/${paymentId}`);
    }

    getClotheByPurchaseId(purchaseId: number): Observable<any> {
        return this.http.get(`${this.urlPurchaseClothes}/${purchaseId}`);
    }

    createPurchase(purchaseData: any) {
        return this.http.post(this.urlPurchases, purchaseData);
    }

    createShipment(shipmentData: any): Observable<any> {
        return this.http.post<any>(this.urlShipments, shipmentData);
    }

    updateShipmentStatus(idSh: number, status: string) {
        return this.http.patch(`${this.urlShipments}/${idSh}`, { status });
    }
}
