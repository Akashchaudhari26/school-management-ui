import { Component, inject, OnInit } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamService } from '../../service/exam.service';
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';
import { BulkMarksRequest, ExamDefinition, ExamFilter, StudentMarkEntry } from '../../models/exam.types';
import { AcademicYear } from '../../../school-config/models/school-config';
import { Observable, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-view-mark-sheet',
  imports: [COMMON_IMPORTS],
  templateUrl: './view-mark-sheet.component.html',
  styleUrl: './view-mark-sheet.component.css',
})
export class ViewMarkSheetComponent implements OnInit {
  private fb = inject(FormBuilder);
  private examService = inject(ExamService);
  private studentService = inject(StudentService);
  private configService = inject(SchoolConfigService);

  // Forms
  filterForm: FormGroup;

  // Data State
  sheetData: BulkMarksRequest | null = null;
  academicYears: AcademicYear[] = [];

  // Dropdowns
  classes$: Observable<DropdownOption[]> = this.studentService.getClasses();
  sections$: Observable<DropdownOption[]> = of([]);
  subjects$: Observable<DropdownOption[]> = of([]);

  // 🔥 Dynamic Exam State
  allExams: ExamDefinition[] = [];       // Raw data from API
  filteredExams: ExamDefinition[] = [];  // Filtered list for UI

  // UI State
  isLoading = false;
  stats = { average: 0, highest: 0, lowest: 0, passCount: 0 };

  constructor() {
    this.filterForm = this.fb.group({
      academicYear: ['', Validators.required],
      classId: ['', Validators.required],
      section: ['', Validators.required],
      examName: ['', Validators.required],
      subjectName: ['', Validators.required],
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

      // 2. Load Subjects
      this.subjects$ = classCtrl.valueChanges.pipe(
        startWith(classCtrl.value || ''),
        switchMap(id => this.studentService.getSubjects(id || ''))
      );

      // 3. Filter Exams when Class Changes
      classCtrl.valueChanges.subscribe((selectedClassId) => {
        this.filterExams(selectedClassId);
        // Reset selected exam to avoid mismatches
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

  fetchSheet() {
    if (this.filterForm.invalid) return;

    this.isLoading = true;
    this.sheetData = null; // Reset view

    const filter: ExamFilter = this.filterForm.value;

    this.examService.getMarkSheet(filter).subscribe({
      next: (res) => {
        this.sheetData = res;
        this.calculateStats(res.studentMarks, res.totalMarks);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  private calculateStats(marks: StudentMarkEntry[], totalMarks: number) {
    const validEntries = marks.filter(m => m.marksObtained !== null && m.marksObtained !== undefined);

    if (validEntries.length === 0) {
      this.stats = { average: 0, highest: 0, lowest: 0, passCount: 0 };
      return;
    }

    const scores = validEntries.map(m => m.marksObtained!);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    // Dynamic Pass Threshold based on exam config (if available) or standard 35%
    const passThreshold = totalMarks * 0.35;
    const pass = scores.filter(s => s >= passThreshold).length;

    this.stats = {
      average: Math.round(avg * 10) / 10,
      highest: max,
      lowest: min,
      passCount: pass
    };
  }

  getPerformanceClass(marks: number | null, total: number): string {
    if (marks === null) return 'bg-light text-muted';
    const percentage = (marks / total) * 100;

    if (percentage >= 80) return 'bg-success-subtle text-success border-success';
    if (percentage >= 50) return 'bg-primary-subtle text-primary border-primary';
    if (percentage >= 35) return 'bg-warning-subtle text-warning border-warning';
    return 'bg-danger-subtle text-danger border-danger';
  }
}