import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Auth } from '../../../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-student-table',
  imports: [CommonModule],
  templateUrl: './student-table.component.html',
  styleUrl: './student-table.component.css',
})
export class StudentTableComponent {
  private auth = inject(Auth)

  // Internal variable to hold the sorted list
  _students: any[] = [];

  // Use a Setter to intercept and sort the data immediately
  @Input() set students(value: any[]) {
    if (!value) {
      this._students = [];
      return;
    }

    // Create a copy [...] so we don't mutate the parent's array unexpectedly
    this._students = [...value].sort((a, b) => {
      const isAMarked = !!a.attendanceId;
      const isBMarked = !!b.attendanceId;

      // Logic: If 'a' is marked and 'b' is not, 'a' goes to the bottom (1)
      if (isAMarked && !isBMarked) return 1;
      if (!isAMarked && isBMarked) return -1;

      // Secondary Sort: If both have same status, sort alphabetically by name
      return (a.firstName || '').localeCompare(b.firstName || '');
    });
  }

  // Getter to allow template to access '_students' simply as 'students'
  get students(): any[] {
    return this._students;
  }

  @Input() mode: 'VIEW' | 'ATTENDANCE' = 'VIEW';

  @Output() attendanceChange = new EventEmitter<{ studentId: string; status: 'PRESENT' | 'ABSENT' }>();
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  get canModifyLocked(): boolean {
    return this.auth.hasRole('ADMIN') || this.auth.hasRole('PRINCIPAL');
  }

  toggleAttendance(student: any) {
    // 1. SAFETY CHECK:
    // If ID exists AND user is NOT allowed to modify locked records, stop.
    if (student.attendanceId && !this.canModifyLocked) {
      return;
    }

    // Toggle Status
    student.status = student.status === 'PRESENT' ? 'ABSENT' : 'PRESENT';

    this.attendanceChange.emit({
      studentId: student.id,
      status: student.status,
    });
  }
}
