import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { AttendanceStatus } from '../../../attendance/attendance.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff-table',
  imports: [CommonModule],
  templateUrl: './staff-table.component.html',
  styleUrl: './staff-table.component.css',
})
export class StaffTableComponent {
  private auth = inject(Auth);

  // Expose Enum to HTML
  AttendanceStatus = AttendanceStatus;

  _staffList: any[] = [];

  @Input() set staff(value: any[]) {
    if (!value) {
      this._staffList = [];
      return;
    }
    // Sort Logic: Marked records go to bottom, then alphabetical
    this._staffList = [...value].sort((a, b) => {
      const isAMarked = !!a.attendanceId;
      const isBMarked = !!b.attendanceId;

      if (isAMarked && !isBMarked) return 1;
      if (!isAMarked && isBMarked) return -1;
      return (a.firstName || '').localeCompare(b.firstName || '');
    });
  }

  get staff(): any[] {
    return this._staffList;
  }

  @Input() mode: 'VIEW' | 'ATTENDANCE' = 'VIEW';

  // Outputs
  @Output() attendanceChange = new EventEmitter<{ staffId: string; status: AttendanceStatus }>();
  @Output() view = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<string>();

  get canModifyLocked(): boolean {
    return this.auth.hasRole('ADMIN');
  }

  setStatus(person: any, status: AttendanceStatus) {
    // 1. Lock Check
    if (person.attendanceId && !this.canModifyLocked) return;

    // 2. Optimization (Don't emit if same)
    if (person.status === status) return;

    // 3. UI Update & Emit
    person.status = status;
    this.attendanceChange.emit({
      staffId: person.id,
      status: status
    });
  }
}
