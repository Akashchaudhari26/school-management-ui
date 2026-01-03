import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast';
import { UserService } from '../../services/user.service';
import { User } from '../../../../core/services/auth';

@Component({
  selector: 'app-view-user.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './view-user.component.html',
  styleUrl: './view-user.component.css',
})
export class ViewUserComponent {
  private userService = inject(UserService); // ✅ Use Service
  private toast = inject(ToastService);

  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = true;

  // Search & Filter State
  searchTerm = '';
  selectedRole = 'ALL';
  roles = ['ALL', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT'];

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;

    // ✅ Call Service instead of http directly
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        // Global interceptor handles the alert, but we stop the spinner
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    let temp = this.users;

    // 1. Filter by Role
    if (this.selectedRole !== 'ALL') {
      temp = temp.filter(u => u.roleName === this.selectedRole);
    }

    // 2. Filter by Search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(u =>
        // ✅ FIX: Add (u.field || '') to handle undefined safely
        (u.fullName || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.userId || '').toLowerCase().includes(term)
      );
    }

    this.filteredUsers = temp;
  }

  onDelete(user: User) {
    if (!confirm(`Are you sure you want to delete ${user.fullName}?`)) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.toast.show('User deleted successfully', 'success');
        this.users = this.users.filter(u => u.id !== user.id);
        this.applyFilter();
      },
      error: () => {
        // Error handled by interceptor
      }
    });
  }

  onToggleStatus(user: User) {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Optimistic Update (Update UI immediately)
    const oldStatus = user.status;
    user.status = newStatus;

    this.userService.updateStatus(user.id, newStatus).subscribe({
      next: () => {
        this.toast.show(`User marked as ${newStatus}`, 'info');
      },
      error: () => {
        // Revert on failure
        user.status = oldStatus;
      }
    });
  }
}
