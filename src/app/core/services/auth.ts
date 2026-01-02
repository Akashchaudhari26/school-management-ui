import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode'; // Import this

export type UserRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT';


export interface User {
  id: string;
  email: string;
  roleName: string;
  permissions: string[];
  tenantId?: string;
  userId?: string;

  // 👇 ADD '?' HERE. This means "This field might be missing, and that's okay"
  fullName?: string;
  adharNumber?: string;  // <--- Was missing '?'
  mobile?: string;       // <--- Was missing '?'
  status?: string;       // <--- Was missing '?'
  profileImageUrl?: string;
}

export interface LoginRequest {
  email?: string;
  mobile?: string;
  adharNumber?: string;
  password: string;
  tenantId?: string;
}

export interface AuthResponse {
  accessToken: string; // Changed from 'token'
  tokenType: string;
  expiresIn: number;
}


@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Update with your actual API URL
  private apiUrl = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const user = this.decodeToken(token);
        this.userSubject.next(user);
      } catch (e) {
        console.error('Invalid token found in storage');
        this.logout();
      }
    }
  }

  // Assuming your LoginRequest DTO takes "username" (which could be email or adhar) and "password"
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        const user = this.decodeToken(response.accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }

  private decodeToken(token: string): User {
    const decoded: any = jwtDecode(token);

    // Map your JWT fields to our User interface
    return {
      id: decoded.sub,            // 'sub' comes from backend JWT
      email: decoded.email,
      roleName: decoded.roleName,
      permissions: decoded.permissions || [],
      tenantId: decoded.tenantId,
      userId: decoded.userId,

      // Defaults or derived values
      fullName: decoded.email.split('@')[0], // Temporary name from email
      status: 'ACTIVE' // Assume active if they can log in
    };
  }
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Helper to check specific roles (e.g., for Guards)
  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return user?.roleName === role;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getRole(): UserRole {
    const user = this.userSubject.value;
    return (user?.roleName as UserRole) || ('' as UserRole);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }
}