import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Locality } from '../models/localities.model';

@Injectable({
    providedIn: 'root',
})
export class LocalityService {
    private urlLocalities = environment.apiUrl + '/localities';

    constructor(private http: HttpClient) { }

    getLocalities(): Observable<Locality[]> {
        return this.http.get<Locality[]>(this.urlLocalities);
    }

    getActiveLocalities(): Observable<Locality[]> {
        return this.http.get<Locality[]>(`${this.urlLocalities}/active`);
    }

    updateLocality(idLo: number, updatedData: Partial<Locality>): Observable<Locality> {
        return this.http.patch<Locality>(`${this.urlLocalities}/${idLo}`, updatedData);
    }

    deleteLocality(idLo: number): Observable<void> {
        return this.http.patch<void>(`${this.urlLocalities}/${idLo}/deactivate`, {});
    }

    activateLocality(idLo: number): Observable<void> {
        return this.http.patch<void>(`${this.urlLocalities}/${idLo}/activate`, {});
    }

    newLocality(nameLo: string, postalCode: number, cost: number): Observable<Locality> {
        return this.http.post<Locality>(this.urlLocalities, { nameLo, postalCode, cost });
    }
}
