import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentTableComponent } from "../../../student/components/student-table.component/student-table.component";
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { forkJoin, Observable } from 'rxjs';
import { StudentSearchFilter } from '../../../student/models/student-filter';
import { Auth } from '../../../../core/services/auth';
import { DateUtils } from '../../../../core/utils/date.utils';

@Component({
  standalone: true,
  selector: 'app-mark-attendance',
  templateUrl: './mark-attendance.component.html',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, StudentTableComponent],
  styleUrl: './mark-attendance.component.css',

})
export class MarkAttendanceComponent {
  private studentSvc = inject(StudentService);
  private attendanceSvc = inject(AttendanceService);
  private fb = inject(FormBuilder);

  // Filters
  classId = '';
  sectionId = '';
  date = DateUtils.getLocalISODate();

  filterForm = this.fb.group({
    keyword: [''],
    classId: [''],
    section: [''],
    date: [DateUtils.getLocalISODate()],
    admissionYear: []
  });

  isLoading = false;
  isSaving = false;

  // Data
  students: any[] = [];

  // Logic: Store original state to check for changes
  private initialStatuses = new Map<string, string>();
  hasChanges = false; // Controls the Save Button

  classes$: Observable<DropdownOption[]> = this.studentSvc.getClasses();
  sections$: Observable<DropdownOption[]> = this.studentSvc.getSections();

  loadAttendance() {
    const classId = this.filterForm.value.classId;
    const section = this.filterForm.value.section;
    const selectedDate = this.filterForm.value.date;

    if (!classId || !section || !selectedDate) {
      alert('Please select both Class and Section.');
      return;
    }

    // Update local variables for save payload
    this.classId = classId;
    this.sectionId = section;
    this.date = selectedDate;

    this.isLoading = true;
    this.hasChanges = false; // Reset dirty flag on new search

    const formVal = this.filterForm.value;

    const studentFilter: StudentSearchFilter = {
      keyword: formVal.keyword || '',
      classId: classId,
      section: section,
      admissionYear: formVal.admissionYear || undefined,
      status: 'ACTIVE',
      size: 200,
      sortBy: 'lastName',
      direction: 'ASC',
      page: 0
    };

    forkJoin({
      students: this.studentSvc.search(studentFilter),
      attendance: this.attendanceSvc.getClassAttendance(classId, section, this.date)
    }).subscribe({
      next: ({ students, attendance }) => {
        this.students = this.mergeStudentsWithAttendance(
          students.content,
          attendance
        );
        this.checkForChanges();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  private mergeStudentsWithAttendance(students: any[], attendance: any[]) {
    // 1. Create a map of existing attendance
    const attendanceMap = new Map(attendance.map(a => [a.userId, a]));

    // 2. Clear previous history
    this.initialStatuses.clear();

    return students.map(s => {
      const existing = attendanceMap.get(s.id);

      // Logic: If record exists, use its status. If not, default to PRESENT.
      const status = existing ? existing.status : 'PRESENT';

      // Store the "Original" state to compare later
      this.initialStatuses.set(s.id, status);

      return {
        ...s,
        status: status,
        attendanceId: existing?.id ?? null,
        // Helper flag: if it has an ID, it was already marked previously
        isMarked: !!existing
      };
    });
  }

  onStatusChange(e: { studentId: string; status: 'PRESENT' | 'ABSENT' }) {
    const s = this.students.find(x => x.id === e.studentId);
    if (s) {
      s.status = e.status;
      this.checkForChanges();
    }
  }

  // 🔥 DIRTY CHECK LOGIC
  private checkForChanges() {
    // Check if ANY student's current status differs from their initial status
    this.hasChanges = this.students.some(s =>
      !s.attendanceId || // Enable if NEW (even if default Present)
      s.status !== this.initialStatuses.get(s.id) // Enable if MODIFIED
    );
  }

  submitAttendance() {
    this.isSaving = true;

    // 🔥 FILTER LOGIC:
    // 1. New Record: (!s.attendanceId) -> Always send.
    // 2. Modified Record: (s.status !== initialStatus) -> Send only if status changed.
    const payload = this.students
      .filter(s => {
        const isNew = !s.attendanceId;
        const isModified = s.status !== this.initialStatuses.get(s.id);

        return isNew || isModified;
      })
      .map(s => ({
        userId: s.id,
        userType: 'STUDENT',
        classId: this.classId,
        sectionId: this.sectionId,
        date: this.date,
        status: s.status,
        // Send the ID if it exists (for Updates), or null (for Inserts)
        id: s.attendanceId || null
      }));

    // Safety: If no changes were actually made, stop.
    if (payload.length === 0) {
      alert('No changes to save.');
      this.isSaving = false;
      return;
    }

    this.attendanceSvc.markBulkAttendance(payload).subscribe({
      next: (savedRecords: any[]) => {
        alert('Attendance saved successfully');
        this.isSaving = false;

        // 1. Map new IDs back to local students
        const newIdsMap = new Map();
        savedRecords.forEach(r => newIdsMap.set(r.userId, r.id));

        this.students.forEach(student => {
          // A. If it was a NEW record, assign the new ID
          if (newIdsMap.has(student.id)) {
            student.attendanceId = newIdsMap.get(student.id);
          }

          // B. CRITICAL: Update the "Initial State" to match the new saved state
          // This ensures "isModified" returns false until you change it again.
          this.initialStatuses.set(student.id, student.status);
        });

        // 2. Reset dirty flag
        this.hasChanges = false;

        // 3. Refresh array reference to trigger UI updates (sorting/locking)
        this.students = [...this.students];
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to save attendance');
        this.isSaving = false;
      }
    });
  }
}