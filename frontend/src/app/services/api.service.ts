import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Machine {
  id: number;
  name: string;
  type: string;
  description: string;
  manufacturer?: string;
  model?: string;
}

export interface ErrorCode {
  id: number;
  code: string;
  meaning: string;
  description: string;
  troubleshootingSteps: string;
  machineId: number;
  machine?: Machine;
}

export interface Maintenance {
  id: number;
  task: string;
  description: string;
  frequency: string;
  steps: string;
  machineId: number;
  machine?: Machine;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Machine endpoints
  getMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.apiUrl}/machines`);
  }

  getMachine(id: number): Observable<Machine> {
    return this.http.get<Machine>(`${this.apiUrl}/machines/${id}`);
  }

  // Error code endpoints
  getErrorCodes(): Observable<ErrorCode[]> {
    return this.http.get<ErrorCode[]>(`${this.apiUrl}/error-codes`);
  }

  searchErrorCodes(keyword: string): Observable<ErrorCode[]> {
    return this.http.get<ErrorCode[]>(`${this.apiUrl}/error-codes/search?q=${encodeURIComponent(keyword)}`);
  }

  getErrorCodeByCode(code: string): Observable<ErrorCode[]> {
    return this.http.get<ErrorCode[]>(`${this.apiUrl}/error-codes/code/${code}`);
  }

  // Chat endpoint
  sendQuery(query: string, machineId?: number): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat/query`, {
      query,
      machineId: machineId || null,
    });
  }
}

