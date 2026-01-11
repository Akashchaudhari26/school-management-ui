import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { Auth } from "../services/auth";
import { inject } from "@angular/core";

export const roleGuard = (route: ActivatedRouteSnapshot) => {
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
