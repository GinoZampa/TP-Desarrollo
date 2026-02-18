import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserWithStats } from '../models/users.model';

export interface ProfileUpdateResponse {
    token?: string;
    user?: User;
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private urlUsers = environment.apiUrl + '/users';

    constructor(private http: HttpClient) { }

    getUsersWithStats(): Observable<UserWithStats[]> {
        return this.http.get<UserWithStats[]>(`${this.urlUsers}/stats`);
    }

    changePassword(data: { idUs: number, currentPassword: string, newPassword: string }): Observable<{ message: string }> {
        const { idUs, ...passwordData } = data;
        return this.http.patch<{ message: string }>(`${this.urlUsers}/${idUs}/password`, passwordData);
    }

    updateProfile(data: Partial<User> & { idUs: number }): Observable<ProfileUpdateResponse> {
        const { idUs, ...profileData } = data;
        return this.http.patch<ProfileUpdateResponse>(`${this.urlUsers}/${idUs}`, profileData);
    }

    deleteAccount(idUs: number, password: string): Observable<{ message: string }> {
        return this.http.patch<{ message: string }>(`${this.urlUsers}/${idUs}/deactivate`, { password });
    }
}
