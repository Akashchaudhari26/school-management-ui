import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const STAFF_ROUTES: Routes = [
    {
        path: '',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/staff-list/staff-list').then(m => m.StaffList)
    },
    {
        path: 'new',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./components/staff-form/staff-form').then(m => m.StaffForm)
    },
    {
        path: 'edit/:id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./components/staff-form/staff-form').then(m => m.StaffForm)
    },
    {
        path: 'view/:id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/staff-view/staff-view').then(m => m.StaffView)
    },
    {
        path: 'attendance',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/staff-attendance.component/staff-attendance.component').then(m => m.StaffAttendanceComponent)
    },
];