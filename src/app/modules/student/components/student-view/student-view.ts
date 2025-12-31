import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student';

@Component({
  selector: 'app-student-view',
  imports: [CommonModule, RouterModule],
  templateUrl: './student-view.html',
  styleUrl: './student-view.css',
})
export class StudentView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  public location = inject(Location); // Used for "Back" button

  student: Student | null = null;
  isLoading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const navState = history.state;
    console.log(navState.student)
    if (navState?.student?.id === id) {
      console.log('⚡ Loaded from State');
      this.student = navState.student;
    } else {
      // 2. Fallback to API
      console.log('🔄 Fetching from API');
      if (id)
        this.fetchStudent(id);
    }
  }

  fetchStudent(id: string) {
    this.studentService.getById(id).subscribe({
      next: (data) => {
        this.student = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  deleteStudent() {
    if (!this.student) return;
    if (confirm(`Are you sure you want to delete ${this.student.firstName}?`)) {
      this.studentService.delete(this.student.id!).subscribe(() => {
        this.router.navigate(['/dashboard/students']);
      });
    }
  }
}
