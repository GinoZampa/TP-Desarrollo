import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private urlUsers = environment.apiUrl + '/users';

    constructor(private http: HttpClient) { }

    getUsersWithStats(): Observable<any> {
        return this.http.get(`${this.urlUsers}/stats`);
    }

    changePassword(data: { idUs: number, currentPassword: string, newPassword: string }) {
        const { idUs, ...passwordData } = data;
        return this.http.patch(`${this.urlUsers}/${idUs}/password`, passwordData);
    }

    updateProfile(data: any) {
        const { idUs, ...profileData } = data;
        return this.http.patch(`${this.urlUsers}/${idUs}`, profileData);
    }

    deleteAccount(idUs: number, password: string) {
        return this.http.patch(`${this.urlUsers}/${idUs}/deactivate`, { password });
    }
}
