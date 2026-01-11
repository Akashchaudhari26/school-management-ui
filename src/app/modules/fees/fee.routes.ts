import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const FEE_ROUTES: Routes = [

    {
        path: 'create',
        // The component we just built
        loadComponent: () => import('./components/fee-create.component/fee-create.component').then(m => m.FeeCreateComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
    },
    {
        path: 'collect',
        // Placeholder for future component
        loadComponent: () => import('./components/fee-collect.component/fee-collect.component').then(m => m.FeeCollectComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] }
    },
    {
        path: 'dues',
        // Placeholder for future component
        loadComponent: () => import('./components/fee-due.component/fee-due.component').then(m => m.FeeDuesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] }
    },
    {
        path: 'history',
        // Placeholder for future component
        loadComponent: () => import('./components/fee-history.component/fee-history.component').then(m => m.FeeHistoryComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] }
    },
    {
        path: 'bulk-create',
        loadComponent: () => import('./components/fee-bulk-create.component/fee-bulk-create.component').then(m => m.FeeBulkCreateComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] } // Strictly Admin only
    },
    {
        path: 'fee-master',
        loadComponent: () => import('./components/fee-master.component/fee-master.component').then(m => m.FeeMasterComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRINCIPAL'] } // Strictly Admin only
    }
    // {
    //     path: 'student-search',
    //     // Placeholder for future component
    //     loadComponent: () => import('./components/fee-history/fee-history.component').then(m => m.FeeHistoryComponent),
    //     canActivate: [roleGuard],
    //     data: { roles: ['ADMIN', 'PRINCIPAL'] }
    // }
];