import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page, Student } from '../models/student';
import { StudentSearchFilter } from '../models/student-filter';

export interface DropdownOption {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  // Uses the centralized URL
  private apiUrl = `${environment.apiUrl}/students`;

  create(student: Student): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  update(id: string, student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  getById(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  // Search with Pagination
  search(filter: StudentSearchFilter): Observable<Page<Student>> {
    // We use POST because we are sending a complex object (body)
    return this.http.post<Page<Student>>(`${this.apiUrl}/search`, filter);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getClasses(): Observable<DropdownOption[]> {
    // REAL API CALL: return this.http.get<DropdownOption[]>(`${environment.apiUrl}/master/classes`);
    return of([
      { label: 'Nursery', value: 'NURSERY' },
      { label: 'LKG', value: 'LKG' },
      { label: 'UKG', value: 'UKG' },
      { label: 'Class 1', value: '1' },
      { label: 'Class 2', value: '2' },
      { label: 'Class 3', value: '3' }
    ]);
  }

  // 🚀 DYNAMIC SECTIONS
  getSections(): Observable<DropdownOption[]> {
    // REAL API CALL: return this.http.get<DropdownOption[]>(`${environment.apiUrl}/master/sections`);

    return of([
      { label: 'Section A', value: 'A' },
      { label: 'Section B', value: 'B' },
      { label: 'Section C', value: 'C' },
      { label: 'Section D', value: 'D' }
    ]);
  }

  getMonths(): Observable<DropdownOption[]> {
    return of([
      { label: 'January', value: '1' },
      { label: 'February', value: '2' },
      { label: 'March', value: '3' },
      { label: 'April', value: '4' },
      { label: 'May', value: '5' },
      { label: 'June', value: '6' },
      { label: 'July', value: '7' },
      { label: 'August', value: '8' },
      { label: 'September', value: '9' },
      { label: 'October', value: '10' },
      { label: 'November', value: '11' },
      { label: 'December', value: '12' }
    ]);
  }
}
