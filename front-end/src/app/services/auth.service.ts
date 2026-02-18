import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private urlLogin = environment.apiUrl + '/auth/login';
  private urlRegister = environment.apiUrl + '/auth/register';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<{ token: string }>(this.urlLogin, {
        emailUs: email,
        passwordUs: password,
      })
      .pipe(
        tap((response: { token: string }) => {
          this.tokenService.login(response.token);
        })
      );
  }

  register(
    nameUs: string,
    lastNameUs: string,
    emailUs: string,
    passwordUs: string,
    phoneUs: string,
    addressUs: string,
    idLo: number
  ): Observable<any> {
    return this.http
      .post(this.urlRegister, {
        nameUs,
        lastNameUs,
        emailUs,
        passwordUs,
        phoneUs,
        addressUs,
        idLo: Number(idLo),
      })
  }

  logout(): void {
    this.tokenService.logout();
  }
}