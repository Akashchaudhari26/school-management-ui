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
}
