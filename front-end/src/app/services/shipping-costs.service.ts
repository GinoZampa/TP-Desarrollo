import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ShippingCost } from '../models/shipping-cost.model';

@Injectable({
    providedIn: 'root'
})
export class ShippingCostsService {
    private apiUrl = `${environment.apiUrl}/shipping-costs`;

    constructor(private http: HttpClient) { }

    findAll(): Observable<ShippingCost[]> {
        return this.http.get<ShippingCost[]>(this.apiUrl);
    }

    update(id: number, cost: number): Observable<ShippingCost> {
        return this.http.patch<ShippingCost>(`${this.apiUrl}/${id}`, { cost });
    }

    create(shippingCost: { provinceId: string, provinceName: string, cost: number }): Observable<ShippingCost> {
        return this.http.post<ShippingCost>(this.apiUrl, { provinceId: shippingCost.provinceId, provinceName: shippingCost.provinceName, cost: shippingCost.cost });
    }
}
