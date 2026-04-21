import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatQueryRequest {
  query: string;
  machineId?: number;
}

export interface ImageDiagnosisRequest {
  imageDataUrl: string;
  machineId?: number;
  note?: string;
}

export interface ParameterDiagnosisRequest {
  machineId?: number;
  machineType?: string;
  temperatureC: number;
  vibrationMmS: number;
  currentA: number;
  oilPressureBar?: number;
  rpm: number;
  runtimeHours: number;
  noiseLevel: 'normal' | 'unusual';
  leakObserved: boolean;
  note?: string;
}

export interface ChatQueryResponse {
  response: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  query(request: ChatQueryRequest): Observable<ChatQueryResponse> {
    return this.http.post<ChatQueryResponse>(`${this.apiUrl}/chat/query`, request);
  }

  diagnoseImage(request: ImageDiagnosisRequest): Observable<ChatQueryResponse> {
    return this.http.post<ChatQueryResponse>(`${this.apiUrl}/chat/diagnose-image`, request);
  }

  diagnoseParameters(request: ParameterDiagnosisRequest): Observable<ChatQueryResponse> {
    return this.http.post<ChatQueryResponse>(`${this.apiUrl}/chat/diagnose-parameters`, request);
  }
}
