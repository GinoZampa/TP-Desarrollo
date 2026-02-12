import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../environments';

@Injectable({
  providedIn: 'root',
})
export class ClothesService {
  private urlBase = `${API_CONFIG.API_URL}/clothes`;

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    return this.http.get(this.urlBase, { headers });
  }

  getProductById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    return this.http.get(`${this.urlBase}/${id}`, { headers });
  }

  getProductsByType(type: string): Observable<any> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    return this.http.get(`${this.urlBase}/type/${type}`, { headers });
  }

  searchProducts(query: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });
    return this.http.get<any[]>(`${this.urlBase}/search?q=${query}`, { headers });
  }

  updateProductPrice(productId: number, newPrice: number): Observable<any> {
    return this.http.put<any>(`${this.urlBase}/${productId}/new-price`, {
      price: newPrice,
    });
  }

  updateProductStock(productId: number, newStock: number): Observable<any> {
    return this.http.put<any>(`${this.urlBase}/${productId}/add-stock`, {
      stock: newStock,
    });
  }

  deleteProduct(idCl: number): Observable<any> {
    return this.http.patch<any>(`${this.urlBase}/${idCl}/deactivate`, {});
  }
}
