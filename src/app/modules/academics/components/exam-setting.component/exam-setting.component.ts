import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { ExamDefinition } from '../../models/exam.types';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamService } from '../../service/exam.service';
import { DropdownOption, StudentService } from '../../../student/services/student.service';
import { AcademicYear } from '../../../school-config/models/school-config';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';

@Component({
  selector: 'app-exam-setting.component',
  imports: [COMMON_IMPORTS],
  templateUrl: './exam-setting.component.html',
  styleUrl: './exam-setting.component.css',
})
export class ExamSettingComponent {

  private fb = inject(FormBuilder);
  private examService = inject(ExamService);
  private studentService = inject(StudentService);
  private configService = inject(SchoolConfigService);

  exams: ExamDefinition[] = [];
  examForm: FormGroup;
  showModal = false;
  isSubmitting = false;
  isEditMode = false;
  editingExamId: string | null = null;

  academicYears: AcademicYear[] = [];
  availableClasses: DropdownOption[] = [];
  currentActiveYear: string = '';

  expandedRows = new Set<number>();

  constructor() {
    this.examForm = this.fb.group({
      name: ['', Validators.required],
      academicYear: ['', Validators.required],
      startDate: [null],
      endDate: [null],
      isPublished: [false],
      classConfigs: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  /* ===================== LOAD DATA ===================== */

  loadInitialData() {
    this.configService.getAllAcademicYears().subscribe(years => {
      this.academicYears = years;
      const active = years.find(y => y.active);
      if (active) {
        this.currentActiveYear = active.name;
        this.examForm.patchValue({ academicYear: this.currentActiveYear });
        this.loadExams();
      }
    });

    this.studentService.getClasses().subscribe(classes => {
      this.availableClasses = classes;
    });
  }

  loadExams() {
    this.examService.getExamsByYear(this.currentActiveYear).subscribe({
      next: data => this.exams = data,
      error: err => console.error('Failed to load exams', err)
    });
  }

  /* ===================== FORM HELPERS ===================== */

  get classConfigs(): FormArray {
    return this.examForm.get('classConfigs') as FormArray;
  }

  getSubjectsArray(index: number): FormArray {
    return this.classConfigs.at(index).get('subjects') as FormArray;
  }

  /* ===================== MODAL ===================== */

  openCreateModal() {
    this.editingExamId = null;
    this.examForm.reset({
      academicYear: this.currentActiveYear,
      isPublished: false
    });

    this.classConfigs.clear();
    this.expandedRows.clear();

    this.availableClasses.forEach(cls => {
      const classGroup = this.fb.group({
        isSelected: [false],
        className: [cls.label],
        classId: [cls.value],
        maxMarks: [50, [Validators.required, Validators.min(1)]],
        passMarks: [18, [Validators.required, Validators.min(1)]],
        subjects: this.fb.array([])
      });

      this.loadSubjectsForClass(classGroup, cls.value);

      // IMPORTANT: subjects disabled by default
      (classGroup.get('subjects') as FormArray).disable({ emitEvent: false });

      this.classConfigs.push(classGroup);
    });

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  /* ===================== SUBJECTS ===================== */

  loadSubjectsForClass(classGroup: FormGroup, classId: string) {
    this.studentService.getSubjects(classId).subscribe(subjects => {
      const subjectsArray = classGroup.get('subjects') as FormArray;
      subjectsArray.clear();

      subjects.forEach(subj => {
        subjectsArray.push(this.fb.group({
          subjectName: [subj.label, Validators.required],
          examDate: [null, Validators.required],
          startTime: ['', Validators.required],
          duration: ['', Validators.required],
          syllabus: [''],
          subjectMaxMarks: [
            classGroup.get('maxMarks')?.value,
            Validators.min(1)
          ]
        }));
      });
    });
  }

  /* ===================== SELECTION HANDLING (CRITICAL FIX) ===================== */

  onClassSelectionChange(index: number) {
    const classGroup = this.classConfigs.at(index) as FormGroup;
    const selected = classGroup.get('isSelected')?.value;
    const subjects = classGroup.get('subjects') as FormArray;

    if (selected) {
      classGroup.get('maxMarks')?.enable({ emitEvent: false });
      classGroup.get('passMarks')?.enable({ emitEvent: false });
      subjects.enable({ emitEvent: false });
    } else {
      classGroup.get('maxMarks')?.disable({ emitEvent: false });
      classGroup.get('passMarks')?.disable({ emitEvent: false });
      subjects.disable({ emitEvent: false });
      this.expandedRows.delete(index);
    }
  }

  /* ===================== BATCH UPDATE ===================== */

  applyGlobalMarks(field: 'maxMarks' | 'passMarks', value: string) {
    const val = parseInt(value, 10);
    if (!val) return;

    this.classConfigs.controls.forEach(control => {
      if (control.get('isSelected')?.value) {
        control.get(field)?.setValue(val);
      }
    });
  }

  /* ===================== SAVE ===================== */

  saveExam() {
    if (this.examForm.invalid) {
      this.examForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formVal = this.examForm.value;

    const activeClasses = formVal.classConfigs
      .filter((c: any) => c.isSelected)
      .map((c: any) => ({
        className: c.className,
        classId: c.classId,
        maxMarks: c.maxMarks,
        passMarks: c.passMarks,
        subjects: c.subjects.map((s: any) => ({
          subjectName: s.subjectName,
          examDate: s.examDate,
          startTime: s.startTime,
          duration: s.duration,
          syllabus: s.syllabus,
          subjectMaxMarks: s.subjectMaxMarks
        }))
      }));

    if (activeClasses.length === 0) {
      alert('Please select at least one class.');
      this.isSubmitting = false;
      return;
    }

    const payload: ExamDefinition = {
      id: this.editingExamId ?? undefined,   // 👈 THIS LINE DECIDES CREATE vs UPDATE
      name: formVal.name,
      academicYear: formVal.academicYear,
      startDate: formVal.startDate,
      endDate: formVal.endDate,
      isPublished: formVal.isPublished,
      isActive: true,
      classConfigs: activeClasses
    };

    this.examService.createExamDefinition(payload).subscribe({
      next: () => {
        alert(this.editingExamId ? 'Exam updated successfully!' : 'Exam created successfully!');
        this.isSubmitting = false;
        this.closeModal();
        this.loadExams();
        this.editingExamId = null;
      },
      error: err => {
        console.error(err);
        alert('Error saving exam');
        this.isSubmitting = false;
      }
    });
  }

  /* ===================== UI HELPERS ===================== */

  toggleRow(index: number) {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
    } else {
      this.expandedRows.add(index);
    }
  }

  getClassesTooltip(configs: any[]): string {
    if (!configs || configs.length === 0) return 'No classes assigned';
    return configs.map(c => c.className).join(', ');
  }

  /* ===================== DEBUG ===================== */

  debugForm() {
    console.log('Form Status:', this.examForm.status);
    this.debugClassConfigs();
  }

  debugClassConfigs() {
    this.classConfigs.controls.forEach((classCtrl, i) => {
      console.log(`Class[${i}]`, classCtrl.status);
      const subjects = classCtrl.get('subjects') as FormArray;
      subjects.controls.forEach((subCtrl, j) => {
        console.log(`  Subject[${j}]`, subCtrl.status, subCtrl.value);
      });
    });
  }

  syncFirstSubjectValue(
    classIndex: number,
    subjectIndex: number,
    controlName: 'examDate' | 'startTime'
  ) {
    if (subjectIndex !== 0) return;

    const subjects = this.getSubjectsArray(classIndex);
    const firstValue = subjects.at(0).get(controlName)?.value;

    subjects.controls.forEach((ctrl, i) => {
      if (i === 0) return;

      ctrl.get(controlName)?.patchValue(firstValue, { emitEvent: false });
    });
  }


  openEditModal(exam: ExamDefinition) {
    this.isEditMode = true;
    this.editingExamId = exam.id!;
    this.expandedRows.clear();

    // Reset base form
    this.examForm.reset({
      name: exam.name,
      academicYear: exam.academicYear,
      startDate: exam.startDate,
      endDate: exam.endDate,
      isPublished: exam.isPublished
    });

    this.classConfigs.clear();

    // Load all classes
    this.availableClasses.forEach(cls => {
      const existingClass = exam.classConfigs.find(
        c => c.classId === cls.value
      );

      const classGroup = this.fb.group({
        isSelected: [!!existingClass],
        className: [cls.label],
        classId: [cls.value],
        subjects: this.fb.array([])
      });

      this.classConfigs.push(classGroup);

      if (existingClass) {
        this.loadSubjectsForEdit(classGroup, existingClass.subjects);
        (classGroup.get('subjects') as FormArray).enable({ emitEvent: false });
      } else {
        this.loadSubjectsForClass(classGroup, cls.value);
        (classGroup.get('subjects') as FormArray).disable({ emitEvent: false });
      }
    });

    this.showModal = true;
  }

  loadSubjectsForEdit(classGroup: FormGroup, subjects: any[]) {
    console.log(subjects)
    const subjectsArray = classGroup.get('subjects') as FormArray;
    subjectsArray.clear();

    subjects.forEach(subj => {
      subjectsArray.push(this.fb.group({
        subjectName: [subj.subjectName],
        examDate: [subj.examDate
          ? new Date(subj.examDate).toISOString().substring(0, 10)
          : null, Validators.required],
        startTime: [subj.startTime, Validators.required],
        duration: [subj.duration, Validators.required],
        syllabus: [subj.syllabus],
        subjectMaxMarks: [subj.subjectMaxMarks, Validators.min(1)]
      }));
    });
  }


}
