import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface GeoRefProvince {
    id: string;
    nombre: string;
}

export interface GeoRefMunicipality {
    id: string;
    nombre: string;
}

interface GeoRefResponse<T> {
    provincias?: T[];
    municipios?: T[];
    cantidad: number;
    total: number;
    inicio: number;
}

@Injectable({
    providedIn: 'root'
})
export class GeoRefService {
    private readonly API_URL = 'https://apis.datos.gob.ar/georef/api';

    constructor(private http: HttpClient) { }

    getProvinces(): Observable<GeoRefProvince[]> {
        return this.http.get<GeoRefResponse<GeoRefProvince>>(`${this.API_URL}/provincias?campos=id,nombre&orden=nombre`).pipe(
            map(response => response.provincias || [])
        );
    }

    getMunicipalities(provinceId: string): Observable<GeoRefMunicipality[]> {
        return this.http.get<GeoRefResponse<GeoRefMunicipality>>(`${this.API_URL}/municipios?provincia=${provinceId}&campos=id,nombre&max=1000&orden=nombre`).pipe(
            map(response => response.municipios || [])
        );
    }
}
