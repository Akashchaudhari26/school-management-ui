import { Router, Routes } from '@angular/router';
import { Auth } from './core/services/auth';
import { inject } from '@angular/core';
import { Login } from './modules/auth/components/login/login';
import { Dashboard } from './modules/dashboard/layout/dashboard';

const authGuard = () => {
    const authService = inject(Auth);
    const router = inject(Router);

    const isLoggedIn = authService.isLoggedIn();
    console.log('AuthGuard Check - Is User Logged In?', isLoggedIn); // <--- DEBUG LOG

    if (isLoggedIn) {
        return true;
    } else {
        console.log('AuthGuard blocking navigation! Redirecting to login.');
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
                path: 'students',
                loadComponent: () => import('./modules/student/components/student-list/student-list').then(m => m.StudentList)
            },
            {
                path: 'students/view/:id',
                loadComponent: () => import('./modules/student/components/student-view/student-view').then(m => m.StudentView)
            },
            {
                path: 'students/new',
                loadComponent: () => import('./modules/student/components/student-form/student-form').then(m => m.StudentForm)
            },
            {
                path: 'students/edit/:id',
                loadComponent: () => import('./modules/student/components/student-form/student-form').then(m => m.StudentForm)
            },
            {
                path: 'staff',
                loadComponent: () => import('./modules/staff/components/staff-list/staff-list').then(m => m.StaffList)
            },
            {
                path: 'staff/new',
                // Assuming you will create this component next
                loadComponent: () => import('./modules/staff/components/staff-form/staff-form').then(m => m.StaffForm)
            },
            {
                path: 'staff/edit/:id',
                // Assuming you will use the same form for edit
                loadComponent: () => import('./modules/staff/components/staff-form/staff-form').then(m => m.StaffForm)
            },
            {
                path: 'staff/view/:id',
                loadComponent: () => import('./modules/staff/components/staff-view/staff-view').then(m => m.StaffView)
            },
            {
                path: 'attendance/mark',
                loadComponent: () =>
                    import('./modules/attendance/components/mark-attendance.component/mark-attendance.component')
                        .then(m => m.MarkAttendanceComponent)
            }

            // Future Modules will go here:
            // { path: 'students', loadChildren: ... },
            // { path: 'fees', loadChildren: ... },
        ]
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
