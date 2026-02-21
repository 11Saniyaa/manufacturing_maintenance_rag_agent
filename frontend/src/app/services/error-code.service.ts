import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ErrorCode {
  id: number;
  code: string;
  meaning: string;
  description: string;
  troubleshootingSteps: string;
  machineId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorCodeService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  searchErrorCodes(keyword: string): Observable<ErrorCode[]> {
    const params = new HttpParams().set('q', keyword);
    return this.http.get<ErrorCode[]>(`${this.apiUrl}/error-codes/search`, { params });
  }

  getAllErrorCodes(): Observable<ErrorCode[]> {
    return this.http.get<ErrorCode[]>(`${this.apiUrl}/error-codes`);
  }
}


