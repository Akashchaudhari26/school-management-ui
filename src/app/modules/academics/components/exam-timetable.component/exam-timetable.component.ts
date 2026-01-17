import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamService } from '../../service/exam.service';
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';
import { AcademicYear } from '../../../school-config/models/school-config';
import { ExamDefinition, ExamSubjectSchedule } from '../../models/exam.types';

@Component({
  selector: 'app-exam-timetable.component',
  imports: [COMMON_IMPORTS],
  templateUrl: './exam-timetable.component.html',
  styleUrl: './exam-timetable.component.css',
})
export class ExamTimetableComponent {
  private fb = inject(FormBuilder);
  private examService = inject(ExamService);
  private studentService = inject(StudentService);
  private configService = inject(SchoolConfigService);

  // Forms & Data
  filterForm: FormGroup;
  academicYears: AcademicYear[] = [];
  exams: ExamDefinition[] = [];
  classes: DropdownOption[] = [];

  // The specific schedule to display
  selectedExam: ExamDefinition | null = null;
  selectedClassSchedule: ExamSubjectSchedule[] = [];
  selectedClassName: string = '';

  isLoading = false;

  constructor() {
    this.filterForm = this.fb.group({
      academicYear: ['', Validators.required],
      examId: ['', Validators.required],
      classId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadInitialData();
    this.setupListeners();
  }

  loadInitialData() {
    // 1. Load Years
    this.configService.getAllAcademicYears().subscribe(years => {
      this.academicYears = years;
      const active = years.find(y => y.active);
      if (active) {
        this.filterForm.patchValue({ academicYear: active.name });
      }
    });

    // 2. Load Classes
    this.studentService.getClasses().subscribe(classes => {
      this.classes = classes;
    });
  }

  setupListeners() {
    // When Year Changes -> Fetch Exams
    this.filterForm.get('academicYear')?.valueChanges.subscribe(year => {
      if (year) this.loadExams(year);
    });

    // Initial load if active year is set
    const currentYear = this.filterForm.get('academicYear')?.value;
    if (currentYear) this.loadExams(currentYear);
  }

  loadExams(year: string) {
    this.isLoading = true;
    this.examService.getExamsByYear(year).subscribe({
      next: (data) => {
        this.exams = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  generateTimetable() {
    if (this.filterForm.invalid) return;

    const { examId, classId } = this.filterForm.value;

    // 1. Find the selected Exam object
    this.selectedExam = this.exams.find(e => e.id === examId) || null;

    if (this.selectedExam) {
      // 2. Find the nested configuration for the selected Class
      const classConfig = this.selectedExam.classConfigs.find(
        c => c.classId === classId || c.className === classId // Handle both ID or Name match safely
      );

      if (classConfig) {
        this.selectedClassSchedule = classConfig.subjects || [];
        this.selectedClassName = classConfig.className;

        // Optional: Sort by Date
        this.selectedClassSchedule.sort((a, b) =>
          new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
        );
      } else {
        this.selectedClassSchedule = [];
        alert('No configuration found for this class in the selected exam.');
      }
    }
  }

  printTimetable() {
    window.print();
  }
}
