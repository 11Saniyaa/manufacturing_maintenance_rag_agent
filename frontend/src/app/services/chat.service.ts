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
}
