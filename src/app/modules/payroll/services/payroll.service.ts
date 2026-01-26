import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PayrollTransaction, SalaryStructure } from '../models/payroll.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private readonly apiUrl = `${environment.apiUrl}/payroll`;

  constructor(private http: HttpClient) { }

  // 1. Save or Update Structure
  saveStructure(data: SalaryStructure): Observable<SalaryStructure> {
    return this.http.post<SalaryStructure>(`${this.apiUrl}/structure`, data);
  }

  // 2. Generate Draft Payroll (The Engine)
  generatePayroll(month: string, year: number): Observable<PayrollTransaction[]> {
    return this.http.post<PayrollTransaction[]>(`${this.apiUrl}/generate`, { month, year });
  }

  // 3. View History
  viewPayroll(month: string, year: number): Observable<PayrollTransaction[]> {
    return this.http.get<PayrollTransaction[]>(`${this.apiUrl}/view?month=${month}&year=${year}`);
  }

  // 4. Mark as Paid
  markAsPaid(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/pay`, {});
  }

  // 5. Get Data for Single Slip (Optional if you already have the data in the list)
  getPayslip(id: string): Observable<PayrollTransaction> {
    return this.http.get<PayrollTransaction>(`${this.apiUrl}/slip/${id}`);
  }

  // 6. Get My Personal History
  getMyHistory(staffId: string): Observable<PayrollTransaction[]> {
    return this.http.get<PayrollTransaction[]>(`${this.apiUrl}/history/${staffId}`);
  }
}