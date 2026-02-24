import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatRequest {
  query: string;
  machineId?: number;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  sendMessage(query: string, machineId?: number): Observable<ChatResponse> {
    const body: ChatRequest = {
      query,
      machineId
    };
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat/query`, body);
  }
}
