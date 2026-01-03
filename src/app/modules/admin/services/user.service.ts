import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../core/services/auth';



@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/users';

  // 1. Fetch All Users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // 2. Delete User
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 3. Toggle Status (Active/Inactive)
  updateStatus(id: string, status: string): Observable<any> {
    // ✅ FIX: Add { responseType: 'text' } here
    return this.http.patch(`${this.apiUrl}/${id}/status`, null, {
      params: { status },
      responseType: 'text'
    });
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}