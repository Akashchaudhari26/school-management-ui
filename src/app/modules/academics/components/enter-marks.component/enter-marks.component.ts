import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamService } from '../../service/exam.service';
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { AcademicYear } from '../../../school-config/models/school-config';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';
import { merge, Observable, of, startWith, switchMap } from 'rxjs';
import { BulkMarksRequest, ExamDefinition, ExamFilter, StudentMarkEntry } from '../../models/exam.types';

@Component({
  selector: 'app-enter-marks.component',
  imports: [COMMON_IMPORTS],
  templateUrl: './enter-marks.component.html',
  styleUrl: './enter-marks.component.css',
})
export class EnterMarksComponent {
  private studentService = inject(StudentService);

  // Forms
  filterForm: FormGroup;
  marksForm: FormGroup;

  // Dropdown Data
  classes$: Observable<DropdownOption[]> = this.studentService.getClasses();
  sections$: Observable<DropdownOption[]> = of([]);
  subjects$: Observable<DropdownOption[]> = of([]);
  academicYears: AcademicYear[] = [];

  // State
  isLoading = false;
  isSubmitting = false;
  sheetLoaded = false;

  // Exam State
  allExams: ExamDefinition[] = [];       // Stores the raw data from API
  filteredExams: ExamDefinition[] = [];  // Used in the HTML dropdown

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private configService: SchoolConfigService
  ) {
    // 1. Filter Form
    this.filterForm = this.fb.group({
      academicYear: ['', Validators.required],
      classId: ['', Validators.required],
      section: ['', Validators.required],
      examName: ['', Validators.required],
      subjectName: ['', Validators.required],
    });

    // 2. Main Data Form (Contains Array of Students)
    this.marksForm = this.fb.group({
      totalMarks: [100, [Validators.required, Validators.min(1)]],
      studentMarks: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadAcademicYears();
    this.setupFormListeners();

    // Listener to update validators if Total Marks changes manually
    this.marksForm.get('totalMarks')?.valueChanges.subscribe((newMax) => {
      this.updateMaxValidator(newMax || 100);
    });
  }

  updateMaxValidator(max: number) {
    const studentArray = this.marksForm.get('studentMarks') as FormArray;

    studentArray.controls.forEach(control => {
      const marksControl = control.get('marksObtained');
      if (marksControl) {
        // Re-apply validators with the new Max value
        marksControl.setValidators([
          Validators.min(0),
          Validators.max(max) // <--- The Limit
        ]);
        // Trigger validation check immediately
        marksControl.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  loadDropDown() {
    const classFilter = this.filterForm.get('classId');

    if (classFilter) {
      this.sections$ = classFilter.valueChanges.pipe(
        startWith(classFilter.value || ''),
        switchMap(id => this.studentService.getSections(id || '')));

      this.subjects$ = classFilter.valueChanges.pipe(
        startWith(classFilter.value || ''),
        switchMap(id => this.studentService.getSubjects(id || '')));
    }
  }
  // --- Step 1: Fetch the Sheet ---
  fetchSheet() {
    if (this.filterForm.invalid) return;
    this.isLoading = true;
    this.sheetLoaded = false;

    // Use specific type 'ExamFilter'
    const filter: ExamFilter = this.filterForm.value;

    this.examService.getMarkSheet(filter).subscribe({
      next: (res: BulkMarksRequest) => {
        // Backend returns the full request object with the student list inside
        this.populateGrid(res.studentMarks);
        this.isLoading = false;
        this.sheetLoaded = true;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        alert('Failed to fetch student list.');
      }
    });
  }

  // Helper to access the FormArray controls in the template
  get studentControls() {
    return (this.marksForm.get('studentMarks') as FormArray).controls;
  }

  // Populate the Grid using the Typed Array
  populateGrid(data: StudentMarkEntry[]) {
    const control = this.marksForm.get('studentMarks') as FormArray;
    control.clear();
    const currentMax = this.marksForm.get('totalMarks')?.value || 100;

    data.forEach(student => {
      const row = this.fb.group({
        studentId: [student.studentId],
        // Map fields from the interface
        name: [student.studentName || 'Student'],
        admissionNo: [student.admissionNumber || '-'],

        // Input Fields
        marksObtained: [student.marksObtained, [Validators.min(0), Validators.max(currentMax)]],
        remarks: [student.remarks]
      });
      control.push(row);
    });
  }

  // --- Step 2: Save Data ---
  onSubmit() {
    if (this.marksForm.invalid) {
      alert('Please check the marks entered. Total Marks is required.');
      return;
    }

    this.isSubmitting = true;

    // Construct Payload matching 'BulkMarksRequest' interface
    const formValue = this.marksForm.value;
    const filterValue = this.filterForm.value;

    const payload: BulkMarksRequest = {
      classId: filterValue.classId,
      section: filterValue.section,
      academicYear: filterValue.academicYear,
      examName: filterValue.examName,
      subjectName: filterValue.subjectName,
      totalMarks: formValue.totalMarks,

      // Map the FormArray back to 'StudentMarkEntry[]'
      studentMarks: formValue.studentMarks.map((s: any): StudentMarkEntry => ({
        studentId: s.studentId,
        studentName: s.name, // Just for consistency, though backend ignores this on save
        marksObtained: s.marksObtained,
        remarks: s.remarks
      }))
    };

    this.examService.saveBulkMarks(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Marks Saved Successfully!');
      },
      error: () => {
        this.isSubmitting = false;
        alert('Failed to save marks.');
      }
    });
  }

  autoFillTotalMarks(examName: string) {
    if (!examName) return;

    const classId = this.filterForm.get('classId')?.value;
    const subjectName = this.filterForm.get('subjectName')?.value;

    // We need at least the class to find the config
    if (!classId) return;

    // 1. Find the Exam
    const selectedExam = this.allExams.find(e => e.name === examName);
    if (!selectedExam) return;

    // 2. Find the Class Configuration
    const classConfig = selectedExam.classConfigs.find(
      c => c.classId === classId || c.className.includes(classId)
    );
    if (!classConfig) return;

    // 3. Start with the Default Class Max Marks (e.g. 50)
    let targetTotal = 100;

    // 4. If a Subject is selected, check for an override (e.g. Math might be 80)
    if (subjectName && classConfig.subjects) {
      const subjectConfig = classConfig.subjects.find(
        s => s.subjectName === subjectName
      );

      // If found and has a specific max mark, use it. Otherwise keep class default.
      if (subjectConfig && subjectConfig.subjectMaxMarks) {
        targetTotal = subjectConfig.subjectMaxMarks;
      }
    }

    // 5. Update Form
    this.marksForm.patchValue({
      totalMarks: targetTotal
    });
  }

  filterExams(classId: string) {
    if (!classId || this.allExams.length === 0) {
      this.filteredExams = [];
      return;
    }

    // Filter Logic:
    // Check if the exam's 'classConfigs' array has an entry that contains the selected Class ID.
    // Based on your JSON, className is "Bal Vidya [NURSERY]" and classId is "NURSERY".
    // So we check if config.className includes the classId.

    console.log(this.allExams);
    this.filteredExams = this.allExams.filter(exam =>
      exam.classConfigs.some(config => config.className.includes(classId) || config.classId === classId)
    );
  }

  loadExams() {
    const year = this.filterForm.get('academicYear')?.value;
    if (!year) return;

    this.examService.getExamsByYear(year).subscribe({
      next: (data) => {
        this.allExams = data;
        // Trigger filter immediately in case class is already selected
        const currentClass = this.filterForm.get('classId')?.value;
        this.filterExams(currentClass);
      },
      error: (err) => console.error('Failed to load exams', err)
    });
  }

  loadAcademicYears() {
    this.configService.getAllAcademicYears().subscribe(years => {
      this.academicYears = years;
      const activeYear = years.find(y => y.active);
      if (activeYear) {
        this.filterForm.patchValue({ academicYear: activeYear.name });
        // Load exams immediately after setting year
        this.loadExams();
      }
    });

    // Reload exams if year changes
    this.filterForm.get('academicYear')?.valueChanges.subscribe(() => {
      this.loadExams();
    });
  }

  setupFormListeners() {
    const classCtrl = this.filterForm.get('classId');
    const examCtrl = this.filterForm.get('examName');
    const subjectCtrl = this.filterForm.get('subjectName')

    if (classCtrl) {
      // 1. Load Sections
      this.sections$ = classCtrl.valueChanges.pipe(
        startWith(classCtrl.value || ''),
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
        // Reset exam selection because the previous exam might not be valid for this class
        examCtrl?.setValue('');
      });
    }

    // 4. Auto-Fill Total Marks when Exam is selected
    if (examCtrl && subjectCtrl) {
      merge(examCtrl.valueChanges, subjectCtrl.valueChanges).subscribe(() => {
        // We pass the current exam value explicitly to be safe
        const currentExam = examCtrl.value;
        if (currentExam) {
          this.autoFillTotalMarks(currentExam);
        }
      });
    }
  }
}
