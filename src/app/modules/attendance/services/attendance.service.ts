import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceCreateRequest, AttendanceResponse, AttendanceSummaryStats, UserType } from '../attendance.model';
import { environment } from '../../../../environments/environment.development';
import { AttendanceStats } from '../models/attendance-stats';

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

  getMonthlyAttendance(classId: string, section: string, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

    // ❌ OLD: return this.http.get<any[]>(`${this.apiUrl}/range`, { params: { classId, section, startDate, endDate } });

    // ✅ NEW: Matches the Controller structure we just made
    return this.http.get<any[]>(
      `${this.baseUrl}/class/${classId}/section/${section}/range`,
      { params: { startDate, endDate } }
    );
  }

  getDailyStats(userType: 'STUDENT' | 'STAFF', date: string) {
    return this.http.get<AttendanceStats>(`${this.baseUrl}/stats`, {
      params: { userType, date }
    });
  }
}