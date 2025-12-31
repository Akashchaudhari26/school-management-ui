import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  // We keep 'username' in the form for the UI, but we won't send it directly
  loginForm: FormGroup = this.fb.group({
    loginType: ['email', [Validators.required]], // Default to email
    identifier: ['', [Validators.required]],      // The actual value entered
    password: ['', [Validators.required]]
  });

  errorMessage = '';
  isLoading = false;

  get placeholderText(): string {
    const type = this.loginForm.get('loginType')?.value;
    if (type === 'mobile') return 'Enter 10-digit Mobile Number';
    if (type === 'adhar') return 'Enter 12-digit Adhar Number';
    return 'Enter your Email Address';
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const type = this.loginForm.get('loginType')?.value;
    const value = this.loginForm.get('identifier')?.value;
    const password = this.loginForm.get('password')?.value;

    // Create Payload
    const payload: any = { password: password };
    if (type === 'email') payload.email = value;
    else if (type === 'mobile') payload.mobile = value;
    else if (type === 'adhar') payload.adharNumber = value;

    this.authService.login(payload).subscribe({
      next: (res) => {
        // SUCCESS!
        console.log('Login successful, redirecting...');
        this.isLoading = false;

        // Fix: Don't check res.user here. Just go to dashboard.
        // The Guard will handle permissions.
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login Failed:', err);
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please check your credentials.';
      }
    });
  }
}