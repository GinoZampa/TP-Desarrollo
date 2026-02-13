import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LocalityService {
    private urlLocalities = environment.apiUrl + '/localities';

    constructor(private http: HttpClient) { }

    getLocalities(): Observable<any> {
        return this.http.get(this.urlLocalities);
    }

    getActiveLocalities(): Observable<any> {
        return this.http.get(`${this.urlLocalities}/active`);
    }

    updateLocality(idLo: number, updatedData: any): Observable<any> {
        return this.http.patch(`${this.urlLocalities}/${idLo}`, updatedData);
    }

    deleteLocality(idLo: number): Observable<any> {
        return this.http.patch(`${this.urlLocalities}/${idLo}/deactivate`, {});
    }

    activateLocality(idLo: number): Observable<any> {
        return this.http.patch(`${this.urlLocalities}/${idLo}/activate`, {});
    }

    newLocality(nameLo: string, postalCode: number, cost: number): Observable<any> {
        return this.http.post(this.urlLocalities, { nameLo, postalCode, cost });
    }
}
