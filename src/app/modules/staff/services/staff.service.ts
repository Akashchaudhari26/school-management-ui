import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Page, Staff, StaffSearchFilter } from '../models/staff';
import { environment } from '../../../../environments/environment';
import { DropdownOption } from '../../student/services/student.service';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/staff`;

  search(filter: StaffSearchFilter): Observable<Page<Staff>> {
    return this.http.post<Page<Staff>>(`${this.apiUrl}/search`, filter);
  }

  create(staff: Staff): Observable<Staff> {
    return this.http.post<Staff>(this.apiUrl, staff);
  }

  update(id: string, staff: Staff): Observable<Staff> {
    return this.http.put<Staff>(`${this.apiUrl}/${id}`, staff);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getById(id: string): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiUrl}/${id}`);
  }

  getStaffTypes(): Observable<DropdownOption[]> {
    // REAL API CALL: return this.http.get<DropdownOption[]>(`${environment.apiUrl}/master/classes`);
    return of([
      { label: 'TEACHING', value: 'TEACHING' },
      { label: 'NON_TEACHING', value: 'NON_TEACHING' },
      { label: 'ADMIN', value: 'ADMIN' },
    ]);
  }

  getDesignations(): Observable<DropdownOption[]> {
    // REAL API CALL: return this.http.get<DropdownOption[]>(`${environment.apiUrl}/master/classes`);
    return of([
      { label: 'PRINCIPAL', value: 'PRINCIPAL' },
      { label: 'VICE PRINCIPAL', value: 'VICE PRINCIPAL' },
      { label: 'TEACHER', value: 'TEACHER' },
      { label: 'CLERK', value: 'CLERK' },
      { label: 'PEON', value: 'PEON' },
      { label: 'DRIVER', value: 'DRIVER' },
      { label: 'SECURITY', value: 'SECURITY' },
    ]);
  }
}
