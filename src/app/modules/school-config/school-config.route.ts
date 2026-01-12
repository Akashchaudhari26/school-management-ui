import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const SCHOOL_CONFIG_ROUTES: Routes = [
    {
        path: 'years',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/academic-year-manager.component/academic-year-manager.component').then(m => m.AcademicYearManagerComponent)
    },
    {
        path: 'classes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/class-manager.component/class-manager.component').then(m => m.ClassManagerComponent)
    },
    {
        path: 'subjects',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/subject-manager.component/subject-manager.component').then(m => m.SubjectManagerComponent)
    },

];