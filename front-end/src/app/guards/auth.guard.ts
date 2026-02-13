import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const tokenService = inject(TokenService);

    if (typeof window !== 'undefined' && window.localStorage) {
        return tokenService.isAuthenticated$.pipe(
            take(1),
            map(isAuth => {
                if (isAuth) {
                    return true;
                }
                router.navigate(['/login']);
                return false;
            })
        );
    }

    // Not logged in, redirect to login
    router.navigate(['/login']);
    return false;
};
