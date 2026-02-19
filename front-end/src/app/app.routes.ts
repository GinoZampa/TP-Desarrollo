import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },

    {
        path: 'search/:desc',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'products/:id',
        loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'sign-up',
        loadComponent: () => import('./pages/sign-up/sign-up.component').then(m => m.SignUpComponent)
    },
    {
        path: 'verify-email',
        loadComponent: () => import('./pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
    },

    {
        path: 'bag',
        loadComponent: () => import('./pages/bag/bag.component').then(m => m.BagComponent)
    },

    {
        path: 'purchases',
        loadComponent: () => import('./pages/purchases/purchases.component').then(m => m.PurchasesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'user-purchases',
        loadComponent: () => import('./pages/user-purchases/user-purchases.component').then(m => m.UserPurchasesComponent),
        canActivate: [authGuard]
    },
    {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'success',
        loadComponent: () => import('./pages/success/success.component').then(m => m.SuccessComponent)
    },
    {
        path: 'new-item',
        loadComponent: () => import('./pages/new-item/new-item.component').then(m => m.NewItemComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'edit-price/:id',
        loadComponent: () => import('./pages/edit-price/edit-price.component').then(m => m.EditPriceComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'add-stock/:id',
        loadComponent: () => import('./pages/add-stock/add-stock.component').then(m => m.AddStockComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'shipping-costs',
        loadComponent: () => import('./pages/shipping-costs/shipping-costs.component').then(m => m.ShippingCostsComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'pending-purchases',
        loadComponent: () => import('./pages/pending-purchases/pending-purchases.component').then(m => m.PendingPurchasesComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'admin-users',
        loadComponent: () => import('./pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
        canActivate: [adminGuard]
    },

    { path: '**', redirectTo: '', pathMatch: 'full' }
];
