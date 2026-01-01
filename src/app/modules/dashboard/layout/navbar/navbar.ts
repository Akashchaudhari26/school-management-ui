import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, User } from '../../../../core/services/auth';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Output() toggleMobile = new EventEmitter<void>();
  authService = inject(Auth);
  user$ = this.authService.user$;

  onToggleMobile() {
    this.toggleMobile.emit();
  }

  logout() {
    this.authService.logout();
  }

  // Add this method inside your NavbarComponent class
  getInitials(name: string | undefined): string {
    if (!name) return 'U'; // Default to 'U' for User if null
    const parts = name.trim().split(' ');

    if (parts.length === 1) {
      // Single name: "Akash" -> "A"
      return parts[0].charAt(0).toUpperCase();
    }

    // Full name: "Akash Sharma" -> "AS"
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
