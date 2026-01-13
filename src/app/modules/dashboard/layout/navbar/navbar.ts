import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, User } from '../../../../core/services/auth';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>(); // Renamed from toggleMobile for clarity
  @Input() isSidebarCollapsed = false;
  @Input() isMobile = false;
  authService = inject(Auth);
  user$ = this.authService.user$;

  onToggleSidebar() {
    this.toggleSidebar.emit();
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
