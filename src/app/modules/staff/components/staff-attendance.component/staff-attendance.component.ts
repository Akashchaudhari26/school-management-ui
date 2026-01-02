import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { StaffSearchFilter } from '../../models/staff';
import { finalize, forkJoin, Observable } from 'rxjs';
import { StaffService } from '../../services/staff.service';
import { AttendanceStatus } from '../../../attendance/attendance.model';
import { AttendanceService } from '../../../attendance/services/attendance.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateUtils } from '../../../../core/utils/date.utils';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StaffTableComponent } from "../staff-table.component/staff-table.component";
import { DropdownOption, StudentService } from '../../../student/services/student.service';

type ViewMode = 'MENU' | 'MARK' | 'MONTHLY' | 'LEAVE';

@Component({
  selector: 'app-staff-attendance.component',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, StaffTableComponent],
  templateUrl: './staff-attendance.component.html',
  styleUrl: './staff-attendance.component.css',
})
export class StaffAttendanceComponent implements OnInit {

  private fb = inject(FormBuilder);
  private staffService = inject(StaffService);
  private attendanceService = inject(AttendanceService);
  private studentSvc = inject(StudentService);

  // --- UI STATE ---
  currentView: ViewMode = 'MENU';
  isLoading = false;

  // Designations Dropdown (Shared)
  designations$: Observable<DropdownOption[]> = this.staffService.getStaffTypes();
  months$: Observable<DropdownOption[]> = this.studentSvc.getMonths();

  // =========================================================
  // 1. MARK ATTENDANCE LOGIC
  // =========================================================
  markForm = this.fb.group({
    date: [DateUtils.getLocalISODate(), Validators.required],
    staffType: [null]
  });

  staffList: any[] = [];
  isSaving = false;
  hasChanges = false;
  private initialStatuses = new Map<string, AttendanceStatus>();

  // =========================================================
  // 2. MONTHLY ATTENDANCE LOGIC
  // =========================================================
  monthlyForm = this.fb.group({
    month: [new Date().getMonth() + 1],
    year: [new Date().getFullYear()],
    staffType: [null]
  });

  daysInMonth: number[] = [];
  registerRows: any[] = [];
  years: number[] = [];

  ngOnInit() {
    // Setup years for Monthly dropdown
    const current = new Date().getFullYear();
    this.years = [current - 1, current, current + 1];
  }

  // --- NAVIGATION ---
  navigateTo(view: ViewMode) {
    this.currentView = view;
    // Optional: Reset data when switching views
    if (view === 'MARK' && this.staffList.length === 0) {
      // this.loadMarkAttendance(); // Auto load if desired
    }
  }

  backToMenu() {
    this.currentView = 'MENU';
    this.staffList = [];
    this.registerRows = [];
  }

  // =========================================================
  // METHOD SET A: MARK ATTENDANCE
  // =========================================================
  loadMarkAttendance() {
    const { date, staffType } = this.markForm.value;
    if (!date) return;

    this.isLoading = true;
    this.hasChanges = false;
    this.staffList = [];

    const staffObs = this.staffService.search({
      keyword: '', staffType: staffType || undefined, status: 'ACTIVE',
      page: 0, size: 1000, sortBy: 'firstName', direction: 'ASC'
    });

    const attendanceObs = this.attendanceService.getStaffAttendance(date, staffType || undefined);

    forkJoin({ staff: staffObs, attendance: attendanceObs })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: ({ staff, attendance }) => {
          this.mergeMarkData(staff.content, attendance.content);
          this.checkForChanges();
        },
        error: (err) => console.error(err)
      });
  }

  private mergeMarkData(staff: any[], attendanceRecords: any[]) {
    const map = new Map(attendanceRecords.map(r => [r.userId, r]));
    this.initialStatuses.clear();

    this.staffList = staff.map(p => {
      const existing = map.get(p.id);
      const status = existing ? existing.status : AttendanceStatus.PRESENT;
      this.initialStatuses.set(p.id, status);
      return { ...p, status, attendanceId: existing?.id || null, isMarked: !!existing };
    });
  }

  onStatusChange(event: { staffId: string; status: AttendanceStatus }) {
    const person = this.staffList.find(p => p.id === event.staffId);
    if (person) {
      person.status = event.status;
      this.checkForChanges();
    }
  }

  private checkForChanges() {
    this.hasChanges = this.staffList.some(p =>
      !p.attendanceId || p.status !== this.initialStatuses.get(p.id)
    );
  }

  submitAttendance() {
    if (!this.hasChanges || this.isSaving) return;
    this.isSaving = true;
    const date = this.markForm.value.date;

    const payload = this.staffList
      .filter(p => !p.attendanceId || p.status !== this.initialStatuses.get(p.id))
      .map(p => ({
        id: p.attendanceId || null, userId: p.id, userType: 'STAFF',
        date: date, status: p.status, remarks: ''
      }));

    if (payload.length === 0) { this.isSaving = false; return; }

    this.attendanceService.markBulkAttendance(payload).subscribe({
      next: (saved: any[]) => {
        const map = new Map(saved.map((r: any) => [r.userId, r]));
        this.staffList.forEach(p => {
          if (map.has(p.id)) {
            p.attendanceId = map.get(p.id).id;
            this.initialStatuses.set(p.id, p.status);
          }
        });
        this.hasChanges = false;
        this.isSaving = false;
        alert('Attendance Saved Successfully');
      },
      error: () => { this.isSaving = false; alert('Failed to save'); }
    });
  }

  // =========================================================
  // METHOD SET B: MONTHLY REGISTER
  // =========================================================
  loadMonthlyRegister() {
    const { month, year, staffType } = this.monthlyForm.value;
    if (!month || !year) return;

    this.isLoading = true;
    this.registerRows = [];

    // 1. Grid Headers
    const daysCount = new Date(year, month, 0).getDate();
    this.daysInMonth = Array.from({ length: daysCount }, (_, i) => i + 1);

    // 2. Fetch
    const staffObs = this.staffService.search({
      staffType: staffType || undefined, status: 'ACTIVE',
      page: 0, size: 1000, sortBy: 'firstName', direction: 'ASC'
    });

    // Assuming you have this service method as discussed previously
    const attObs = this.attendanceService.getStaffMonthlyAttendance(year, month, staffType || undefined);

    forkJoin({ staff: staffObs, logs: attObs })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: ({ staff, logs }) => {
          this.processMonthlyData(staff.content, logs);
        }
      });
  }

  private processMonthlyData(staff: any[], logs: any[]) {
    const logMap = new Map<string, string>();
    logs.forEach((l: any) => {
      const d = new Date(l.date).getDate();
      logMap.set(`${l.userId}-${d}`, l.status);
    });

    this.registerRows = staff.map(p => {
      const days = this.daysInMonth.map(d => logMap.get(`${p.id}-${d}`) || '-');
      const P = days.filter(s => s === 'PRESENT').length;
      const A = days.filter(s => s === 'ABSENT').length;
      return { name: p.fullName, designation: p.designation, days, stats: { P, A } };
    });
  }

  // Add this method to StaffAttendanceComponent

  isWeekend(day: number): boolean {
    const { month, year } = this.monthlyForm.value;
    if (!month || !year) return false;

    // month - 1 because JavaScript months are 0-indexed (0 = Jan, 11 = Dec)
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // 0 is Sunday, 6 is Saturday
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

}