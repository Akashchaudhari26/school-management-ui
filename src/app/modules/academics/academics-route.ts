import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const ACADEMICS_ROUTES: Routes = [
    {
        path: 'time-table',
        loadComponent: () => import('./components/exam-timetable.component/exam-timetable.component').then(m => m.ExamTimetableComponent)
    },
    {
        path: 'entry',
        loadComponent: () => import('./components/enter-marks.component/enter-marks.component').then(m => m.EnterMarksComponent)
    },
    {
        path: 'sheet',
        loadComponent: () => import('./components/view-mark-sheet.component/view-mark-sheet.component').then(m => m.ViewMarkSheetComponent)
    },
    {
        path: 'reports',
        loadComponent: () => import('./components/report-card.component/report-card.component').then(m => m.ReportCardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] }
    },
    {
        path: 'settings',
        loadComponent: () => import('./components/exam-setting.component/exam-setting.component').then(m => m.ExamSettingComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] }
    }
];