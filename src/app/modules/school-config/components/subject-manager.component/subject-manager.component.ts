import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SchoolClass, Subject } from '../../models/school-config';
import { SchoolConfigService } from '../../services/school-config.service';

@Component({
  selector: 'app-subject-manager.component',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './subject-manager.component.html',
  styleUrl: './subject-manager.component.css',
})
export class SubjectManagerComponent {

  classes: SchoolClass[] = [];
  allSubjects: Subject[] = [];

  // Model for the "Step 1" Form
  newSubject: Subject = { name: '', code: '', isOptional: false };

  // Model for "Step 2" Bulk Assign
  selectedClassId: string = '';
  currentClass: SchoolClass | null = null;

  isLoading = false;
  isSaving = false;

  constructor(private configService: SchoolConfigService) { }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.isLoading = true;

    // 1. Fetch Classes
    this.configService.getAllClasses().subscribe(data => {
      this.classes = data.sort((a, b) => a.order - b.order);
    });

    // 2. Fetch All Subjects (For the checklist)
    this.configService.getAllSubjects().subscribe({
      next: (data) => {
        this.allSubjects = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // --- Step 1: Create Subject ---
  createSubject() {
    if (!this.newSubject.code) return;
    this.newSubject.id = `SUB_${this.newSubject.code.toUpperCase().replace(/\s/g, '')}`;

    this.configService.createSubject(this.newSubject).subscribe({
      next: (res) => {
        alert('Subject Created!');
        this.allSubjects.push(res); // Add to local list immediately
        this.newSubject = { name: '', code: '', isOptional: false };
      },
      error: () => alert('Error: Subject Code might already exist.')
    });
  }

  // --- Step 2: Manage Assignments ---

  // When user changes the Class Dropdown
  onClassSelect() {
    this.currentClass = this.classes.find(c => c.id === this.selectedClassId) || null;
  }

  // Check if a subject is currently assigned to the selected class
  isSubjectAssigned(subjectId: string | undefined): boolean {
    if (!this.currentClass || !this.currentClass.subjectNames || !subjectId) return false;
    return this.currentClass.subjectNames.includes(subjectId);
  }

  // Toggle Checkbox
  toggleSubject(subjectId: string | undefined, event: any) {
    if (!this.currentClass || !subjectId) return;

    const isChecked = event.target.checked;

    // Initialize array if null
    if (!this.currentClass.subjectNames) {
      this.currentClass.subjectNames = [];
    }

    if (isChecked) {
      // Add if not present
      if (!this.currentClass.subjectNames.includes(subjectId)) {
        this.currentClass.subjectNames.push(subjectId);
      }
    } else {
      // Remove if present
      this.currentClass.subjectNames = this.currentClass.subjectNames.filter(id => id !== subjectId);
    }
  }

  // Save the Entire Class Object
  saveAssignments() {
    if (!this.currentClass) return;

    this.isSaving = true;
    this.configService.updateClass(this.currentClass.id, this.currentClass).subscribe({
      next: (updatedClass) => {
        alert('Class Subjects Updated Successfully!');
        this.isSaving = false;
        // Update local list
        const index = this.classes.findIndex(c => c.id === updatedClass.id);
        if (index !== -1) this.classes[index] = updatedClass;
      },
      error: () => {
        alert('Failed to update class.');
        this.isSaving = false;
      }
    });
  }

  getTotalAssignments(): number {
    return this.classes.reduce((sum, cls) => sum + (cls.subjectNames ? cls.subjectNames.length : 0), 0);
  }

  subjectSearchTerm: string = '';

  // Add this Getter to filter subjects in real-time
  get filteredSubjects() {
    // If search is empty, return everything
    if (!this.subjectSearchTerm.trim()) {
      return this.allSubjects;
    }

    const term = this.subjectSearchTerm.toLowerCase();

    // Filter by Name OR Code (e.g., "Math" or "NUR_MATH")
    return this.allSubjects.filter(sub =>
      sub.name.toLowerCase().includes(term) ||
      sub.code.toLowerCase().includes(term)
    );
  }
}
