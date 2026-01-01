import { Component, inject } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { DateUtils } from '../../../../core/utils/date.utils';
import { AttendanceStats } from '../../models/attendance-stats';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendance-dashboard.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-dashboard.component.html',
  styleUrl: './attendance-dashboard.component.css',
})
export class AttendanceDashboardComponent {
  private attendanceSvc = inject(AttendanceService);

  // Filters
  selectedDate: string = DateUtils.getLocalISODate();
  userType: 'STUDENT' | 'STAFF' = 'STUDENT';

  isLoading = false;

  // Initialize with 0 values
  stats: AttendanceStats = {
    totalStudents: 0,
    totalStaff: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    presencePercentage: 0
  };

  ngOnInit() {
    this.loadStats();
  }

  // Helper to get the correct total based on the active tab
  get displayTotal(): number {
    return this.userType === 'STUDENT' ? this.stats.totalStudents : this.stats.totalStaff;
  }

  loadStats() {
    this.isLoading = true;
    this.attendanceSvc.getDailyStats(this.userType, this.selectedDate)
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
  }

  onTypeChange(type: 'STUDENT' | 'STAFF') {
    this.userType = type;
    this.loadStats();
  }
}
