import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttendanceReportDTO } from '../../models/attendance-reports';
import { ReportService } from '../../services/report.service';
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { Observable, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-attendance-report.component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.css',
})
export class AttendanceReportComponent {
  private fb = inject(FormBuilder);
  private reportsSvc = inject(ReportService);
  private studentSvc = inject(StudentService);

  // UI State
  activeReport: 'MONTHLY_SUMMARY' | 'LOW_ATTENDANCE' | 'CONSECUTIVE_ABSENT' | null = null;
  isLoading = false;
  reportData: AttendanceReportDTO[] = [];

  // Dropdown Data
  classes$: Observable<DropdownOption[]> = this.studentSvc.getClasses();
  sections$: Observable<DropdownOption[]> = of([]);

  ngOnInit() {
    const classFilter = this.filterForm.get('classId');

    if (classFilter) {
      this.sections$ = classFilter.valueChanges.pipe(
        startWith(classFilter.value || ''),
        switchMap(id => this.studentSvc.getSections(id || ''))
      );
    }
  }


  months$ = this.studentSvc.getMonths(); // Reusing from before

  // Form
  filterForm: FormGroup = this.fb.group({
    classId: ['', Validators.required],
    section: ['', Validators.required],
    month: [new Date().getMonth() + 1],
    year: [new Date().getFullYear()],
    threshold: [75] // For defaulters
  });

  // --- ACTIONS ---

  selectReport(type: 'MONTHLY_SUMMARY' | 'LOW_ATTENDANCE' | 'CONSECUTIVE_ABSENT') {
    this.activeReport = type;
    this.reportData = []; // Clear previous data

    // Reset specific validators if needed
    if (type === 'CONSECUTIVE_ABSENT') {
      // This report might not need class/section filters initially
      this.filterForm.get('classId')?.clearValidators();
      this.filterForm.get('section')?.clearValidators();
    } else {
      this.filterForm.get('classId')?.setValidators(Validators.required);
      this.filterForm.get('section')?.setValidators(Validators.required);
    }
    this.filterForm.get('classId')?.updateValueAndValidity();
  }

  clearReport() {
    this.activeReport = null;
    this.reportData = [];
  }

  getReportTitle() {
    switch (this.activeReport) {
      case 'MONTHLY_SUMMARY': return 'Monthly Attendance Summary';
      case 'LOW_ATTENDANCE': return 'Low Attendance Defaulters';
      case 'CONSECUTIVE_ABSENT': return 'Consecutive Absentees';
      default: return 'Report';
    }
  }

  // --- API CALLS ---

  generateReport() {
    if (this.filterForm.invalid && this.activeReport !== 'CONSECUTIVE_ABSENT') return;

    this.isLoading = true;
    const { classId, section, month, year, threshold } = this.filterForm.value;

    let request;

    if (this.activeReport === 'MONTHLY_SUMMARY') {
      request = this.reportsSvc.getClassMonthlySummary(classId, section, month, year);
    }
    else if (this.activeReport === 'LOW_ATTENDANCE') {
      request = this.reportsSvc.getDefaulters(classId, section, threshold);
    }
    else {
      request = this.reportsSvc.getConsecutiveAbsentees(3);
    }

    request.subscribe({
      next: (data) => {
        this.reportData = data.sort((a, b) => a.studentName.localeCompare(b.studentName));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Report failed', err);
        this.isLoading = false;
      }
    });
  }

  // Helper for badges
  getBadgeClass(percentage: number): string {
    if (percentage >= 90) return 'badge-good';
    if (percentage >= 75) return 'badge-avg';
    return 'badge-poor';
  }

  exportPdf() {
    alert("Export feature coming next!");
    // You would use jsPDF here
  }
}
