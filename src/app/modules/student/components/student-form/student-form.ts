import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, startWith, switchMap } from 'rxjs/operators'; // Import finalize for cleaner subscription
import { DropdownOption, StudentService } from '../../services/student.service';
import { Gender } from '../../models/student';
import { Observable, of } from 'rxjs';
import { SchoolConfigService } from '../../../school-config/services/school-config.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentForm implements OnInit {
  // Dependencies
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private schoolConfigService = inject(SchoolConfigService);

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  public location = inject(Location); // Used for "Back" button

  // Form & State
  studentForm!: FormGroup;
  isEditMode = false;
  studentId: string | null = null;
  genders = Object.values(Gender);
  isLoading = false;

  constructor() {
    this.initForm();
    this.loadActiveYear();
  }
  // 🚀 Dynamic Data Streams
  classes$: Observable<DropdownOption[]> = this.studentService.getClasses();
  sections$: Observable<DropdownOption[]> = of([]);

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id');

    if (this.studentId) {
      this.isEditMode = true;
      this.handleEditMode();
    } else {
      this.addGuardian(); // Default guardian for new admissions
    }
    const classFilter = this.studentForm.get('currentClassId');

    if (classFilter) {
      this.sections$ = classFilter.valueChanges.pipe(
        startWith(classFilter.value || ''),
        switchMap(id => this.studentService.getSections(id || ''))
      );
    }

  }

  // --- Logic Helpers ---

  private handleEditMode() {
    // 1. Try loading from Router State (Instant Transition)
    const navState = history.state;
    console.log(navState)
    if (navState?.student?.id === this.studentId) {
      console.log('⚡ Loaded from State');
      this.populateForm(navState.student);
    } else {
      // 2. Fallback to API
      console.log('🔄 Fetching from API');
      this.loadStudentData(this.studentId!);
    }
  }

  private loadStudentData(id: string) {
    this.isLoading = true;
    this.cdr.markForCheck(); // Update UI for loading spinner

    this.studentService.getById(id)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (data) => this.populateForm(data),
        error: (err) => console.error('Error loading student:', err)
      });
  }

  private populateForm(data: any) {
    this.studentForm.patchValue(data);

    this.guardiansArray.clear();
    if (data.guardians?.length) {
      data.guardians.forEach((g: any) => {
        const group = this.newGuardianGroup();
        group.patchValue(g);
        this.guardiansArray.push(group);
      });
    } else {
      this.addGuardian();
    }

    this.cdr.markForCheck();
  }

  // --- Form Setup ---

  private initForm() {
    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: [Gender.MALE, Validators.required],
      adharNumber: ['', [Validators.pattern(/^\d{12}$/)]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],

      // Academic
      admissionYear: [new Date().getFullYear(), Validators.required],
      admissionNumber: [''],
      currentClassId: ['', Validators.required],
      currentSection: ['A'],
      currentAcademicYear: ['', Validators.required],

      guardians: this.fb.array([])
    }, { updateOn: 'blur' }); // Optimization: validate only on blur
  }

  // --- Getters & Form Arrays ---

  get f() { return this.studentForm.controls; }
  get guardiansArray() { return this.studentForm.get('guardians') as FormArray; }

  newGuardianGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      relation: ['FATHER', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', Validators.email],
      adharNumber: ['', [Validators.pattern(/^\d{12}$/)]],
      primary: [false]
    }, { updateOn: 'blur' });
  }

  addGuardian() {
    const group = this.newGuardianGroup();
    if (this.guardiansArray.length === 0) {
      group.get('primary')?.setValue(true);
    }
    this.guardiansArray.push(group);
  }

  removeGuardian(index: number) {
    this.guardiansArray.removeAt(index);
  }

  // --- Submission ---

  onSubmit() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const payload = this.studentForm.value;
    const request$ = (this.isEditMode && this.studentId)
      ? this.studentService.update(this.studentId, payload)
      : this.studentService.create(payload);

    request$
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => this.router.navigate(['/dashboard/students']),
        error: (err) => console.error('Submission failed:', err)
      });
  }

  private loadActiveYear() {
    this.schoolConfigService.getActiveAcademicYear().subscribe({
      next: (year) => {
        if (year) {
          this.studentForm.patchValue({
            currentAcademicYear: year.name // e.g., "2025-2026"
          });
        }
      },
      error: (err) => console.error('Failed to load active year', err)
    });
  }
}