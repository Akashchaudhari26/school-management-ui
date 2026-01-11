import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const ADMIN_ROUTES: Routes = [
    {
        path: 'create',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./components/create-user.component/create-user.component').then(m => m.CreateUserComponent)
    },
    {
        path: 'view',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./components/view-user.component/view-user.component').then(m => m.ViewUserComponent)
    },
    {
        path: 'edit/:id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./components/create-user.component/create-user.component').then(m => m.CreateUserComponent)
    },
];