import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Clothe } from '../models/clothes.model';

export interface ProductFilters {
  typeCl?: string;
  size?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class ClothesService {
  private urlBase = `${environment.apiUrl}/clothes`;

  constructor(private http: HttpClient) { }

  getProducts(limit = 12, offset = 0, filters: ProductFilters = {}): Observable<{ data: Clothe[]; total: number }> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });

    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (filters.typeCl) params = params.set('typeCl', filters.typeCl);
    if (filters.size) params = params.set('size', filters.size);
    if (filters.minPrice && filters.minPrice > 0) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice && filters.maxPrice > 0) params = params.set('maxPrice', filters.maxPrice.toString());

    return this.http.get<{ data: Clothe[]; total: number }>(this.urlBase, { headers, params });
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
