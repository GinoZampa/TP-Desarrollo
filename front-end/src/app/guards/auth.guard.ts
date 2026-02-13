import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    // Check if running in browser
    if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('token');

        if (token) {
            return true;
        }
    }

    // Not logged in, redirect to login
    router.navigate(['/login']);
    return false;
};
