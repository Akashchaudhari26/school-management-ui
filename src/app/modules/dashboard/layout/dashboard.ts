import { RouterModule } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Sidebar } from './sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, Navbar, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  isSidebarCollapsed = false; // Desktop: Mini vs Full
  isMobile = false;           // Screen size detector
  isMobileMenuOpen = false;   // Mobile: Hidden vs Visible

  ngOnInit() {
    this.checkScreenSize();
  }

  // Listen for window resize to auto-adjust
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    // Reset mobile menu when switching to desktop
    if (!this.isMobile) {
      this.isMobileMenuOpen = false;
    }
  }

  // Called by Navbar Hamburger (Mobile)
  onToggleSidebar() {
    if (this.isMobile) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  // Called when clicking the dark overlay
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
