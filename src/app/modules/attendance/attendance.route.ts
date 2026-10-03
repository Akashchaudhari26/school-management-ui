import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const ATTENDANCE_ROUTES: Routes = [
    {
        path: 'leaves',
        loadComponent: () => import('./components/leave-list.component/leave-list.component').then(m => m.LeaveListComponent)
    },
    {
        path: 'mark',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER'] },
        loadComponent: () =>
            import('./components/mark-attendance.component/mark-attendance.component')
                .then(m => m.MarkAttendanceComponent)
    },
    {
        path: 'view',
        loadComponent: () =>
            import('./components/view-attendance.component/view-attendance.component')
                .then(m => m.ViewAttendanceComponent)
    },
    {
        path: 'class-register',
        loadComponent: () =>
            import('./components/class-register.component/class-register.component')
                .then(m => m.ClassRegisterComponent)
    },
    {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
        loadComponent: () =>
            import('./components/attendance-dashboard.component/attendance-dashboard.component')
                .then(m => m.AttendanceDashboardComponent)
    },
    {
        path: 'reports',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
        loadComponent: () =>
            import('./components/attendance-report.component/attendance-report.component')
                .then(m => m.AttendanceReportComponent)
    },
];