import { Router, Routes } from '@angular/router';
import { Auth } from './core/services/auth';
import { inject } from '@angular/core';
import { Login } from './modules/auth/components/login/login';
import { Dashboard } from './modules/dashboard/layout/dashboard';

const authGuard = () => {
    const authService = inject(Auth);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    } else {
        router.navigate(['/login']);
        return false;
    }
};


export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: 'dashboard',
        component: Dashboard, // The layout we just built
        canActivate: [authGuard],
        children: [
            // Default dashboard home view
            {
                path: '',
                loadComponent: () => import('./modules/dashboard/home/home').then(m => m.Home)
            },
            {
                path: 'fees',
                loadChildren: () => import('./modules/fees/fee.routes').then(m => m.FEE_ROUTES)
            },
            {
                path: 'students',
                loadChildren: () => import('./modules/student/student.route').then(m => m.STUDENT_ROUTES)
            },
            {
                path: 'exams',
                loadChildren: () => import('./modules/academics/academics-route').then(m => m.ACADEMICS_ROUTES)
            },
            {
                path: 'staff',
                loadChildren: () => import('./modules/staff/staff.route').then(m => m.STAFF_ROUTES)
            },
            {
                path: 'attendance',
                loadChildren: () => import('./modules/attendance/attendance.route').then(m => m.ATTENDANCE_ROUTES)
            },
            {
                path: 'admin',
                loadChildren: () => import('./modules/admin/admin.route').then(m => m.ADMIN_ROUTES)
            },
            {
                path: 'config',
                loadChildren: () => import('./modules/school-config/school-config.route').then(m => m.SCHOOL_CONFIG_ROUTES)
            },
            {
                path: 'payroll',
                loadChildren: () => import('./modules/payroll/payroll.route').then(m => m.PAYROLL_ROUTES)
            },
        ]
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
