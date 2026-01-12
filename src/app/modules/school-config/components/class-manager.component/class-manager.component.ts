import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SchoolClass, Section } from '../../models/school-config';
import { SchoolConfigService } from '../../services/school-config.service';

@Component({
  selector: 'app-class-manager.component',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './class-manager.component.html',
  styleUrl: './class-manager.component.css',
})
export class ClassManagerComponent {
  classes: SchoolClass[] = [];
  isLoading = false;

  // Dashboard Metrics
  totalSections = 0;
  totalCapacity = 0;

  // Form Models
  newClass: SchoolClass = {
    id: '',
    displayName: '',
    program: 'Pre-Primary',
    order: 0,
    sections: [],
    subjectIds: []
  };

  // Helper for adding sections (mapped by class ID)
  newSectionNames: { [key: string]: string } = {};

  constructor(private configService: SchoolConfigService) { }

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses() {
    this.isLoading = true;
    this.configService.getAllClasses().subscribe({
      next: (data) => {
        // Sort by Order (1, 2, 3...)
        this.classes = data.sort((a, b) => a.order - b.order);
        this.calculateMetrics();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  calculateMetrics() {
    this.totalSections = 0;
    this.totalCapacity = 0;
    this.classes.forEach(c => {
      this.totalSections += c.sections.length;
      c.sections.forEach(s => this.totalCapacity += s.capacity);
    });
  }

  createClass() {
    if (!this.newClass.displayName || !this.newClass.id) return;

    this.configService.createClass(this.newClass).subscribe({
      next: (res) => {
        alert('Class Created Successfully!');
        this.newClass = { id: '', displayName: '', program: 'Pre-Primary', order: this.classes.length + 1, sections: [], subjectIds: [] };
        this.loadClasses();
      },
      error: (err) => alert('Error: Class ID might already exist.')
    });
  }

  addSection(classId: string) {
    const name = this.newSectionNames[classId];
    if (!name) return;

    const section: Section = { name: name, capacity: 40 }; // Default capacity 40

    this.configService.addSection(classId, section).subscribe({
      next: () => {
        this.newSectionNames[classId] = ''; // Clear input
        this.loadClasses(); // Refresh list
      },
      error: () => alert('Failed to add section')
    });
  }
}
