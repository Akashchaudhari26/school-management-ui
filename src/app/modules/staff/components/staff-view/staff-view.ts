import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StaffService } from '../../services/staff.service';
import { Staff } from '../../models/staff';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-staff-view',
  imports: [CommonModule, RouterModule],
  templateUrl: './staff-view.html',
  styleUrl: './staff-view.css',
})
export class StaffView {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private staffService = inject(StaffService);
  public location = inject(Location);

  staff: Staff | null = null;
  isLoading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const navState = history.state;

    if (navState?.data?.id === id) {
      console.log('⚡ Loaded from State');
      this.staff = navState.data;
    } else {
      // 2. Fallback to API
      console.log('🔄 Fetching from API');
      if (id)
        this.fetchStaff(id);
    }
  }

  fetchStaff(id: string) {
    this.staffService.getById(id).subscribe({
      next: (data) => {
        this.staff = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  deleteStaff() {
    if (!this.staff) return;
    if (confirm(`Are you sure you want to delete ${this.staff.fullName}?`)) {
      this.staffService.delete(this.staff.id).subscribe(() => {
        this.router.navigate(['/dashboard/staff']);
      });
    }
  }
}
