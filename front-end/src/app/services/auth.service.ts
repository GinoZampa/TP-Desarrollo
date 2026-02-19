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
  private urlVerifyEmail = environment.apiUrl + '/auth/verify-email';
  private urlResendCode = environment.apiUrl + '/auth/resend-code';

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
    provinceId: string,
    provinceName: string,
    municipalityName: string
  ): Observable<any> {
    return this.http
      .post(this.urlRegister, {
        nameUs,
        lastNameUs,
        emailUs,
        passwordUs,
        phoneUs,
        addressUs,
        provinceId,
        provinceName,
        municipalityName,
      })
  }

  verifyEmail(emailUs: string, code: string): Observable<any> {
    return this.http.post(this.urlVerifyEmail, { emailUs, code });
  }

  resendCode(emailUs: string): Observable<any> {
    return this.http.post(this.urlResendCode, { emailUs });
  }

  logout(): void {
    this.tokenService.logout();
  }
}
