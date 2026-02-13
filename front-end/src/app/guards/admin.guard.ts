import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decodedToken: any = jwtDecode(token);

                // Verifica si el rol en el token es 'admin'
                // Ajusta 'user' y 'rol' según la estructura real de tu token
                // TokenService parace usar: user?.user.rol
                if (decodedToken && decodedToken.user && decodedToken.user.rol === 'admin') {
                    return true;
                }
            } catch (error) {
                console.error('Error decoding token in AdminGuard', error);
            }
        }
    }

    // Not admin or not logged in, redirect to home
    router.navigate(['/']);
    return false;
};
