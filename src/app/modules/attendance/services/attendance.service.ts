import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceCreateRequest, AttendanceResponse, AttendanceSummaryStats, UserType } from '../attendance.model';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private baseUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) { }

  getClassAttendance(
    classId: string,
    sectionId: string,
    date: string
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/class/${classId}/section/${sectionId}?date=${date}`
    );
  }

  markBulkAttendance(payload: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulk`, payload);
  }
}