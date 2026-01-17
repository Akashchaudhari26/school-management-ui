import { Component, inject } from '@angular/core';
import { COMMON_IMPORTS } from '../../../../shared.imports';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownOption, StudentService } from '../../services/student.service';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';
import { Observable, of, startWith, switchMap } from 'rxjs';
import { AcademicYear } from '../../../school-config/models/school-config';

@Component({
  selector: 'app-promote-student.component',
  imports: [COMMON_IMPORTS],
  templateUrl: './promote-student.component.html',
  styleUrl: './promote-student.component.css',
})
export class PromoteStudentComponent {

  private studentService = inject(StudentService);

  // Search Form
  filterForm: FormGroup;

  // Bulk Settings Form
  targetForm: FormGroup;

  classes$: Observable<DropdownOption[]> = this.studentService.getClasses();
  sections$: Observable<DropdownOption[]> = of([]);

  targetClasses$: Observable<DropdownOption[]> = this.studentService.getClasses();
  targetSections$: Observable<DropdownOption[]> = of([]);

  studentList: any[] = [];


  isLoading = false;
  isSubmitting = false;

  academicYears: AcademicYear[] = [];


  constructor(
    private fb: FormBuilder,
    private configService: SchoolConfigService
  ) {
    // 1. Source Filter
    this.filterForm = this.fb.group({
      classId: ['', Validators.required],
      section: ['', Validators.required],
    });

    // 2. Target Settings (Where to move them?)
    this.targetForm = this.fb.group({
      targetClassId: ['', Validators.required],
      targetSection: ['', Validators.required],
      targetYear: ['', Validators.required],
      defaultAction: ['PROMOTE']
    });
  }

  ngOnInit() {
    const classFilter = this.filterForm.get('classId');
    const targetClassFilter = this.targetForm.get('targetClassId');

    if (classFilter) {
      this.sections$ = classFilter.valueChanges.pipe(
        startWith(classFilter.value || ''),
        switchMap(id => this.studentService.getSections(id || ''))
      );
    }
    if (targetClassFilter) {
      this.targetSections$ = targetClassFilter.valueChanges.pipe(
        startWith(targetClassFilter.value || ''),
        switchMap(id => this.studentService.getSections(id || ''))
      );
    }
    this.loadAcademicYears()
  }

  loadAcademicYears() {
    // Fetch all years so the admin can select a past year if needed
    this.configService.getAllAcademicYears().subscribe(years => {
      this.academicYears = years;

      // 4. Find the ACTIVE year and set it as default
      const activeYear = years.find(y => y.active); // Assuming 'active' is the boolean flag
      if (activeYear) {
        this.targetForm.patchValue({ targetYear: activeYear.name });
      }
    });
  }

  // --- Step 1: Fetch Students ---
  fetchStudents() {
    if (this.filterForm.invalid) return;
    this.isLoading = true;

    const filter = {
      ...this.filterForm.value,
      status: 'ACTIVE',
      size: 100 // Get all
    };

    this.studentService.search(filter).subscribe({
      next: (res: any) => {
        // Map students and add 'ui' controls for the form
        this.studentList = res.content.map((s: any) => ({
          ...s,
          selected: true, // Auto-select all
          action: 'PROMOTE', // Default action
          overrideClass: null // If they want to manually change one student's target
        }));

        // Auto-set Target Class based on logic (e.g., Nursery -> LKG)
        this.autoSuggestTarget();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  autoSuggestTarget() {
    // const currentClass = this.filterForm.get('classId')?.value;
    // const idx = this.classes$.findIndex(c => c.name === currentClass);
    // if (idx > -1 && idx < this.classes$.length - 1) {
    //   this.targetForm.patchValue({ targetClassId: this.classes$[idx + 1].name });
    // }
  }

  // --- Step 2: Submit Promotion ---
  onPromote() {
    if (this.targetForm.invalid) return;
    if (!confirm('Are you sure you want to promote these students? This changes their class permanently.')) return;

    this.isSubmitting = true;
    const targetSettings = this.targetForm.value;

    // Build Payload
    const payload = {
      targetAcademicYear: targetSettings.targetYear,
      students: this.studentList
        .filter(s => s.selected) // Only process selected
        .map(s => ({
          studentId: s.id,
          promotionStatus: s.action, // PROMOTE / RETAIN / DEMOTE

          // Logic: If Action is RETAIN, keep old class. 
          // If PROMOTE, use Target Class (or row-specific override)
          targetClassId: s.action === 'RETAIN'
            ? this.filterForm.get('classId')?.value
            : (s.overrideClass || targetSettings.targetClassId),

          targetSection: s.action === 'RETAIN'
            ? this.filterForm.get('section')?.value
            : targetSettings.targetSection
        }))
    };

    this.studentService.promoteStudents(payload).subscribe({
      next: () => {
        alert('Promotion Successful!');
        this.isSubmitting = false;
        this.studentList = []; // Clear list
        this.targetForm.reset();
      },
      error: () => {
        alert('Failed to promote.');
        this.isSubmitting = false;
      }
    });
  }

  // Toggle All Checkbox
  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.studentList.forEach(s => s.selected = isChecked);
  }
}
