import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeeResponse, FeeCreateRequest, FeePaymentRequest, FeePayment } from '../models/fee.types';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class FeeService {
    private apiUrl = `${environment.apiUrl}/fees`;
    constructor(private http: HttpClient) { }

    // 1. Assign Fee (Create)
    createFee(request: FeeCreateRequest): Observable<FeeResponse> {
        return this.http.post<FeeResponse>(`${this.apiUrl}`, request);
    }

    // 2. Get Fee Details (Summary + Ledger)
    getFeeDetails(studentId: string, academicYear: string): Observable<FeeResponse> {
        return this.http.get<FeeResponse>(`${this.apiUrl}/student/${studentId}/${academicYear}`);
    }
    // 3. Make Payment
    payFee(studentId: string, academicYear: string, request: FeePaymentRequest): Observable<FeeResponse> {
        return this.http.post<FeeResponse>(
            `${this.apiUrl}/student/${studentId}/${academicYear}/pay`,
            request
        );
    }

    // 4. Get Defaulters (Dues)
    getPendingDues(academicYear: string): Observable<FeeResponse[]> {
        return this.http.get<FeeResponse[]>(`${this.apiUrl}/dues`, {
            params: { academicYear }
        });
    }
    // 5. Download Receipt (BLOB Handling)
    downloadReceipt(receiptNo: string): Observable<Blob> {
        // IMPORTANT: We must manually set responseType to 'blob'
        // otherwise Angular tries to parse the PDF as JSON and fails.
        return this.http.get(`${this.apiUrl}/receipt/${receiptNo}`, {
            responseType: 'blob'
        });
    }

    getPaymentHistory(studentId: string, academicYear: string): Observable<FeePayment[]> {
        return this.http.get<FeePayment[]>(
            `${this.apiUrl}/student/${studentId}/${academicYear}/payments`
        );
    }

    createBulkFees(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/bulk-create`, data);
    }

    saveFeeMaster(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}-masters`, data); // matches /api/fee-masters
    }

    getFeeMasters(academicYear: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}-masters/${academicYear}`);
    }
}