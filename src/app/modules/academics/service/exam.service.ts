import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BulkMarksRequest, ExamDefinition, ExamFilter, StudentReportCardResponse } from '../models/exam.types';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = `${environment.apiUrl}/exams`;

  private examListCache$ = new Map<string, Observable<ExamDefinition[]>>();

  constructor(private http: HttpClient) { }

  // 1. Fetch Class List + Existing Marks (The "Sheet")
  getMarkSheet(filter: ExamFilter): Observable<BulkMarksRequest> {
    return this.http.post<BulkMarksRequest>(`${this.apiUrl}/marks/sheet/fetch`, filter);
  }

  // 2. Save/Update Marks
  // Input: The full sheet data | Output: Simple success message
  saveBulkMarks(data: BulkMarksRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/marks/bulk`, data);
  }

  getStudentReportCard(filter: ExamFilter): Observable<StudentReportCardResponse> {
    return this.http.post<StudentReportCardResponse>(`${this.apiUrl}/report-card/fetch`, filter);
  }

  // 4. (Optional) Get Bulk Report Cards for entire class
  getClassReportCards(filter: ExamFilter): Observable<StudentReportCardResponse[]> {
    return this.http.post<StudentReportCardResponse[]>(`${this.apiUrl}/report-card/class/fetch`, filter);
  }

  createExamDefinition(examDefinition: ExamDefinition): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/definition/create`, examDefinition).pipe(
      tap(() => this.examListCache$.clear())
    );
  }

  getExamsByYear(academicYear: string): Observable<ExamDefinition[]> {
    if (!this.examListCache$.has(academicYear)) {

      const params = new HttpParams().set('academicYear', academicYear);

      const request$ = this.http.get<ExamDefinition[]>(`${this.apiUrl}/definition/list`, { params }).pipe(
        shareReplay(1)
      );

      this.examListCache$.set(academicYear, request$);
    }

    return this.examListCache$.get(academicYear)!;
  }

}