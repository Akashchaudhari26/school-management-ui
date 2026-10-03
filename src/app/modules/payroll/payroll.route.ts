import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const PAYROLL_ROUTES: Routes = [
    {
        path: 'structure',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/salary-structure.component/salary-structure.component').then(m => m.SalaryStructureComponent)
    },
    {
        path: 'generate',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/generate-payroll.component/generate-payroll.component').then(m => m.PayrollGenerateComponent)

    },
    {
        path: 'view',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'] },
        loadComponent: () => import('./components/payroll-ledger.component/payroll-ledger.component').then(m => m.PayrollLedgerComponent)
    },
    {
        path: 'my-slips',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'TEACHER', 'PRINCIPAL', 'LIBRARIAN', 'ACCOUNTANT', 'ADMIN'] },
        loadComponent: () => import('./components/payslips.component/payslips.component').then(m => m.PayslipsComponent)
    }

];