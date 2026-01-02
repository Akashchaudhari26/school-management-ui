import { inject, Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LeaveRequest, LeaveStatus } from '../models/leave.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private http = inject(HttpClient);

  // Base URL: http://localhost:8080/api/leaves
  private apiUrl = `${environment.apiUrl}/leaves`;

  // 1. Get All Leaves (For Admin)
  getAllLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/all`);
  }

  // 2. Get My Leaves (For Staff/Teachers)
  getMyLeaves(userId: string): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/my/${userId}`);
  }

  // 3. Apply for Leave
  applyLeave(request: Partial<LeaveRequest>): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${this.apiUrl}/apply`, request);
  }

  // 4. Update Status (Approve/Reject)
  updateStatus(id: string, status: LeaveStatus, reason?: string): Observable<LeaveRequest> {
    let params = new HttpParams().set('status', status);

    if (reason) {
      params = params.set('reason', reason);
    }

    return this.http.put<LeaveRequest>(`${this.apiUrl}/${id}/status`, {}, { params });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}