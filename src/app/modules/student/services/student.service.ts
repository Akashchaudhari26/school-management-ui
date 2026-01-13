import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Page, Student } from '../models/student';
import { StudentSearchFilter } from '../models/student-filter';
import { SchoolConfigService } from '../../school-config/services/school-config.service';

export interface DropdownOption {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private http = inject(HttpClient);
  private configService = inject(SchoolConfigService);

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
    return this.configService.getAllClasses().pipe(
      map(classes =>
        classes
          // 1. Sort by Order (Nursery -> LKG -> 1...)
          .sort((a, b) => a.order - b.order)
          // 2. Map to Dropdown Format
          .map(c => ({
            label: c.displayName,
            value: c.id
          }))
      )
    );
  }

  getSections(classId: string): Observable<DropdownOption[]> {
    if (!classId) return of([]);

    return this.configService.getAllClasses().pipe(
      map(classes => {
        const selectedClass = classes.find(c => c.id === classId);
        if (selectedClass && selectedClass.sections) {
          return selectedClass.sections.map(s => ({
            label: s.name,
            value: s.name
          }));
        }
        return [];
      })
    );
  }

  private readonly MONTHS: DropdownOption[] = [
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
  ];


  getMonths(): Observable<DropdownOption[]> {
    return of(this.MONTHS);
  }
}
