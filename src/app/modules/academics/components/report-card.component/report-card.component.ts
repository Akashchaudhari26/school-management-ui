import { Component, inject, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamService } from '../../service/exam.service';
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';
import { AcademicYear } from '../../../school-config/models/school-config';
import { Observable, of, startWith, switchMap } from 'rxjs';
import { ExamDefinition, ExamFilter, StudentReportCardResponse } from '../../models/exam.types';
import { StudentSearchFilter } from '../../../student/models/student-filter';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-card',
  imports: [COMMON_IMPORTS],
  templateUrl: './report-card.component.html',
  styleUrl: './report-card.component.css',
})
export class ReportCardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private examService = inject(ExamService);
  private studentService = inject(StudentService);
  private configService = inject(SchoolConfigService);

  filterForm: FormGroup;

  // Data
  academicYears: AcademicYear[] = [];
  studentList: any[] = [];
  reportCard: StudentReportCardResponse | null = null;
  bulkReports: StudentReportCardResponse[] = [];

  // Dropdowns
  classes$: Observable<DropdownOption[]> = this.studentService.getClasses();
  sections$: Observable<DropdownOption[]> = of([]);

  // 🔥 Dynamic Exam State
  allExams: ExamDefinition[] = [];       // Raw data from API
  filteredExams: ExamDefinition[] = [];  // Filtered list for UI

  // UI State
  isLoading = false;
  isGenerating = false;
  showModal = false;
  showBulkModal = false;

  constructor(private router: Router) {
    this.filterForm = this.fb.group({
      academicYear: ['', Validators.required],
      classId: ['', Validators.required],
      section: ['', Validators.required],
      examName: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.setupDropdowns();
    this.loadAcademicYears();
  }

  setupDropdowns() {
    const classCtrl = this.filterForm.get('classId');
    const examCtrl = this.filterForm.get('examName');

    if (classCtrl) {
      // 1. Load Sections
      this.sections$ = classCtrl.valueChanges.pipe(
        startWith(''),
        switchMap(id => this.studentService.getSections(id || ''))
      );

      // 2. Filter Exams when Class Changes
      classCtrl.valueChanges.subscribe((selectedClassId) => {
        this.filterExams(selectedClassId);
        // Reset exam selection because the previous exam might not be valid for this class
        examCtrl?.setValue('');
      });
    }
  }

  loadAcademicYears() {
    this.configService.getAllAcademicYears().subscribe(years => {
      this.academicYears = years;

      // Auto-select active year
      const active = years.find(y => y.active);
      if (active) {
        this.filterForm.patchValue({ academicYear: active.name });
        // 🔥 Load exams immediately after year is set
        this.loadExams();
      }
    });

    // Reload exams if the user manually changes the year
    this.filterForm.get('academicYear')?.valueChanges.subscribe(() => {
      this.loadExams();
    });
  }

  loadExams() {
    const year = this.filterForm.get('academicYear')?.value;
    if (!year) return;

    this.examService.getExamsByYear(year).subscribe({
      next: (data) => {
        this.allExams = data;
        // Trigger filter immediately if a class is already selected
        const currentClass = this.filterForm.get('classId')?.value;
        this.filterExams(currentClass);
      },
      error: (err) => console.error('Failed to load exams', err)
    });
  }

  filterExams(classId: string) {
    if (!classId || this.allExams.length === 0) {
      this.filteredExams = [];
      return;
    }

    // Filter Logic: Show exam ONLY if it includes the selected Class ID
    this.filteredExams = this.allExams.filter(exam =>
      exam.classConfigs.some(config => config.className.includes(classId))
    );
  }

  // --- STEP 1: LOAD STUDENT LIST ---
  fetchStudents() {
    if (this.filterForm.invalid) return;
    this.isLoading = true;
    this.studentList = [];

    const { classId, section } = this.filterForm.value;

    const filter: StudentSearchFilter = {
      classId, section, status: 'ACTIVE',
      page: 0, size: 100, sortBy: 'firstName', direction: 'ASC'
    };

    this.studentService.search(filter).subscribe({
      next: (res: any) => {
        this.studentList = res.content;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to load students.');
      }
    });
  }

  // --- STEP 2: VIEW REPORT (OPEN MODAL) ---
  viewReport(studentId: string) {
    this.isGenerating = true;
    this.reportCard = null;

    const filter: ExamFilter = {
      ...this.filterForm.value,
      studentId: studentId
    };

    this.examService.getStudentReportCard(filter).subscribe({
      next: (res) => {
        this.reportCard = res;
        this.isGenerating = false;
        this.showModal = true;
      },
      error: (err) => {
        this.isGenerating = false;
        alert('Report card not found for this student.');
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.reportCard = null;
  }

  printReport() {
    window.print();
  }

  printAllReports() {
    if (this.filterForm.invalid) return;

    this.reportCard = null;
    this.isLoading = true;

    const filter: ExamFilter = this.filterForm.value;

    this.examService.getClassReportCards(filter).subscribe({
      next: (res) => {
        this.bulkReports = res;
        this.isLoading = false;
        this.showBulkModal = true;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Failed to fetch class reports.');
      }
    });
  }

  triggerBulkPrint() {
    setTimeout(() => window.print(), 50);
  }

  closeBulkModal() {
    this.showBulkModal = false;
    this.bulkReports = [];
  }
}