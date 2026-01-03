import { ActivatedRouteSnapshot, Router, Routes } from '@angular/router';
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

// --- 2. NEW ROLE GUARD (Checks permissions) ---
const roleGuard = (route: ActivatedRouteSnapshot) => {
    const authService = inject(Auth);
    const router = inject(Router);
    const userRole = authService.getRole();
    const allowedRoles = route.data['roles'] as Array<string>;

    if (!allowedRoles || allowedRoles.length === 0) {
        return true;
    }
    if (allowedRoles.includes(userRole)) {
        return true;
    }

    alert('Access Denied: You do not have permission to view this page.');
    return false;
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
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'PRINCIPAL'] },
                loadComponent: () => import('./modules/student/components/student-form/student-form').then(m => m.StudentForm)
            },
            {
                path: 'students/edit/:id',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'PRINCIPAL'] },
                loadComponent: () => import('./modules/student/components/student-form/student-form').then(m => m.StudentForm)
            },
            {
                path: 'staff',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'PRINCIPAL'] },
                loadComponent: () => import('./modules/staff/components/staff-list/staff-list').then(m => m.StaffList)
            },
            {
                path: 'staff/new',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] },
                loadComponent: () => import('./modules/staff/components/staff-form/staff-form').then(m => m.StaffForm)
            },
            {
                path: 'staff/edit/:id',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] },
                loadComponent: () => import('./modules/staff/components/staff-form/staff-form').then(m => m.StaffForm)
            },
            {
                path: 'staff/view/:id',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'PRINCIPAL'] },
                loadComponent: () => import('./modules/staff/components/staff-view/staff-view').then(m => m.StaffView)
            },
            {
                path: 'staff/attendance',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'PRINCIPAL'] },
                loadComponent: () => import('./modules/staff/components/staff-attendance.component/staff-attendance.component').then(m => m.StaffAttendanceComponent)
            },
            {
                path: 'attendance/leaves',
                loadComponent: () => import('./modules/attendance/components/leave-list.component/leave-list.component').then(m => m.LeaveListComponent)
            },
            {
                path: 'attendance/mark',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] },
                loadComponent: () =>
                    import('./modules/attendance/components/mark-attendance.component/mark-attendance.component')
                        .then(m => m.MarkAttendanceComponent)
            },
            {
                path: 'attendance/view',
                loadComponent: () =>
                    import('./modules/attendance/components/view-attendance.component/view-attendance.component')
                        .then(m => m.ViewAttendanceComponent)
            },
            {
                path: 'attendance/class-register',
                loadComponent: () =>
                    import('./modules/attendance/components/class-register.component/class-register.component')
                        .then(m => m.ClassRegisterComponent)
            },
            {
                path: 'attendance/dashboard',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'PRINCIPAL'] },
                loadComponent: () =>
                    import('./modules/attendance/components/attendance-dashboard.component/attendance-dashboard.component')
                        .then(m => m.AttendanceDashboardComponent)
            },
            {
                path: 'attendance/reports',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN', 'PRINCIPAL'] },
                loadComponent: () =>
                    import('./modules/attendance/components/attendance-report.component/attendance-report.component')
                        .then(m => m.AttendanceReportComponent)
            },

            {
                path: 'admin/create',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] },
                loadComponent: () => import('./modules/admin/components/create-user.component/create-user.component').then(m => m.CreateUserComponent)
            },
            {
                path: 'admin/view',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] },
                loadComponent: () => import('./modules/admin/components/view-user.component/view-user.component').then(m => m.ViewUserComponent)
            },
            {
                path: 'admin/edit/:id',
                canActivate: [roleGuard],
                data: { roles: ['ADMIN'] },
                loadComponent: () => import('./modules/admin/components/create-user.component/create-user.component').then(m => m.CreateUserComponent)
            }

            // Future Modules will go here:
            // { path: 'students', loadChildren: ... },
            // { path: 'fees', loadChildren: ... },
        ]
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
