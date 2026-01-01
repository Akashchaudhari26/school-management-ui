import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { StudentSearchFilter } from '../../../student/models/student-filter';
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { AttendanceService } from '../../services/attendance.service';
import { DateUtils } from '../../../../core/utils/date.utils';

// Helper Interface for the UI
interface AttendanceRow {
  studentId: string;
  name: string;
  admissionNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'NOT_MARKED';
  remarks?: string;
  markedBy?: string;
  markedAt?: string; // Timestamp
}

@Component({
  selector: 'app-view-attendance.component',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './view-attendance.component.html',
  styleUrl: './view-attendance.component.css',
})
export class ViewAttendanceComponent {
  private fb = inject(FormBuilder);
  private studentSvc = inject(StudentService);
  private attendanceSvc = inject(AttendanceService);

  // Dropdowns
  classes$: Observable<DropdownOption[]> = this.studentSvc.getClasses();
  sections$: Observable<DropdownOption[]> = this.studentSvc.getSections();

  // Search Form
  filterForm = this.fb.group({
    classId: [''],
    section: [''],
    date: [DateUtils.getLocalISODate()] // Default to today
  });

  // State
  isLoading = false;
  hasSearched = false;
  reportData: AttendanceRow[] = [];

  // Statistics
  stats = {
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  };

  fetchReport() {
    const { classId, section, date } = this.filterForm.value;

    if (!classId || !section || !date) {
      alert('Please select Class, Section, and Date.');
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;

    // 1. Prepare Filter for Students
    const studentFilter: StudentSearchFilter = {
      classId: classId,
      section: section,
      status: 'ACTIVE',
      page: 0,
      size: 200, // Fetch all for the class
      sortBy: 'firstName',
      direction: 'ASC'
    };

    // 2. ForkJoin: Get Students (Names) AND Attendance (Status)
    forkJoin({
      students: this.studentSvc.search(studentFilter),
      attendance: this.attendanceSvc.getClassAttendance(classId, section, date)
    }).subscribe({
      next: ({ students, attendance }) => {
        // 3. Merge Data
        this.processData(students.content, attendance);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  private processData(students: any[], attendanceRecords: any[]) {
    // Map for fast lookup: userId -> AttendanceRecord
    const attendanceMap = new Map(attendanceRecords.map(a => [a.userId, a]));

    this.reportData = students.map(student => {
      const record = attendanceMap.get(student.id);

      return {
        studentId: student.id,
        name: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        // If record exists, use status. If not, it's 'NOT_MARKED' (or default Present depending on policy)
        status: record ? record.status : 'NOT_MARKED',
        remarks: record?.remarks || '-',
        markedBy: record?.markedBy || '-',
        markedAt: record?.createdAt
      };
    });

    this.calculateStats();
  }

  private calculateStats() {
    const total = this.reportData.length;
    // Filter out 'NOT_MARKED' if you don't want them counting towards stats yet
    const present = this.reportData.filter(r => r.status === 'PRESENT').length;
    const absent = this.reportData.filter(r => r.status === 'ABSENT').length;

    this.stats = {
      total,
      present,
      absent,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }
}
