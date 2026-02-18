import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../services/token.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decodedToken = jwtDecode<JwtPayload>(token);

                // Verifica si el rol en el token es 'admin'
                // Ajusta 'user' y 'rol' según la estructura real de tu token
                // TokenService parace usar: user?.user.rol
                if (decodedToken?.user?.rol === 'admin') {
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
