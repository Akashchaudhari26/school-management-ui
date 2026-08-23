import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth, ForgotPasswordRequest } from '../../../../core/services/auth';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmation = control.get('confirmPassword')?.value;
    return password && confirmation && password !== confirmation ? { passwordMismatch: true } : null;
}

@Component({
    selector: 'app-forgot-password',
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.css',
})
export class ForgotPassword {
    private fb = inject(FormBuilder);
    private authService = inject(Auth);
    private router = inject(Router);

    accountForm = this.fb.nonNullable.group({
        identifier: ['', Validators.required],
    });

    passwordForm = this.fb.nonNullable.group({
        newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
        confirmPassword: ['', [Validators.required, Validators.maxLength(72)]],
    }, { validators: passwordsMatch });

    accountFound = false;
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    private getRequest(): ForgotPasswordRequest {
        return {
            identifier: this.accountForm.controls.identifier.value.trim(),
            newPassword: this.passwordForm.controls.newPassword.value,
            confirmPassword: this.passwordForm.controls.confirmPassword.value,
        };
    }

    findAccount() {
        if (this.accountForm.invalid) {
            this.accountForm.markAllAsTouched();
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';
        this.accountFound = true;
    }

    resetPassword() {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.authService.forgotPassword(this.getRequest())
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: () => {
                    this.successMessage = 'Your password has been reset successfully. Redirecting to login...';
                    this.passwordForm.reset();
                    setTimeout(() => this.router.navigate(['/login']), 1200);
                },
                error: (err) => this.errorMessage = err?.error?.message || 'Unable to reset your password. Please try again.',
            });
    }
}