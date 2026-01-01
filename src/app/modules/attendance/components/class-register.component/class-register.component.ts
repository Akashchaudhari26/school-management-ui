import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StudentSearchFilter } from '../../../student/models/student-filter';
import { forkJoin, Observable } from 'rxjs';
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-class-register.component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './class-register.component.html',
  styleUrl: './class-register.component.css',
})
export class ClassRegisterComponent {
  private fb = inject(FormBuilder);
  private studentSvc = inject(StudentService);
  private attendanceSvc = inject(AttendanceService);

  classes$: Observable<DropdownOption[]> = this.studentSvc.getClasses();
  sections$: Observable<DropdownOption[]> = this.studentSvc.getSections();

  // Years for dropdown (current year - 1 to current year + 1)
  years: number[] = [];
  // Months
  months$: Observable<DropdownOption[]> = this.studentSvc.getMonths();

  filterForm = this.fb.group({
    classId: [''],
    section: [''],
    month: [new Date().getMonth() + 1], // Default current month
    year: [new Date().getFullYear()]    // Default current year
  });

  isLoading = false;
  hasLoaded = false;

  // GRID DATA
  daysInMonth: number[] = []; // [1, 2, 3, ... 31]
  registerRows: any[] = [];   // The final processed data for the table

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear - 1, currentYear, currentYear + 1];
  }

  loadRegister() {
    const { classId, section, month, year } = this.filterForm.value;
    if (!classId || !section || !month || !year) return;

    this.isLoading = true;
    this.hasLoaded = true;

    // 1. Generate Days Header (e.g. 1..31)
    const daysCount = new Date(year, month, 0).getDate();
    this.daysInMonth = Array.from({ length: daysCount }, (_, i) => i + 1);

    // 2. Fetch Data
    const studentFilter: StudentSearchFilter = {
      classId, section, status: 'ACTIVE', page: 0, size: 200,
      sortBy: 'firstName', direction: 'ASC'
    };

    forkJoin({
      students: this.studentSvc.search(studentFilter),
      attendance: this.attendanceSvc.getMonthlyAttendance(classId, section, year, month)
    }).subscribe({
      next: ({ students, attendance }) => {
        this.processData(students.content, attendance, year, month);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  private processData(students: any[], logs: any[], year: number, month: number) {
    // 1. Index Attendance by "StudentId-Day" for O(1) lookup
    // Key format: "studentId-5" (Attendance for 5th of the month)
    const logMap = new Map<string, string>();

    logs.forEach(log => {
      const day = new Date(log.date).getDate(); // Extract day (1-31)
      const key = `${log.userId}-${day}`;
      logMap.set(key, log.status);
    });

    // 2. Build Rows
    this.registerRows = students.map(student => {
      const dailyStatuses = this.daysInMonth.map(day => {
        const key = `${student.id}-${day}`;
        return logMap.get(key) || '-'; // '-' means Not Marked/Holiday
      });

      // Calculate Stats
      const presentCount = dailyStatuses.filter(s => s === 'PRESENT').length;
      const absentCount = dailyStatuses.filter(s => s === 'ABSENT').length;

      return {
        name: `${student.firstName} ${student.lastName}`,
        admissionNo: student.admissionNumber,
        days: dailyStatuses, // Array ["P", "A", "-", "P"...]
        stats: { P: presentCount, A: absentCount }
      };
    });
  }

  // Helper to highlight weekends (Optional)
  isWeekend(day: number): boolean {
    const { year, month } = this.filterForm.value;
    // Note: JS Month is 0-indexed
    const date = new Date(year!, month! - 1, day);
    const d = date.getDay();
    return d === 0 || d === 6; // 0=Sun, 6=Sat
  }
}
