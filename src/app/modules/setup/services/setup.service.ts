import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SetupStatus } from '../models/setup-status.model';
import { environment } from '../../../../environments/environment.development';
import { SetupApplicationRequest } from '../models/setup-application-request.model';

@Injectable({
  providedIn: 'root'
})
export class SetupService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/setup`;

  /**
   * Check whether the application has already been initialized.
   */
  getStatus(): Observable<SetupStatus> {
    return this.http.get<SetupStatus>(
      `${this.apiUrl}/status`
    );
  }

  /**
   * Initialize the school management system.
   */
  initialize(request: SetupApplicationRequest): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/initialize`,
      request
    );
  }

}