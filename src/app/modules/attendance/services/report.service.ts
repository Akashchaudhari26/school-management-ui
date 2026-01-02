import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AttendanceReportDTO } from '../models/attendance-reports';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  // 1. Monthly Summary
  getClassMonthlySummary(classId: string, section: string, month: number, year: number) {
    const params = new HttpParams()
      .set('classId', classId)
      .set('section', section)
      .set('month', month)
      .set('year', year);

    return this.http.get<AttendanceReportDTO[]>(`${this.apiUrl}/summary/class`, { params });
  }

  // 2. Defaulters (Low Attendance)
  getDefaulters(classId: string, section: string, threshold: number = 75) {
    const params = new HttpParams()
      .set('classId', classId)
      .set('section', section)
      .set('threshold', threshold);

    return this.http.get<AttendanceReportDTO[]>(`${this.apiUrl}/defaulters`, { params });
  }

  // 3. Consecutive Absentees
  getConsecutiveAbsentees(days: number = 3) {
    return this.http.get<AttendanceReportDTO[]>(`${this.apiUrl}/consecutive-absent`, {
      params: { days }
    });
  }
}
