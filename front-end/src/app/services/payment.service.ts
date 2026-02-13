import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Clothes } from '../models/clothes.model';
import { User } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private API_URL = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) { }

  createPayment(items: Clothes[], user: User) {
    return this.http.post<{ init_point: string }>(this.API_URL, { items, user });
  }
}
