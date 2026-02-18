import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Clothe } from '../models/clothes.model';

@Injectable({
  providedIn: 'root',
})
export class ClothesService {
  private urlBase = `${environment.apiUrl}/clothes`;

  constructor(private http: HttpClient) { }

  getProducts(limit = 12, offset = 0): Observable<{ data: Clothe[]; total: number }> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    return this.http.get<{ data: Clothe[]; total: number }>(`${this.urlBase}?limit=${limit}&offset=${offset}`, { headers });
  }

  getProductById(id: number): Observable<Clothe> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    return this.http.get<Clothe>(`${this.urlBase}/${id}`, { headers });
  }

  getProductsByType(type: string): Observable<Clothe[]> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    return this.http.get<Clothe[]>(`${this.urlBase}/type/${type}`, { headers });
  }

  searchProducts(query: string): Observable<Clothe[]> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    return this.http.get<Clothe[]>(`${this.urlBase}/search?q=${query}`, { headers });
  }

  updateProductPrice(productId: number, newPrice: number): Observable<Clothe> {
    return this.http.put<Clothe>(`${this.urlBase}/${productId}/new-price`, {
      price: newPrice,
    });
  }

  updateProductStock(productId: number, newStock: number): Observable<Clothe> {
    return this.http.put<Clothe>(`${this.urlBase}/${productId}/add-stock`, {
      stock: newStock,
    });
  }

  deleteProduct(idCl: number): Observable<void> {
    return this.http.patch<void>(`${this.urlBase}/${idCl}/deactivate`, {});
  }

  newItem(
    nameCl: string,
    description: string,
    size: string,
    typeCl: string,
    stock: number,
    price: number,
    image: string
  ): Observable<Clothe> {
    return this.http.post<Clothe>(
      this.urlBase,
      { nameCl, description, size, typeCl, stock, price, image }
    );
  }
}
