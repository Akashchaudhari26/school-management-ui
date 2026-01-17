import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const STUDENT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/student-list/student-list').then(m => m.StudentList)
    },
    {
        path: 'view/:id',
        loadComponent: () => import('./components/student-view/student-view').then(m => m.StudentView)
    },
    {
        path: 'new',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/student-form/student-form').then(m => m.StudentForm)
    },
    {
        path: 'edit/:id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/student-form/student-form').then(m => m.StudentForm)
    },
    {
        path: 'promote',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] },
        loadComponent: () => import('./components/promote-student.component/promote-student.component').then(m => m.PromoteStudentComponent)
    }
];