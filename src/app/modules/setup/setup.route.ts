import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guards';

export const SETUP_ROUTES: Routes = [

    {
        path: '',
        loadComponent: () =>
            import('./component/setup/setup')
                .then(c => c.Setup)
    }

];